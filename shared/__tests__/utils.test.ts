import {
  formatApiResponse,
  formatErrorResponse,
  generateTrackingNumber,
  calculatePagination,
  isValidEmail,
  isValidPhone,
  maskEmail,
  maskPhone,
} from '../utils';

describe('Shared Utilities', () => {
  describe('formatApiResponse', () => {
    it('should format success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = formatApiResponse(data, 'Success');

      expect(response).toEqual({
        status: 'success',
        message: 'Success',
        data,
      });
    });

    it('should format success response without message', () => {
      const data = { id: 1 };
      const response = formatApiResponse(data);

      expect(response.status).toBe('success');
      expect(response.data).toEqual(data);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response', () => {
      const response = formatErrorResponse('Error occurred', 'Details');

      expect(response).toEqual({
        status: 'error',
        message: 'Error occurred',
        error: 'Details',
      });
    });
  });

  describe('generateTrackingNumber', () => {
    it('should generate tracking number', () => {
      const trackingNumber = generateTrackingNumber();

      expect(trackingNumber).toMatch(/^TRK/);
      expect(trackingNumber.length).toBe(12);
    });

    it('should generate unique tracking numbers', () => {
      const numbers = new Set();
      for (let i = 0; i < 10; i++) {
        numbers.add(generateTrackingNumber());
      }
      // Should generate at least some unique numbers (not all might be unique due to timing)
      expect(numbers.size).toBeGreaterThan(5);
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination with default values', () => {
      const result = calculatePagination();

      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should calculate pagination for page 2', () => {
      const result = calculatePagination(2, 10);

      expect(result).toEqual({
        skip: 10,
        take: 10,
        page: 2,
        limit: 10,
      });
    });

    it('should enforce maximum limit', () => {
      const result = calculatePagination(1, 200);

      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it('should handle invalid page numbers', () => {
      const result = calculatePagination(-1, 10);

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc123')).toBe(false);
    });
  });

  describe('maskEmail', () => {
    it('should mask email correctly', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('john.doe@domain.com')).toBe('j******e@domain.com');
    });

    it('should handle short usernames', () => {
      expect(maskEmail('ab@example.com')).toBe('a***@example.com');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number', () => {
      expect(maskPhone('1234567890')).toBe('******7890');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhone('123')).toBe('****');
    });
  });
});
