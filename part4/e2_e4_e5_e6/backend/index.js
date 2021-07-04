const express = require('express');
const fs = require('fs');
const got = require('got');
const { promisify } = require('util');
const Uuid = require('uuid');
const stream = require('stream');
const Nats = require('nats');

const { initDb, getClient, isConnected } = require('./database');

const pipeline = promisify(stream.pipeline);
const app = express();

require('dotenv').config();
app.use(express.json());

const port = process.env.PORT || 3000;
const natsHost = process.env.NATS || '';

// Connect to database
initDb();

let nc = null;
if(natsHost) {
  console.log('Connecting to NATS: ', natsHost);
  nc = Nats.connect(natsHost);
  nc.on('connect', () => console.log('Connected to NATS'));
}

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
app.get('/healthz', (req, res) => {
  if(!isConnected()) {
    return res.status(500).send('Client not connected');
  }

  res.send('OK');
});

//
app.get('/api/todos', async (req, res) => {
  console.log('GET: /api/todos');

  const client = getClient();
  if(!client) {
    return res.status(500).send('Client not connected');
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
    return res.status(500).send('Client not connected');
  }

  const todoObj = {
    id: Uuid.v4(),
    content: todo,
    done: false
  };

  console.log('Saving new todo', todoObj);

  try {
    const rsp = await client.query('insert into todos (id, content, done) values ($1, $2, false)',
      [todoObj.id, todoObj.content]);
  } catch(err) {
    console.log(err);
    return res.status(500).send({ error: 'Query failed' });
  }

  if(nc) {
    nc.publish('todos', JSON.stringify({
      type: 'new',
      todo: todoObj
    }));
  }

  res.send(todoObj);
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;

  if(done !== true && done !== false) {
    console.log('Err: Invalid done value');
    return res.status(400).send({ error: 'Invalid done value' });
  }

  const client = getClient();
  if(!client) {
    return res.status(500).send('Client not connected');
  }

  console.log(`Updating todo ${id}, done => ${done ? 'true' : 'false'}`);

  try {
    const rsp = await client.query('update todos set done=$1 where id=$2',
      [done, id]);
  } catch(err) {
    console.log(err);
    return res.status(500).send({ error: 'Query failed' });
  }

  if(nc) {
    nc.publish('todos', JSON.stringify({
      type: 'update',
      todo: { id, done }
    }));
  }

  res.send({});
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