import React, { useRef, useEffect } from 'react';
import Message from './Message';

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by day for date separators
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateStr = date.toLocaleDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-8">
      {/* Show welcome message if no messages */}
      {messages.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">
              No messages yet. Start the conversation!
            </p>
          </div>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date} className="message-group">
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">{date}</span>
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>
          
          <div className="space-y-3">
            {msgs.map(message => (
              <Message
                key={message.id || message.timestamp}
                message={message}
                isOwn={message.sender?.id === currentUserId}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Invisible element for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
}
