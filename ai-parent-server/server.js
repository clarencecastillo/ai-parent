const open = require('open');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const chat = require('./chat.js');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
})

let conversations = new Map();

app.post('/api/chat', (req, res) => {

  const id = req.body.id;

  if (!conversations.has(id)) {
    const conversation = new chat.Conversation(id);
    conversations.set(id, conversation);
  }

  console.log(`api: started conversation with id ${id}`);
  res.json({
    status: 'ok',
    id: id
  });
});

app.post('/api/reset', (req, res) => {
  conversations = new Map();
  console.log(`api: cleared all conversations`);
  res.json({
    status: 'ok'
  });
})

app.delete('/api/chat/:id', (req, res) => {

  const id = req.params.id;

  if (!conversations.has(id)) {
    throw new Error(`Conversation with id ${id} does not exist`);
  }

  console.log(`api: deleted conversation with id ${id}`);
  conversations.delete(id);
  res.json({
    status: 'ok'
  });
})

app.get('/api/chat/:id/report', async (req, res) => {
  const id = req.params.id;

  if (!conversations.has(id)) {
    throw new Error(`Conversation with id ${id} does not exist`);
  }

  console.log(`api: fetched report for conversation with id ${id}`);
  const report = await conversations.get(id).parent.report();
  res.json(report);
})

const io = socketio(http.createServer(app));

io.on('connection', socket => {

  socket.on('message', data => {
    console.log('socket received: ' + data);
    const [id, message] = data.split(':');
    const chat = conversations.get(id);
    chat.handle(message, socket);
  });

});
io.listen(8081);
app.listen(8000);

open('http://localhost:8000');