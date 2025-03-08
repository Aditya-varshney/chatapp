import React from 'react';

export default function RoomList({ rooms, onJoinRoom, activeUsers = [] }) {
  // Count users in each room
  const getUserCount = (roomId) => {
    return activeUsers.filter(user => user.currentRoom === roomId).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map(room => (
        <div 
          key={room.id}
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
          onClick={() => onJoinRoom(room.id)}
        >
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            <span className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 py-1 px-2 rounded-full">
              {getUserCount(room.id) || 0} online
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{room.description}</p>
          <div className="mt-3 flex justify-end">
            <button 
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onJoinRoom(room.id);
              }}
            >
              Join Room →
            </button>
          </div>
        </div>
      ))}

      {rooms.length === 0 && (
        <div className="col-span-full text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">
            No rooms available. Create a new one to get started!
          </p>
        </div>
      )}
    </div>
  );
}
