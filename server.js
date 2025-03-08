const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare the app
app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Set up Socket.IO
  const io = new Server(server);

  // Store for active connections
  const activeConnections = new Map();
  const rooms = new Map();

  // Set up Socket.io events
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Add user to connections
    socket.on('user_connected', (userData) => {
      activeConnections.set(socket.id, {
        ...userData,
        socketId: socket.id,
        lastActive: new Date(),
      });
      
      // Broadcast user list to everyone
      io.emit('active_users', Array.from(activeConnections.values()));
    });
    
    // Join a chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      
      // Add user to room if not already tracked
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);
      
      // Send current room members
      const roomUsers = Array.from(rooms.get(roomId))
        .map(id => activeConnections.get(id))
        .filter(Boolean);
        
      io.to(roomId).emit('room_users', roomUsers);
    });
    
    // Rest of socket handlers (leave_room, send_message, etc.)
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
      
      // Remove user from room tracking
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        
        // Update room members
        const roomUsers = Array.from(rooms.get(roomId))
          .map(id => activeConnections.get(id))
          .filter(Boolean);
          
        io.to(roomId).emit('room_users', roomUsers);
      }
    });
    
    // Handle chat messages
    socket.on('send_message', (message) => {
      console.log(`Message in ${message.roomId}: ${message.content}`);
      
      // Add server timestamp and broadcast to room
      const timestampedMessage = {
        ...message,
        timestamp: new Date(),
      };
      
      io.to(message.roomId).emit('new_message', timestampedMessage);
    });
    
    // Handle typing indicators
    socket.on('typing', ({roomId, user, isTyping}) => {
      socket.to(roomId).emit('user_typing', {user, isTyping});
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      
      // Remove user from connections
      activeConnections.delete(socket.id);
      
      // Remove from all rooms
      rooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          // Update room members
          const roomUsers = Array.from(users)
            .map(id => activeConnections.get(id))
            .filter(Boolean);
            
          io.to(roomId).emit('room_users', roomUsers);
        }
      });
      
      // Broadcast updated user list
      io.emit('active_users', Array.from(activeConnections.values()));
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});