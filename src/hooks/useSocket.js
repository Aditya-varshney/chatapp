'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Create a singleton socket instance
let socketInstance = null;

// Generate a persistent user ID for this browser
function getBrowserId() {
  if (typeof window === 'undefined') return null;
  
  let browserId = localStorage.getItem('chat_browser_id');
  if (!browserId) {
    browserId = `browser-${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('chat_browser_id', browserId);
  }
  return browserId;
}

// Shared storage for development mode
// This helps simulate shared state between different browser tabs/users
function getSharedState() {
  if (typeof window === 'undefined') return {
    activeUsers: [],
    rooms: {}
  };
  
  try {
    const storedState = localStorage.getItem('shared_chat_state');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // Convert timestamps back to Date objects
      if (parsedState.rooms) {
        Object.values(parsedState.rooms).forEach(room => {
          if (room.messages) {
            room.messages.forEach(msg => {
              msg.timestamp = new Date(msg.timestamp);
            });
          }
        });
      }
      return parsedState;
    }
  } catch (e) {
    console.error('Error loading shared state:', e);
  }
  
  // Default state
  return {
    activeUsers: [
      { id: 'system-1', name: 'System User', email: 'system@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system' },
      { id: 'demo-1', name: 'Demo User', email: 'demo@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo' }
    ],
    rooms: {
      'general': {
        name: 'General Chat',
        users: [],
        messages: [
          { id: 'msg-1', content: 'Welcome to the chat!', sender: { id: 'system-1', name: 'System User' }, timestamp: new Date(Date.now() - 3600000) },
          { id: 'msg-2', content: 'This is a development mock. No real server connection.', sender: { id: 'system-1', name: 'System User' }, timestamp: new Date(Date.now() - 1800000) }
        ]
      },
      'help': {
        name: 'Help & Support',
        users: [],
        messages: [
          { id: 'msg-3', content: 'Need help? Ask here!', sender: { id: 'system-1', name: 'System User' }, timestamp: new Date(Date.now() - 7200000) }
        ]
      },
      'random': {
        name: 'Random',
        users: [],
        messages: [
          { id: 'msg-4', content: 'Random discussions go here!', sender: { id: 'system-1', name: 'System User' }, timestamp: new Date(Date.now() - 5400000) }
        ]
      }
    }
  };
}

// Function to save state to localStorage
function saveSharedState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('shared_chat_state', JSON.stringify(state));
    // Dispatch a custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('shared_state_updated'));
  } catch (e) {
    console.error('Error saving shared state:', e);
  }
}

// Initialize shared state
const sharedState = getSharedState();

// Create event emitter for local events
class LocalEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.events[event]) return this;
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(callback => {
      setTimeout(() => callback(...args), 0);
    });
    return true;
  }

  onevent(packet) {
    if (Array.isArray(packet.data) && packet.data.length > 0) {
      this.emit(packet.data[0], ...(packet.data.slice(1)));
    }
  }
}

// Global event bus for cross-instance communication in development
let globalEventBus;
if (typeof window !== 'undefined') {
  if (!window.__CHAT_EVENT_BUS__) {
    window.__CHAT_EVENT_BUS__ = new LocalEventEmitter();
  }
  globalEventBus = window.__CHAT_EVENT_BUS__;
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketInitialized = useRef(false);
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const userIdRef = useRef(typeof window !== 'undefined' ? getBrowserId() : `user-${Math.random().toString(36).substring(2, 10)}`);
  
  useEffect(() => {
    // Only initialize once
    if (socketInitialized.current) return;
    socketInitialized.current = true;
    
    const isDev = process.env.NODE_ENV === 'development';
    
    try {
      if (isDev) {
        // In development: Use mock socket implementation
        console.log('🔄 Development mode: Using mock socket implementation');
        createMockSocket();
      } else {
        // Production: Try to connect to real Socket.io server
        connectToSocketServer();
      }
    } catch (err) {
      console.error('Socket initialization error:', err);
      createMockSocket();
    }
    
    function connectToSocketServer() {
      // First check if the server is available
      fetch('/api/socket', { signal: AbortSignal.timeout(2000) })
        .then(() => {
          if (!socketInstance) {
            socketInstance = io({
              // In production with custom server: path: '/api/socket'
              reconnectionAttempts: 3,
              reconnectionDelay: 1000,
              timeout: 5000,
              autoConnect: true
            });
            
            // Connection event handlers
            socketInstance.on('connect', () => {
              console.log('✅ Socket connected!');
              setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
              console.log('❌ Socket disconnected!');
              setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
              console.error('⚠️ Socket connection error:', err.message);
              setIsConnected(false);
              
              // If we have connection errors in prod, fall back to mock socket
              if (socketInstance.io.reconnectionAttempts === socketInstance.io._reconnectionAttempts) {
                console.warn('Max reconnection attempts reached. Using mock socket instead.');
                createMockSocket();
              }
            });
            
            setSocket(socketInstance);
          } else {
            setSocket(socketInstance);
            setIsConnected(socketInstance.connected);
          }
        })
        .catch(err => {
          console.warn('Socket server not available:', err.message);
          createMockSocket();
        });
    }
    
    function createMockSocket() {
      console.info('🔧 Using mock socket implementation');
      
      // Create a mock socket with local event emitter
      if (!socketInstance) {
        const mockEmitter = new LocalEventEmitter();
        
        // Create the mock socket instance
        socketInstance = {
          id: userIdRef.current,
          // Core Socket.io client methods
          connected: true,
          emit: (event, ...args) => {
            console.log('🔷 Mock socket emit:', event, args);
            
            // Handle the event locally
            handleMockEmit(event, ...args);
            
            // Also broadcast to global event bus for other instances
            if (globalEventBus) {
              globalEventBus.emit('global_event', {
                sourceId: userIdRef.current,
                event,
                args
              });
            }
            
            // Also emit to local listeners
            return mockEmitter.emit(event, ...args);
          },
          on: (event, callback) => {
            mockEmitter.on(event, callback);
            return socketInstance;
          },
          off: (event, callback) => {
            mockEmitter.off(event, callback);
            return socketInstance;
          },
          once: (event, callback) => {
            const onceCallback = (...args) => {
              mockEmitter.off(event, onceCallback);
              callback(...args);
            };
            mockEmitter.on(event, onceCallback);
            return socketInstance;
          },
          // Custom properties for our mock
          _mockEmitter: mockEmitter
        };
        
        // Listen for global events from other instances
        if (globalEventBus) {
          globalEventBus.on('global_event', ({sourceId, event, args}) => {
            // Skip events from self
            if (sourceId === userIdRef.current) return;
            
            // Process events from other instances
            handleGlobalEvent(sourceId, event, args);
          });
        }
      }
      
      // Set the mock socket and connected state
      setSocket(socketInstance);
      setIsConnected(true);
      
      // Broadcast this socket's connection to window storage for other tabs
      if (typeof window !== 'undefined') {
        // Create a unique timestamp for this connection
        const connectionData = {
          id: userIdRef.current,
          timestamp: Date.now()
        };
        localStorage.setItem('socket_connection', JSON.stringify(connectionData));
        // Trigger storage event in other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'socket_connection',
          newValue: JSON.stringify(connectionData)
        }));
      }
      
      // Simulate a successful connection
      setTimeout(() => {
        socketInstance._mockEmitter.emit('connect');
        
        // Emit initial active users
        socketInstance._mockEmitter.emit('active_users', sharedState.activeUsers);
      }, 100);
    }
    
    // Handle mock socket events for development
    function handleMockEmit(event, ...args) {
      // Only in dev mode with mock socket
      if (!socketInstance._mockEmitter) return;
      
      switch (event) {
        case 'user_connected': {
          // When a user connects, add them to active users
          const userData = args[0];
          
          // Check if this user already exists in the active users
          const existingUserIndex = sharedState.activeUsers.findIndex(u => u.id === userData.id);
          
          if (existingUserIndex >= 0) {
            // Update existing user
            sharedState.activeUsers[existingUserIndex] = {
              ...userData,
              socketId: socketInstance.id,
              lastActive: new Date()
            };
          } else {
            // Add new user
            sharedState.activeUsers.push({
              ...userData,
              socketId: socketInstance.id,
              lastActive: new Date()
            });
          }
          
          // Simulate active users update for all clients
          setTimeout(() => {
            socketInstance._mockEmitter.emit('active_users', sharedState.activeUsers);
            if (globalEventBus) {
              globalEventBus.emit('broadcast_active_users', sharedState.activeUsers);
            }
          }, 100);
          break;
        }
          
        case 'join_room': {
          // When a user joins a room
          const roomId = args[0];
          
          // Make sure the room exists
          if (!sharedState.rooms[roomId]) {
            sharedState.rooms[roomId] = {
              name: roomId.charAt(0).toUpperCase() + roomId.slice(1),
              users: [],
              messages: []
            };
          }
          
          // Add current user to room if they're authenticated
          const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
          if (currentUser) {
            // Check if user is already in room
            if (!sharedState.rooms[roomId].users.some(u => u.id === currentUser.id)) {
              sharedState.rooms[roomId].users.push(currentUser);
            }
            
            // Update user with current room info
            currentUser.currentRoom = roomId;
            setCurrentRoom(roomId);
          }
          
          // Emit room users to all clients in this room
          setTimeout(() => {
            socketInstance._mockEmitter.emit('room_users', sharedState.rooms[roomId].users);
            
            // Send past messages to this client
            if (sharedState.rooms[roomId].messages.length > 0) {
              sharedState.rooms[roomId].messages.forEach(msg => {
                socketInstance._mockEmitter.emit('new_message', msg);
              });
            }
            
            // Add welcome message
            setTimeout(() => {
              const welcomeMessage = {
                id: `msg-welcome-${Date.now()}`,
                content: `Welcome to ${sharedState.rooms[roomId].name}!`,
                sender: { id: 'system-1', name: 'System User' },
                timestamp: new Date(),
                roomId: roomId
              };
              
              // Add to room's message history
              sharedState.rooms[roomId].messages.push(welcomeMessage);
              
              // Send to this client
              socketInstance._mockEmitter.emit('new_message', welcomeMessage);
              
              // Broadcast to global event bus
              if (globalEventBus) {
                globalEventBus.emit('broadcast_message', {
                  roomId,
                  message: welcomeMessage
                });
              }
              
              // Save to localStorage for persistence
              saveSharedState(sharedState);
            }, 500);
          }, 200);
          
          // Notify other clients about room user update
          if (globalEventBus) {
            globalEventBus.emit('broadcast_room_users', {
              roomId,
              users: sharedState.rooms[roomId].users
            });
          }
          break;
        }
          
        case 'leave_room': {
          const roomId = args[0];
          
          if (sharedState.rooms[roomId]) {
            // Remove user from room
            const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
            
            if (currentUser) {
              sharedState.rooms[roomId].users = sharedState.rooms[roomId].users.filter(
                u => u.id !== currentUser.id
              );
              
              // Clear current room from user
              delete currentUser.currentRoom;
              setCurrentRoom(null);
              
              // Broadcast updated room users
              if (globalEventBus) {
                globalEventBus.emit('broadcast_room_users', {
                  roomId,
                  users: sharedState.rooms[roomId].users
                });
              }
              
              // Save to localStorage for persistence
              saveSharedState(sharedState);
            }
          }
          break;
        }
          
        case 'send_message': {
          // Process and broadcast a new message
          const messageData = args[0];
          const roomId = messageData.roomId;
          
          if (!sharedState.rooms[roomId]) {
            console.warn(`Room ${roomId} doesn't exist`);
            return;
          }
          
          // Create full message with ID and timestamp
          const fullMessage = {
            ...messageData,
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date()
          };
          
          // Store in room's message history
          sharedState.rooms[roomId].messages.push(fullMessage);
          
          // Save to localStorage for persistence
          saveSharedState(sharedState);
          
          // Send back to this client (echo)
          setTimeout(() => {
            socketInstance._mockEmitter.emit('new_message', fullMessage);
          }, 100);
          
          // IMPORTANT FIX: Broadcast to window.localStorage for cross-browser sharing
          // This works better than the global event bus for cross-tab communication
          if (typeof window !== 'undefined') {
            // Create a unique message timestamp for this event
            const broadcastData = {
              type: 'new_message',
              roomId,
              message: fullMessage,
              timestamp: Date.now()
            };
            localStorage.setItem('chat_broadcast', JSON.stringify(broadcastData));
            
            // Also use the event bus for same-window instances
            if (globalEventBus) {
              globalEventBus.emit('broadcast_message', {
                roomId,
                message: fullMessage
              });
            }
          }
          break;
        }
        
        case 'typing': {
          // Relay typing indicators
          const typingData = args[0];
          const roomId = typingData.roomId;
          
          if (globalEventBus) {
            globalEventBus.emit('broadcast_typing', {
              roomId,
              user: typingData.user,
              isTyping: typingData.isTyping
            });
          }
          break;
        }
      }
    }
    
    // Handle events from other mock instances
    function handleGlobalEvent(sourceId, event, args) {
      // Only care about certain events
      switch (event) {
        case 'join_room':
        case 'leave_room':
        case 'send_message':
        case 'typing':
          // These events are handled through the broadcast events
          break;
          
        case 'user_connected':
          // Handled through broadcast_active_users
          break;
      }
    }
    
    return () => {
      // Nothing to do on cleanup since we're keeping the singleton
    };
  }, []);

  // Add a listener for localStorage changes to detect other browser windows/tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e) => {
        if (e.key === 'socket_connection') {
          // Another tab/window has connected
          try {
            const connectionData = JSON.parse(e.newValue);
            if (connectionData && connectionData.id !== userIdRef.current) {
              console.log('Another browser instance connected:', connectionData.id);
              
              // Force refresh room data if we're in a room
              if (socket && socket._mockEmitter) {
                const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
                if (currentUser && currentUser.currentRoom) {
                  setTimeout(() => {
                    socket.emit('join_room', currentUser.currentRoom);
                  }, 500);
                }
              }
            }
          } catch (error) {
            console.error('Error parsing connection data:', error);
          }
        }
        
        // Handle broadcast messages
        if (e.key === 'chat_broadcast') {
          try {
            const broadcastData = JSON.parse(e.newValue);
            if (!broadcastData || broadcastData.timestamp === undefined) return;
            
            // Check if we're in the relevant room
            const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
            if (currentUser && currentUser.currentRoom === broadcastData.roomId) {
              if (broadcastData.type === 'new_message' && socketInstance && socketInstance._mockEmitter) {
                // Make sure we don't re-emit our own messages
                if (broadcastData.message.sender?.id !== currentUser.id) {
                  socketInstance._mockEmitter.emit('new_message', broadcastData.message);
                }
              }
            }
          } catch (error) {
            console.error('Error handling broadcast data:', error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [socket]);

  // Add listener for shared state updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStateUpdate = () => {
        const updatedState = getSharedState();
        
        // Check if we're in a room and need to update messages
        if (socket && socket._mockEmitter && currentRoom) {
          const roomMessages = updatedState.rooms[currentRoom]?.messages || [];
          roomMessages.forEach(message => {
            socket._mockEmitter.emit('new_message', message);
          });
        }
      };
      
      window.addEventListener('shared_state_updated', handleStateUpdate);
      return () => {
        window.removeEventListener('shared_state_updated', handleStateUpdate);
      };
    }
  }, [socket, currentRoom]);

  // Listen for broadcasts from other instances
  useEffect(() => {
    if (globalEventBus) {
      // Broadcast of active users list
      globalEventBus.on('broadcast_active_users', (users) => {
        if (socketInstance && socketInstance._mockEmitter) {
          socketInstance._mockEmitter.emit('active_users', users);
        }
      });
      
      // Broadcast of room users
      globalEventBus.on('broadcast_room_users', ({roomId, users}) => {
        // Only send to clients in this room
        const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
        if (currentUser && currentUser.currentRoom === roomId) {
          if (socketInstance && socketInstance._mockEmitter) {
            socketInstance._mockEmitter.emit('room_users', users);
          }
        }
      });
      
      // Broadcast of new messages
      globalEventBus.on('broadcast_message', ({roomId, message}) => {
        // Only send to clients in this room
        const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
        if (currentUser && currentUser.currentRoom === roomId) {
          if (socketInstance && socketInstance._mockEmitter) {
            socketInstance._mockEmitter.emit('new_message', message);
          }
        }
      });
      
      // Broadcast typing indicators
      globalEventBus.on('broadcast_typing', ({roomId, user, isTyping}) => {
        // Only send to clients in this room
        const currentUser = sharedState.activeUsers.find(u => u.socketId === socketInstance.id);
        if (currentUser && currentUser.currentRoom === roomId) {
          if (socketInstance && socketInstance._mockEmitter) {
            socketInstance._mockEmitter.emit('user_typing', {user, isTyping});
          }
        }
      });
    }
    
    return () => {
      // No cleanup needed, these are shared listeners
    };
  }, []);

  // Expose socket and connection status
  return { socket, isConnected };
}
