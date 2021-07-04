const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Root');
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});