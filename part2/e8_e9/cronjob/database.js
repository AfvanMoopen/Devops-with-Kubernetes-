const pg = require('pg');

let client = null;

const pgpwd = process.env.POSTGRES_PASSWORD;
const pghost = process.env.POSTGRES_HOST;

const initDb = async () => {
  if(!pgpwd) {
    console.log('Database pwd not set.. not connecting');
    return;
  }

  const rspCode = await setupDb();
  if(rspCode === 0) {
    console.log('Unable to connect to db.. Reattempting connection in 10s..');
    setTimeout(async () => {
      console.log('Attempting to reconnect');
      const rsp = await setupDb();
      if(rsp !== 1) {
        console.log('Unable to connect to db');
        process.exit(-1);
      }
      console.log('Connected..');
    }, 10000);
  } else if(rspCode === 1) {
    console.log('Connected.');
  }
}

const getClient = () => {
  return client;
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
    initDb,
    getClient
};