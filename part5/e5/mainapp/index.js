const Uuid = require('uuid');
const express = require('express');

require('dotenv').config();

const { initDb, getClient } = require('./database');

const app = express();
const port = process.env.PORT || 8080;
const str = Uuid.v4();

// Setup database
initDb();

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

  const page = `
${str}
Ping / Pongs: ${count}
`;

  const message = process.env.MESSAGE;
  res.send(!message ? page : `
${message}
${page}
`)
});

app.listen(port, () => {
  console.log(`Main app listening on ${port}`);
});