const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;
let count = 0;

app.get('/', (req, res) => {
  res.send(`pong ${count}\n`);
  count++;
});

app.get('/count', (req, res) => {
  res.send({ count });
});

app.listen(port);