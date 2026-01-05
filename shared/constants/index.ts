export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PARCEL_NOT_FOUND: 'Parcel not found',
  DELIVERY_NOT_FOUND: 'Delivery not found',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'No token provided',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  PARCEL_CREATED: 'Parcel created successfully',
  PARCEL_UPDATED: 'Parcel updated successfully',
  PARCEL_DELETED: 'Parcel deleted successfully',
  DELIVERY_CREATED: 'Delivery created successfully',
  DELIVERY_UPDATED: 'Delivery updated successfully',
  LOCATION_UPDATED: 'Location updated successfully',
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
  TRACKING_NUMBER_LENGTH: 12,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const JWT_CONFIG = {
  ALGORITHM: 'HS256' as const,
  TOKEN_PREFIX: 'Bearer',
};

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const SERVICE_NAMES = {
  API_GATEWAY: 'api-gateway',
  AUTH_SERVICE: 'auth-service',
  ORDERS_SERVICE: 'orders-service',
  TRACKING_SERVICE: 'tracking-service',
  NOTIFICATIONS_SERVICE: 'notifications-service',
} as const;

export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 30000,
  POOL_MIN: 2,
  POOL_MAX: 10,
  IDLE_TIMEOUT: 10000,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
} as const;
