const express = require('express');
const fs = require('fs');
const got = require('got');
const { promisify } = require('util');
const stream = require('stream');

const pipeline = promisify(stream.pipeline);
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

// Fetch random image
const fetchImage = async () => {
  if(fs.existsSync('/shared') && !fs.existsSync('/shared/dailypic.jpg')) {
    console.log('Downloading daily picture...');
    await pipeline(
      got.stream('https://picsum.photos/600'),
      fs.createWriteStream('/shared/dailypic.jpg')
    );
  }
}

//
app.get('/', (req, res) => {
  res.send(':) (:');
});

app.get('/dailypicture', (req, res) => {
  if(!fs.existsSync('/shared/dailypic.jpg')) {
    return res.status(404).end('Daily picture not found');
  }

  const s = fs.createReadStream('/shared/dailypic.jpg');
  s.on('open', () => {
    res.set('Content-Type', 'image/jpeg');
    s.pipe(res);
  });
});

fetchImage();
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});