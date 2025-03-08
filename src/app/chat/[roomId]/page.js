'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import UserStatus from '@/components/chat/UserStatus';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function ChatRoom() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [roomName, setRoomName] = useState('');
  
  // Get chat functionality from our custom hook
  const { 
    messages, 
    sendMessage, 
    joinRoom, 
    leaveRoom,
    roomUsers,
    userTyping,
    startTyping,
    stopTyping
  } = useChat();
  
  // Effects for room management
  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Set room name based on ID - in a real app this would come from your backend
    const roomNames = {
      'general': 'General Chat',
      'help': 'Help & Support',
      'random': 'Random',
      // Add more mappings as needed
    };
    
    setRoomName(roomNames[roomId] || roomId);
    
    // Join the chat room when component mounts
    joinRoom(roomId);
    
    // Leave room when component unmounts
    return () => {
      leaveRoom(roomId);
    };
  }, [roomId, isAuthenticated, loading, router, joinRoom, leaveRoom]);

  // Handle sending messages
  const handleSendMessage = (content) => {
    if (!content.trim()) return;
    
    sendMessage({
      roomId,
      content,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }
    });
  };
  
  // Handle user typing
  const handleTyping = (isTyping) => {
    if (isTyping) {
      startTyping(roomId);
    } else {
      stopTyping(roomId);
    }
  };

  // Return to rooms list
  const handleBackToRooms = () => {
    router.push('/chat');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleBackToRooms}
              className="mr-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">{roomName}</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {roomUsers.length} {roomUsers.length === 1 ? 'person' : 'people'} in the room
              </div>
            </div>
          </div>
          <Button onClick={handleBackToRooms}>
            Exit Room
          </Button>
        </div>
      </div>
      
      {/* Chat Area - Flexbox to make it fill available space */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Messages Container - with scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
            <MessageList 
              messages={messages} 
              currentUserId={user?.id} 
            />
            
            {/* Typing Indicator */}
            {userTyping && (
              <div className="text-sm text-gray-500 italic mt-2">
                {userTyping.name} is typing...
              </div>
            )}
          </div>
          
          {/* Chat Input Area */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              onTyping={handleTyping}
            />
          </div>
        </div>
        
        {/* Users Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4">People ({roomUsers.length})</h2>
          {roomUsers.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">No one is here yet</div>
          ) : (
            <div className="space-y-3">
              {roomUsers.map(roomUser => (
                <UserStatus 
                  key={roomUser.id} 
                  user={roomUser} 
                  isCurrentUser={roomUser.id === user?.id} 
                />
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500">
              {roomUsers.length} {roomUsers.length === 1 ? 'person' : 'people'} in this room
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
