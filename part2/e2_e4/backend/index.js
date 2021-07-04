const express = require('express');
const fs = require('fs');
const got = require('got');
const { promisify } = require('util');
const Uuid = require('uuid');
const stream = require('stream');

const pipeline = promisify(stream.pipeline);
const app = express();

require('dotenv').config();
app.use(express.json());

const port = process.env.PORT || 3000;
let todoList = [];

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
app.get('/todos', (req, res) => {
  res.send(todoList);
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;
  if(!todo) {
    return res.statusCode(400).send({ error: 'todo missing' });
  }

  if(todo.length > 140) {
    return res.statusCode(400).send({ error: 'todo longer than 140 characters' });
  }

  const todoObj = {
    id: Uuid.v4(),
    text: todo
  };

  todoList.push(todoObj);
  res.send(todoObj);
});

//
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

//
fetchImage();
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});