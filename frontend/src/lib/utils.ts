import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to YYYY-MM-DD
export function formatDate(date?: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Format date for display (e.g., "May 15, 2025")
export function formatDateForDisplay(date?: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Extract error message from caught error with more details
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Try to extract message from error object
    if ('message' in error) {
      return String((error as any).message);
    }
    // For API responses that might have an error structure
    if ('error' in error) {
      return String((error as any).error);
    }
  }
  
  return String(error);
}

// Safely parse JSON with error handling
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

// Ensure array data type for consistent handling
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
}

// Check if a date string is valid
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Format date with fallback for invalid dates
export function safeDateFormat(date?: string | Date, formatter?: (date: Date) => string): string {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    return formatter ? formatter(d) : d.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Join array elements with a separator and 'and' for the last element
export function formatList(items: string[]): string {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  
  const lastItem = items.pop();
  return `${items.join(', ')} and ${lastItem}`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return formatDate(new Date());
}

// Generate random image placeholder for trips without images
export function getRandomImagePlaceholder(): string {
  const placeholders = [
    'beach.jpg',
    'mountain.jpg',
    'city.jpg',
    'countryside.jpg',
    'forest.jpg'
  ];
  
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}
