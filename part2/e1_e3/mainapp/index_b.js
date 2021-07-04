const fs = require('fs');
const Uuid = require('uuid');
const express = require('express');
const Got = require('got');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const str = Uuid.v4();

let prevStamp = '';

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

  const { body: rspBody } = await Got('http://pongapp-service:2345/count');
  const { count } = JSON.parse(rspBody);

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
  readStamp();
  setInterval( () => {
    readStamp();
  }, 2000);
});

