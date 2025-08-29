// Date formatting utilities for AreBet Sports Platform

/**
 * Format time for display in match cards (24-hour format)
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Smart format for match time display (main score section)
 * Examples: "Today 15:30", "Tomorrow 20:00", "Sat 14:00", "Mar 15 19:30"
 */
export const formatMatchTime = (dateString) => {
  if (!dateString) return 'TBD';
  
  const matchDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  
  const time = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  if (matchDay.getTime() === today.getTime()) {
    return `Today ${time}`;
  } else if (matchDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow ${time}`;
  } else if (matchDay.getTime() < today.getTime()) {
    return time; // Past match, just show time
  } else {
    // Future match beyond tomorrow
    const daysDiff = Math.ceil((matchDay - today) / (24 * 60 * 60 * 1000));
    if (daysDiff <= 7) {
      const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'short' });
      return `${dayName} ${time}`;
    } else {
      const dateStr = matchDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${dateStr} ${time}`;
    }
  }
};

/**
 * Format date for detail sections
 * Examples: "Today", "Tomorrow", "Monday", "Mar 15"
 */
export const formatDetailDate = (dateString) => {
  if (!dateString) return 'TBD';
  
  const matchDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  
  if (matchDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (matchDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (matchDay.getTime() < today.getTime()) {
    return matchDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    const daysDiff = Math.ceil((matchDay - today) / (24 * 60 * 60 * 1000));
    if (daysDiff <= 7) {
      return matchDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return matchDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: matchDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

/**
 * Format date for page headers and summaries
 * Examples: "Today", "Tomorrow", "Monday, March 15", "March 15, 2024"
 */
export const formatPageDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    const daysDiff = Math.ceil((dateDay - today) / (24 * 60 * 60 * 1000));
    if (daysDiff <= 7 && daysDiff > 0) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

/**
 * Format compact date for betting insights
 * Examples: "Today", "Tomorrow", "Mar 15"
 */
export const formatCompactDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};