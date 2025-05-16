import { formatDateForDb, parseDbDate } from '../../src/utils/date-utils';

describe('Date Utils', () => {
  describe('formatDateForDb', () => {
    it('should format Date object to YYYY-MM-DD string', () => {
      // Create test date (2023-06-15)
      const testDate = new Date(2023, 5, 15); // Note: Month is 0-indexed
      expect(formatDateForDb(testDate)).toBe('2023-06-15');
    });

    it('should handle single-digit month and day values correctly', () => {
      // Create test date (2023-01-05)
      const testDate = new Date(2023, 0, 5);
      expect(formatDateForDb(testDate)).toBe('2023-01-05');
    });

    it('should return null for null input', () => {
      expect(formatDateForDb(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(formatDateForDb(undefined)).toBeNull();
    });
  });

  describe('parseDbDate', () => {
    it('should parse YYYY-MM-DD string to Date object', () => {
      const dateStr = '2023-06-15';
      const result = parseDbDate(dateStr);
      
      // Check if result is Date and has correct year, month and day
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(5); // 0-indexed, so June is 5
      expect(result?.getDate()).toBe(15);
    });

    it('should return null for null input', () => {
      expect(parseDbDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(parseDbDate(undefined)).toBeNull();
    });

    it('should return null for invalid date string', () => {
      expect(parseDbDate('not-a-date')).toBeNull();
    });
  });
});
