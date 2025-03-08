'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export function ChatProvider({ children }) {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [userTyping, setUserTyping] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Connect user when authenticated
  useEffect(() => {
    if (isConnected && isAuthenticated && user && socket) {
      socket.emit('user_connected', {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
    }
  }, [isConnected, isAuthenticated, user, socket]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handler for new messages
    const handleNewMessage = (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages using more reliable deduplication
        const isDuplicate = prev.some(m => {
          // If IDs exist and match
          if (m.id && message.id && m.id === message.id) {
            return true;
          }
          
          // Or if content and sender match within a small time window (3 seconds)
          if (m.content === message.content && 
              m.sender?.id === message.sender?.id) {
            const timeDiff = Math.abs(
              new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()
            );
            return timeDiff < 3000; // 3 seconds
          }
          
          return false;
        });
        
        if (isDuplicate) return prev;
        return [...prev, message];
      });
    };

    // Handler for active users updates
    const handleActiveUsers = (users) => {
      setActiveUsers(users || []);
    };

    // Handler for room users updates
    const handleRoomUsers = (users) => {
      setRoomUsers(users || []);
    };

    // Handler for typing indicators
    const handleUserTyping = ({ user, isTyping }) => {
      if (isTyping) {
        setUserTyping(user);
      } else if (userTyping?.id === user?.id) {
        setUserTyping(null);
      }
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('active_users', handleActiveUsers);
    socket.on('room_users', handleRoomUsers);
    socket.on('user_typing', handleUserTyping);

    // Clean up listeners on unmount or socket change
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('active_users', handleActiveUsers);
      socket.off('room_users', handleRoomUsers);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, userTyping]);

  // Join a chat room
  const joinRoom = useCallback((roomId) => {
    if (!socket || !roomId) return;
    
    // Clear previous messages when joining a new room
    setMessages([]);
    setCurrentRoom(roomId);
    
    // Notify server about joining the room
    socket.emit('join_room', roomId);
    
    // Fetch previous messages - already handled by mock socket in dev mode
    if (process.env.NODE_ENV !== 'development') {
      fetch(`/api/messages?roomId=${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages || []);
          }
        })
        .catch(err => console.error('Error fetching messages:', err));
    }
      
  }, [socket]);

  // Leave a chat room
  const leaveRoom = useCallback((roomId) => {
    if (!socket || !roomId) return;
    
    socket.emit('leave_room', roomId);
    setCurrentRoom(null);
  }, [socket]);

  // Send a message
  const sendMessage = useCallback((messageData) => {
    if (!socket || !messageData.roomId) return;
    
    // Emit message to server
    socket.emit('send_message', messageData);
    
    // Also save to API for persistence in production
    if (process.env.NODE_ENV !== 'development') {
      fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: messageData.roomId,
          message: messageData,
        }),
      }).catch(err => console.error('Error saving message:', err));
    }
    
  }, [socket]);

  // Handle typing indicators
  const startTyping = useCallback((roomId) => {
    if (!socket || !user || !roomId) return;
    
    socket.emit('typing', {
      roomId,
      user: {
        id: user.id,
        name: user.name,
      },
      isTyping: true,
    });
  }, [socket, user]);

  const stopTyping = useCallback((roomId) => {
    if (!socket || !user || !roomId) return;
    
    socket.emit('typing', {
      roomId,
      user: {
        id: user.id,
        name: user.name,
      },
      isTyping: false,
    });
  }, [socket, user]);

  const value = {
    messages,
    activeUsers,
    roomUsers,
    userTyping,
    currentRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);

export default ChatContext;
