const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;
let count = 0;

const writePongCount = () => {
  if(fs.existsSync('/shared')) {
    fs.writeFile('/shared/pongcount.txt', `${count}`, () => {});
  }
};

app.get('/', (req, res) => {
  res.send(`pong ${count}`);
  count++;
  writePongCount();
});

app.listen(port, () => {
  writePongCount();
});