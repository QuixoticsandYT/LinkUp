const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store users and their friends
let users = {};
let friends = {};

// Store messages temporarily for each user (optional)
let messages = {};

// Handle user connections
io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);

  // Send the user's ID to the client
  socket.emit('your_id', socket.id);

  // Initialize the user's friends list if not already
  if (!friends[socket.id]) {
    friends[socket.id] = [];
  }

  // Initialize the user's message history if not already
  if (!messages[socket.id]) {
    messages[socket.id] = [];
  }

  // Listen for the 'add_friend' event
  socket.on('add_friend', (friendId) => {
    if (!friends[socket.id].includes(friendId)) {
      friends[socket.id].push(friendId);
      // Notify the user about the updated friend list
      io.to(socket.id).emit('friend_list', friends[socket.id]);
    }
  });

  // Listen for the 'send_message' event
  socket.on('send_message', (messageData) => {
    const { to, message } = messageData;
    // Ensure that the recipient exists in the sender's friend list
    if (friends[socket.id].includes(to)) {
      // Emit the message to the recipient
      io.to(to).emit('receive_message', { from: socket.id, to: to, message: message });
      // Optionally, send the message back to the sender
      io.to(socket.id).emit('receive_message', { from: socket.id, to: to, message: message });
    }
  });

  // Send updated friend list when the user connects
  io.to(socket.id).emit('friend_list', friends[socket.id]);

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    delete users[socket.id];
  });
});

app.use(express.static('public'));

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
