const pg = require('pg');

let client = null;
let connected = false;
let attemptCnt = 0;

const pgpwd = process.env.POSTGRES_PASSWORD;
const pghost = process.env.POSTGRES_HOST;

const initDb = () => {
  if(!pgpwd) {
    console.log('Database pwd not set.. not connecting');
    return;
  }
  reconnect(0);
}

const reconnect = (delay) => {
  attemptCnt++;
  setTimeout(async () => {
    console.log(`[${attemptCnt}] Attempting to ${attemptCnt == 1 ? 'connect' : 'reconnect'}`);
    const rsp = await setupDb();
    if(rsp !== 1) {
      console.log(`[${attemptCnt}] Unable to connect to db.. Reattempting connection in 10s..`);
      reconnect(10000);
    } else {
      console.log(`[${attemptCnt}] Connected..`);
    }
  }, delay);
};

const getClient = () => {
  return client;
}

const isConnected = () => {
  return connected;
}

const setupDb = async () => {
  client = new pg.Client({
      user: 'postgres',
      host: pghost || 'localhost',
      password: pgpwd,
      database: 'postgres'
    });

  try {
    await client.connect();
    await client.query('create table IF NOT EXISTS todos (id uuid, content text, done boolean);');
    connected = true;
    return 1;
  } catch(err) {
    if(err.code === 'ECONNREFUSED' || err.code === 'EAI_AGAIN' || err.code === 'ENOTFOUND') {
      client.end();
      delete client;
      return 0;
    }
    console.log(err);
    return -1;
  }
}

module.exports = {
    getClient,
    isConnected,
    initDb,
};
