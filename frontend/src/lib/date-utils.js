import { formatDistanceToNow, format, isBefore, isToday, isTomorrow, isPast, addDays } from 'date-fns';

export const formatDueDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  // If the date is within the next 7 days, show the day name
  const nextWeek = addDays(new Date(), 7);
  if (isBefore(date, nextWeek)) {
    return format(date, 'EEEE'); // Full day name (e.g., "Monday")
  }
  
  // Otherwise, show the date in a readable format
  return format(date, 'MMM d, yyyy');
};

export const getTimeRemaining = (dateString) => {
  if (!dateString) return null;
  
  const now = new Date();
  const dueDate = new Date(dateString);
  const seconds = Math.floor((dueDate - now) / 1000);
  
  // If task is overdue
  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return {
        text: `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`,
        isOverdue: true
      };
    } else if (hours > 0) {
      return {
        text: `Overdue by ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
        isOverdue: true
      };
    } else {
      return {
        text: `Overdue by ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`,
        isOverdue: true
      };
    }
  }
  
  // Task is due in the future
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return {
      text: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
      isOverdue: false
    };
  } else if (hours > 0) {
    return {
      text: `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
      isOverdue: false
    };
  } else {
    return {
      text: `Due in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`,
      isOverdue: false
    };
  }
};

export const getDueDateVariant = (dateString) => {
  if (!dateString) return 'default';
  
  const now = new Date();
  const dueDate = new Date(dateString);
  
  if (isPast(dueDate)) return 'destructive';
  
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((dueDate - now) / oneDay));
  
  if (diffDays <= 1) return 'warning';
  if (diffDays <= 3) return 'secondary';
  return 'default';
};
