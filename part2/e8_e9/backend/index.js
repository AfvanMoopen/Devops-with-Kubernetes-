const express = require('express');
const fs = require('fs');
const got = require('got');
const { promisify } = require('util');
const Uuid = require('uuid');
const stream = require('stream');

const { initDb, getClient } = require('./database');

const pipeline = promisify(stream.pipeline);
const app = express();

require('dotenv').config();
app.use(express.json());

const port = process.env.PORT || 3000;

// Connect to database
initDb();

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

// Endpoint for healthcheck
app.get('/', (req, res) => {
  res.send('OK');
});

//
app.get('/api/todos', async (req, res) => {
  console.log('GET: /api/todos');

  const client = getClient();
  if(!client) {
    res.status(500).send('Client not connected');
  }

  try {
    const rsp = await client.query(`select * from "todos"`)
    return res.send(rsp.rows);
  } catch(err) {
    console.log(err);
    return res.status(500).send({ error: 'Query failed' });
  }  
});

app.post('/api/todos', async (req, res) => {
  console.log('POST: /api/todos');

  const { todo } = req.body;
  if(!todo) {
    console.log('Err: todo text missing');
    return res.status(400).send({ error: 'todo missing' });
  }

  if(todo.length > 140) {
    console.log(`Err: Too long todo (${todo.length} chars)`);
    return res.status(400).send({ error: 'todo longer than 140 characters' });
  }

  const client = getClient();
  if(!client) {
    res.status(500).send('Client not connected');
  }

  const todoObj = {
    id: Uuid.v4(),
    content: todo,
    done: false
  };

  console.log('Saving new todo', todoObj);

  try {
    const rsp = await client.query(`insert into todos (id, content, done) values ($1, $2, false)`, 
      [todoObj.id, todoObj.content]);
  } catch(err) {
    console.log(err);
    return res.status(500).send({ error: 'Query failed' });
  }  

  res.send(todoObj);
});

//
app.get('/api/dailypicture', (req, res) => {
  console.log('GET: /api/dailypicture');

  if(!fs.existsSync('/shared/dailypic.jpg')) {
    return res.status(404).end('Daily picture not found');
  }

  const s = fs.createReadStream('/shared/dailypic.jpg');
  s.on('open', () => {
    res.set('Content-Type', 'image/jpeg');
    s.pipe(res);
  });
});

app.use((req,res,next) => {
  console.log(`404 request: ${req.originalUrl}`);
  res.status(404).send('Unable to find the requested resource!');
});

//
fetchImage();
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});