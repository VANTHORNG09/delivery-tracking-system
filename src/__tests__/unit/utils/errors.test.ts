import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../../../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message and status code', () => {
      const error = new AppError('Test error', 500);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test error', 500);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BadRequestError', () => {
    it('should create error with 400 status code', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    it('should use default message', () => {
      const error = new BadRequestError();
      expect(error.message).toBe('Bad Request');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with 401 status code', () => {
      const error = new UnauthorizedError('Not authenticated');
      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with 404 status code', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('should create error with 422 status code', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
    });
  });
});
