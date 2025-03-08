import React from 'react';
import Avatar from '@/components/ui/Avatar';

export default function Message({ message, isOwn }) {
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0 mr-2">
            <Avatar 
              src={message.sender?.avatar} 
              alt={message.sender?.name || 'User'} 
              size="sm" 
            />
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name */}
          {!isOwn && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {message.sender?.name || 'Anonymous'}
            </span>
          )}
          
          {/* Message bubble */}
          <div 
            className={`rounded-lg py-2 px-3 ${
              isOwn 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <p>{message.content}</p>
          </div>
          
          {/* Timestamp */}
          <span className="text-xs text-gray-400 mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
