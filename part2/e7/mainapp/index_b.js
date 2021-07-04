const fs = require('fs');
const Uuid = require('uuid');
const express = require('express');
const pg = require('pg');

require('dotenv').config();

const { initDb, getClient } = require('./database');

const app = express();
const port = process.env.PORT || 3000;
const str = Uuid.v4();

let prevStamp = '';

// Setup database
initDb();

//
const readStamp = () => {
  if(fs.existsSync('/shared/timestamp.txt')) {
    fs.readFile('/shared/timestamp.txt', 'ascii', (err, data) => {
      if(data !== prevStamp) {
        console.log(`${data} ${str}`);
        prevStamp = data;
      }
    })
  }
}

app.get('/', async (req, res) => {
  let count = 0;

  const client = getClient();
  if(client) {
    try {
      const rsp = await client.query(`select value from appvalues where name='count'`);
      if(rsp.rows.length === 1) {
        count = rsp.rows[0].value;
      }  
    } catch(err) {
      console.log(err);
    }
  }

  let page = `
${prevStamp} ${str}
Ping / Pongs: ${count}
`;

  const message = process.env.MESSAGE;
  if(message) {
    page = `
${message}
${page}
`;
  }

  res.send(page);
});

app.listen(port, () => {
  console.log(`Main app (B) listening on ${port}`);

  readStamp();
  setInterval( () => {
    readStamp();
  }, 2000);
});

