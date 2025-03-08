/**
 * Utility functions for the chat application
 */

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    month: 'short', 
    day: 'numeric',
    year: date && new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  };
  
  return new Date(date).toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Generate a random string for room IDs
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
export function generateRandomId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
