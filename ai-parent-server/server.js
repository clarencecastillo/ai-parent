const opn = require('opn');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const chat = require('./chat.js');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
})

let conversations = new Map();

app.post('/api/chat', (req, res) => {

  const id = conversations.size + 1 + '';
  const conversation = new chat.Conversation(id);
  conversations.set(id, conversation);

  res.json({
    status: 'ok',
    id: id
  });
});

const io = socketio(http.createServer(app));

io.on('connection', socket => {

  socket.on('message', data => {
    const [id, message] = data.split(':');
    const chat = conversations.get(id);
    chat.handle(message, socket);
  });

});
io.listen(8081);
app.listen(8000);

// webSocketServer.on('listening', () => {
//   const port = webSocketServer.address().port;
//   console.log(`AI Parent WebSocket Server listening on port ${port}...`);
// });

// const webServer = new StaticServer({
//   rootPath: 'static',
//   port: 8080
// });

// webServer.start(() => {
//   console.log(`Static Server listening on port ${webServer.port}...`);
//   opn(`http://localhost:${webServer.port}`);
// });
