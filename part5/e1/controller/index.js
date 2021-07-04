const k8s = require('@kubernetes/client-node');
const Got = require('got');
const fs = require("fs");
const Stream = require('stream');
const { promisify } = require('util');
const JSONStream = require('json-stream');
const Handlebars = require('handlebars');

const alpha = '0123456789abcdefghijklmnopqrstuvwxyz';
const shortUuid = require('short-uuid')(alpha);

const pipeline = promisify(Stream.pipeline);
const readFile = promisify(fs.readFile);

const kc = new k8s.KubeConfig();

process.env.NODE_ENV === 'dev' ? kc.loadFromDefault() : kc.loadFromCluster();

const server = kc.getCurrentCluster().server;
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// Create options for GOT
const tempOpts = {};
kc.applyToRequest(tempOpts);
const gotOpts = process.env.NODE_ENV === 'dev' ? {
  https: {
    certificateAuthority: tempOpts.ca,
    key: tempOpts.key,
    certificate: tempOpts.cert
  }
} : {
  headers: tempOpts.headers,
  https: {
    certificateAuthority: tempOpts.ca,
  }
};

//
let sites = [];
const deployments = [];
let deploymentTemplate;

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Create / delete deployment
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const createDeployment = async (item) => {
  const name = `ds-${shortUuid.fromUUID(item.uid)}`;

  const body = deploymentTemplate({
    sitePath: item.uid,
    siteHost: item.url.replace(/^http[s]?:\/\//i,'').replace('/[\/\s]/g',''),
    containerName: `${name}-cont`,
    deploymentLabel: name,
    deploymentName: `${name}-dep`
  });

  const rsp = await Got.post(`${server}/apis/apps/v1/namespaces/default/deployments`, {
    ...gotOpts,
    headers: {
      ...gotOpts.headers,
      'Content-Type': 'application/yaml'
    },
    body
  });

  console.log('>> Deployment created');
}

const deleteDeployment = async (name) => {
  const rsp = await Got.delete(`${server}/apis/apps/v1/namespaces/default/deployments/${name}`, gotOpts );
  console.log(deployments);
  console.log('>> Deployment deleted');
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Site management
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const downloadSite = async (item) => {
  const path = `/shared/${item.uid}`;

  // Try to get path info
  let pathStat = null;
  try {
    pathStat = fs.statSync(path);
  } catch(err) {
    if(err.code !== 'ENOENT') {
      console.log(err);
    }
  }

  // Create directory
  if(!pathStat) {
    fs.mkdirSync(path);
  } else if(pathStat.isDirectory()) {
    return false;
  }

  // Download index
	await pipeline(
		Got.stream(`${item.url}`),
    fs.createWriteStream(`${path}/index.html`)
	);

  return true;
}

const createSites = async (item) => {
  for(const site of sites) {

    // Site has been already processed
    if(site.state === 'ADDED' || !site.url) {
      continue;
    }

    console.log(`Processing site: ${site.url}`)

    // Download index
    const downloadResult = await downloadSite(site);
    if(downloadResult) {
      console.log(`>> Site (${site.url}) downloaded`);
    } else {
      console.log(`>> Site (${site.url}) already exists`);
    }

    // Create deployment if it doesn't exist
    if( !deployments.some( (d) => d.uid === site.uid ) ) {
      createDeployment(site);
    }

    site.state = 'ADDED';
  }
}

const removeSite = async (item) => {
  if(item.kind !== 'DummySite') {
    return;
  }

  const name = `ds-${shortUuid.fromUUID(item.metadata.uid)}-dep`;
  console.log('REMOVE: ', name);

  // Remove site from internal cache + delete deployment
  sites = sites.filter( (s) => s.uid !== item.metadata.uid);
  await deleteDeployment(name)
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Item processors
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const processSite = (item) => {
  if(item.kind === 'DummySite' && !sites.some( (s) => s.uid === item.metadata.uid )) {
    sites.push({
      uid: item.metadata.uid,
      url: item.spec.website_url,
      state: 'UNKNOWN'
    });
  }
}

const processDeployment = (item) => {
  const name = item.metadata.name;
  const reg = /^ds-([a-z0-9]*)-dep$/i;
  const matches = name.match(reg);
  if( matches ) {
    deployments.push({
      name,
      uid: shortUuid.toUUID(matches[1])
    });
  }
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Listen for site objects
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
(async () => {
  const rawTmpl = ( await readFile('deploy_template.hbs') ).toString();
  deploymentTemplate = Handlebars.compile(rawTmpl);

  // Get initial status
  try {
    const { body: initialDeployments } = await Got.get(`${server}/apis/apps/v1/namespaces/default/deployments`, gotOpts);
    const items = JSON.parse(initialDeployments).items || [];
    items.forEach( (item) => processDeployment(item) );
  } catch(err) {
    console.log('Error while fetching deployments', err);
  }
  try {
    const { body: initialSites } = await Got.get(`${server}/apis/stable.dwk/v1/dummysites`, gotOpts);
    const items = JSON.parse(initialSites).items || [];
    items.forEach( (item) => processSite(item) );
  } catch(err) {
    console.log('Error while fetching dummysites', err);
  }

  await createSites();

  // Start watching changes
  const deploymentStream = new JSONStream();
  deploymentStream.on('data', (data) => {
    const { type } = data;

    if(type === 'ADDED') {
      processDeployment(data.object);
    } else if(type === 'DELETED') {
      console.log('DELETED',data.object.metadata.name);
    } else {
      // console.log('d',data);
    }
  });

  const siteStream = new JSONStream();
  siteStream.on('data', async (data) => {
    const { type } = data;

    if(type === 'ADDED') {
      processSite(data.object);
      await createSites();
    } else if(type === 'DELETED') {
      await removeSite(data.object);
    } else {
      // console.log('s',data);
    }
  });

	pipeline(
		Got.stream(`${server}/apis/apps/v1/namespaces/default/deployments?watch=true`, gotOpts),
    deploymentStream
	);

	pipeline(
		Got.stream(`${server}/apis/stable.dwk/v1/dummysites?watch=true`, gotOpts),
    siteStream
	);

})();
