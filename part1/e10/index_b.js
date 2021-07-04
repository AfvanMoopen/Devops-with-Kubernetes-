const fs = require('fs');
const Uuid = require('uuid');
const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;
const str = Uuid.v4();

let prevStamp = '';
let pongCount = '';

const readStamp = () => {

  if(fs.existsSync('/shared/timestamp.txt')) {
    fs.readFile('/shared/timestamp.txt', 'ascii', (err, data) => {
      if(data !== prevStamp) {
        console.log(`${data} ${str}`);
        prevStamp = data;
      }
    })
  }

  if(fs.existsSync('/shared/pongcount.txt')) {
    fs.readFile('/shared/pongcount.txt', 'ascii', (err, data) => {
      pongCount = data;
    })
  }

}


app.get('/', (req, res) => {
  const page = `
${prevStamp} ${str}
Ping / Pongs: ${pongCount}
`;
  res.send(page);
});

app.listen(port, () => {
  readStamp();
  setInterval( () => {
    readStamp();
  }, 2000);
});

