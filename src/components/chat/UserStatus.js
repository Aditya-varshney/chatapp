import React from 'react';
import Avatar from '@/components/ui/Avatar';

export default function UserStatus({ user, isCurrentUser = false }) {
  return (
    <div className={`flex items-center space-x-2 ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg' : ''}`}>
      <div className="relative">
        <Avatar 
          src={user.avatar} 
          alt={user.name || 'User'} 
          size="sm" 
        />
        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
      </div>
      <div>
        <p className="text-sm font-medium">
          {user.name}
          {isCurrentUser && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(you)</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>
          {user.email}
        </p>
      </div>
    </div>
  );
}
