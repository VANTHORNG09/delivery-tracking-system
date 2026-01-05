# Shared Resources

This directory contains shared resources used across all services in the delivery tracking system.

## Structure

```
shared/
├── types/           # TypeScript interfaces and types
├── utils/           # Common utility functions
├── constants/       # Shared constants and enums
├── middleware/      # Shared middleware
└── index.ts         # Main export file
```

## Usage

### Importing from Shared

All services can import from the shared directory:

```typescript
// Import types
import { ApiResponse, UserRole, ParcelStatus } from '../shared/types';

// Import constants
import { HTTP_STATUS, ERROR_MESSAGES } from '../shared/constants';

// Import utilities
import { formatApiResponse, generateTrackingNumber } from '../shared/utils';

// Import middleware
import { asyncHandler, requestLogger } from '../shared/middleware';
```

### Or import everything:

```typescript
import {
  ApiResponse,
  HTTP_STATUS,
  formatApiResponse,
  asyncHandler,
} from '../shared';
```

## Types

### API Response Types
- `ApiResponse<T>` - Standard API response format
- `PaginatedResponse<T>` - Paginated data response
- `ErrorResponse` - Error response format

### Entity Types
- `UserRole` - User role enumeration
- `ParcelStatus` - Parcel status enumeration
- `ParcelPriority` - Parcel priority levels
- `DeliveryStatus` - Delivery status enumeration

### Utility Types
- `JwtPayload` - JWT token payload structure
- `AuthenticatedRequest` - Express request with user data
- `LocationCoordinates` - GPS coordinates
- `TrackingInfo` - Tracking information structure

## Constants

### HTTP Status Codes
```typescript
HTTP_STATUS.OK              // 200
HTTP_STATUS.CREATED         // 201
HTTP_STATUS.BAD_REQUEST     // 400
HTTP_STATUS.UNAUTHORIZED    // 401
// ... more status codes
```

### Error Messages
```typescript
ERROR_MESSAGES.UNAUTHORIZED
ERROR_MESSAGES.NOT_FOUND
ERROR_MESSAGES.VALIDATION_FAILED
// ... more error messages
```

### Validation Rules
```typescript
VALIDATION_RULES.PASSWORD_MIN_LENGTH
VALIDATION_RULES.EMAIL_MAX_LENGTH
VALIDATION_RULES.PHONE_PATTERN
```

## Utilities

### Response Formatting
```typescript
formatApiResponse(data, message?)  // Format success response
formatErrorResponse(message, error?) // Format error response
formatPaginatedResponse(data, total, params) // Format paginated data
```

### Data Generation
```typescript
generateTrackingNumber() // Generate unique tracking number
calculatePagination(page, limit) // Calculate pagination params
```

### Validation
```typescript
isValidEmail(email)  // Validate email format
isValidPhone(phone)  // Validate phone format
```

### Data Transformation
```typescript
sanitizeObject(obj, keysToRemove) // Remove sensitive keys
maskEmail(email)     // Mask email for display
maskPhone(phone)     // Mask phone for display
```

### Calculations
```typescript
calculateDistance(lat1, lon1, lat2, lon2) // Calculate distance in km
```

## Middleware

### Async Handler
Wraps async route handlers to catch errors:
```typescript
import { asyncHandler } from '../shared/middleware';

router.get('/parcels', asyncHandler(async (req, res) => {
  const parcels = await getParcels();
  res.json(parcels);
}));
```

### Request Logger
Logs HTTP requests:
```typescript
import { requestLogger } from '../shared/middleware';
app.use(requestLogger);
```

## Best Practices

1. **Keep it DRY**: Add any code that's used in multiple services to shared
2. **Type Safety**: Always export proper TypeScript types
3. **No Service-Specific Logic**: Only generic, reusable code belongs here
4. **Documentation**: Document all exports with JSDoc comments
5. **Backwards Compatibility**: Changes to shared code affect all services
6. **Testing**: Test shared utilities thoroughly

## Adding New Shared Resources

When adding new shared resources:

1. Place in the appropriate subdirectory (types/, utils/, constants/, middleware/)
2. Export from the subdirectory's index.ts
3. Update this README with usage examples
4. Ensure TypeScript types are properly defined
5. Add unit tests for utilities and middleware
6. Consider impact on all services before making breaking changes
