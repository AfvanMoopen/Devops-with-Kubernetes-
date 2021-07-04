const express = require('express');
const app = express();
const Uuid = require('uuid');

require('dotenv').config();

const str = Uuid.v4();
const port = process.env.PORT || 3000;

const output_str = () => {
    const date = new Date();
    console.log(`${date.toISOString()}: ${str}`);
}


setInterval( () => {
    output_str();
}, 5000);


app.get('/', (req, res) => {
  res.send(str);
});

app.listen(port, () => {
  output_str();
});
