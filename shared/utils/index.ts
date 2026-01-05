import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';
import { PAGINATION_DEFAULTS } from '../constants';

export const formatApiResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => {
  return {
    status: 'success',
    message,
    data,
  };
};

export const formatErrorResponse = (
  message: string,
  error?: string
): ApiResponse => {
  return {
    status: 'error',
    message,
    error,
  };
};

export const generateTrackingNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK${timestamp}${random}`.substring(0, 12);
};

export const calculatePagination = (
  page?: number,
  limit?: number
): { skip: number; take: number; page: number; limit: number } => {
  const validatedPage = Math.max(1, page || PAGINATION_DEFAULTS.PAGE);
  const validatedLimit = Math.min(
    Math.max(1, limit || PAGINATION_DEFAULTS.LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  return {
    skip: (validatedPage - 1) * validatedLimit,
    take: validatedLimit,
    page: validatedPage,
    limit: validatedLimit,
  };
};

export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const { page, limit } = calculatePagination(params.page, params.limit);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  keysToRemove: string[]
): Partial<T> => {
  const sanitized = { ...obj };
  keysToRemove.forEach((key) => {
    delete sanitized[key];
  });
  return sanitized;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone);
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  const maskedUsername = `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`;
  return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) {
    return '****';
  }
  return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
};
