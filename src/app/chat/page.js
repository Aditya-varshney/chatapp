'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoomList from '@/components/chat/RoomList';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

// Demo rooms
const DEMO_ROOMS = [
  { id: 'general', name: 'General Chat', description: 'Talk about anything!' },
  { id: 'help', name: 'Help & Support', description: 'Ask questions and get answers' },
  { id: 'random', name: 'Random', description: 'Random discussions' },
];

export default function ChatLobby() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { activeUsers } = useChat();
  const [rooms, setRooms] = useState(DEMO_ROOMS);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Handle creating a new room
  const handleCreateRoom = (roomData) => {
    const newRoom = {
      id: roomData.id || Date.now().toString(),
      name: roomData.name,
      description: roomData.description || '',
      createdBy: user?.id,
    };
    
    // Add to local state
    setRooms([...rooms, newRoom]);
    
    // Also add to shared state for other users to see
    if (typeof window !== 'undefined') {
      const sharedState = JSON.parse(localStorage.getItem('shared_chat_state') || '{}');
      if (!sharedState.rooms) sharedState.rooms = {};
      
      // Add the new room to shared state
      sharedState.rooms[newRoom.id] = {
        name: newRoom.name,
        users: [],
        messages: []
      };
      
      // Save updated shared state
      localStorage.setItem('shared_chat_state', JSON.stringify(sharedState));
      window.dispatchEvent(new CustomEvent('shared_state_updated'));
    }
    
    // Navigate to the new room
    router.push(`/chat/${newRoom.id}`);
  };

  // Handle joining a room
  const handleJoinRoom = (roomId) => {
    router.push(`/chat/${roomId}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Chat Rooms</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Join a room or create a new one to start chatting
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Available Rooms</h2>
          <RoomList 
            rooms={rooms} 
            onJoinRoom={handleJoinRoom} 
            activeUsers={activeUsers}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Create a New Room</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleCreateRoom({
              name: formData.get('roomName'),
              description: formData.get('roomDescription'),
              id: formData.get('roomId')
            });
          }} className="space-y-4">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                name="roomName"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter room name"
              />
            </div>
            
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium">
                Room ID (optional)
              </label>
              <input
                type="text"
                id="roomId"
                name="roomId"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="custom-room-id (will be auto-generated if empty)"
              />
            </div>
            
            <div>
              <label htmlFor="roomDescription" className="block text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="roomDescription"
                name="roomDescription"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this room is about"
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
