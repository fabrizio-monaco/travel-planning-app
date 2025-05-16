/**
 * Utility functions for handling dates in the application
 */

/**
 * Format a Date object to YYYY-MM-DD format for database queries
 * This makes date handling more explicit and testable
 * 
 * @param date Date object to format, or null/undefined
 * @returns Formatted date string in YYYY-MM-DD format or null if input is null/undefined
 */
export function formatDateForDb(date: Date | null | undefined): string | null {
  if (!date) return null;
  
  // Extract year, month, and day from the date
  const year = date.getFullYear();
  // getMonth() is 0-indexed, so add 1 and pad with 0 if needed
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Return in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

/**
 * Parse a string in YYYY-MM-DD format to a Date object
 * Useful for converting database date strings to Date objects
 * 
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Date object or null if input is invalid
 */
export function parseDbDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    // Create a new date with the date string (will be in local timezone)
    const date = new Date(dateStr);
    
    // Validate the date is valid
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch (error) {
    return null;
  }
}
