const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const next = require('next');

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(cors());
  
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Room and user tracking
  const rooms = {
    general: { users: [], messages: [] },
    help: { users: [], messages: [] },
    random: { users: [], messages: [] }
  };
  const users = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('user_connected', (userData) => {
      users[socket.id] = { ...userData, socketId: socket.id };
      io.emit('active_users', Object.values(users));
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = { users: [], messages: [] };
      }
      
      if (users[socket.id]) {
        rooms[roomId].users.push(users[socket.id]);
        io.to(roomId).emit('room_users', rooms[roomId].users);
        
        // Send room messages history
        socket.emit('room_history', rooms[roomId].messages);
      }
    });

    socket.on('send_message', (message) => {
      const roomId = message.roomId;
      const newMessage = { ...message, id: Date.now(), timestamp: new Date() };
      
      if (rooms[roomId]) {
        rooms[roomId].messages.push(newMessage);
        io.to(roomId).emit('new_message', newMessage);
      }
    });

    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (users[socket.id]) {
        // Remove from rooms
        Object.keys(rooms).forEach(roomId => {
          rooms[roomId].users = rooms[roomId].users.filter(user => 
            user.socketId !== socket.id
          );
          io.to(roomId).emit('room_users', rooms[roomId].users);
        });
        
        // Remove from users
        delete users[socket.id];
        io.emit('active_users', Object.values(users));
      }
    });
  });

  // Default route handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Development server ready on http://localhost:${port}`);
  });
});
