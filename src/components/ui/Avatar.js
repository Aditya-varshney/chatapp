import React from 'react';

export default function Avatar({ 
  src, 
  alt, 
  size = 'md',
  className = '' 
}) {
  // Generate placeholder if no src is provided
  const generatePlaceholder = () => {
    const initials = alt
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
    
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        {initials}
      </div>
    );
  };

  // Define size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  return (
    <div className={`overflow-hidden rounded-full ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.appendChild(
              document.createTextNode((alt || '').charAt(0).toUpperCase())
            );
            e.target.parentNode.classList.add('bg-gray-200', 'dark:bg-gray-700', 'flex', 'items-center', 'justify-center', 'text-gray-600', 'dark:text-gray-300');
          }}
        />
      ) : (
        generatePlaceholder()
      )}
    </div>
  );
}
