# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Validation Error Response

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Successful with no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Validation**:
- `email`: Valid email format, max 255 characters
- `password`: Min 6 characters, max 128 characters
- `firstName`: Required, min 2 characters
- `lastName`: Required, min 2 characters
- `phone`: Optional, valid phone format
- `role`: One of: ADMIN, CUSTOMER, DRIVER (default: CUSTOMER)

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "token": "jwt-token"
  }
}
```

**Error Responses**:
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Validation error

---

### Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "token": "jwt-token"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid credentials
- `422 Unprocessable Entity` - Validation error

---

### Get Profile

Get authenticated user's profile.

**Endpoint**: `GET /auth/profile`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Parcel Endpoints

### Create Parcel

Create a new parcel for delivery.

**Endpoint**: `POST /parcels`

**Authentication**: Required (CUSTOMER or ADMIN)

**Request Body**:
```json
{
  "description": "Important documents",
  "weight": 2.5,
  "dimensions": "30x20x10 cm",
  "value": 100.00,
  "priority": "EXPRESS",
  "receiverId": "receiver-uuid",
  "pickupAddress": "123 Main St, City, Country",
  "deliveryAddress": "456 Oak Ave, City, Country",
  "estimatedDelivery": "2024-01-20T10:00:00Z",
  "specialInstructions": "Handle with care"
}
```

**Validation**:
- `description`: Required, min 5 characters
- `weight`: Required, positive number
- `dimensions`: Optional string
- `value`: Optional, positive number
- `priority`: One of: STANDARD, EXPRESS, URGENT
- `receiverId`: Valid UUID
- `pickupAddress`: Required, min 10 characters
- `deliveryAddress`: Required, min 10 characters
- `estimatedDelivery`: Optional, future date
- `specialInstructions`: Optional string

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Parcel created successfully",
  "data": {
    "id": "uuid",
    "trackingNumber": "TRK123ABC456",
    "description": "Important documents",
    "weight": 2.5,
    "status": "PENDING",
    "priority": "EXPRESS",
    "sender": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "receiver": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "pickupAddress": "123 Main St, City, Country",
    "deliveryAddress": "456 Oak Ave, City, Country",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Parcels

Get list of parcels with optional filtering.

**Endpoint**: `GET /parcels`

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status (PENDING, IN_TRANSIT, etc.)
- `priority` - Filter by priority (STANDARD, EXPRESS, URGENT)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Example**: `GET /parcels?status=PENDING&page=1&limit=20`

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "trackingNumber": "TRK123ABC456",
      "description": "Important documents",
      "status": "PENDING",
      "priority": "EXPRESS",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Authorization**:
- ADMIN: Can view all parcels
- CUSTOMER: Can only view own parcels (sender or receiver)
- DRIVER: Can view assigned parcels

---

### Get Parcel by ID

Get detailed information about a specific parcel.

**Endpoint**: `GET /parcels/:id`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "trackingNumber": "TRK123ABC456",
    "description": "Important documents",
    "weight": 2.5,
    "dimensions": "30x20x10 cm",
    "value": 100.00,
    "priority": "EXPRESS",
    "status": "IN_TRANSIT",
    "sender": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "receiver": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "pickupAddress": "123 Main St, City",
    "deliveryAddress": "456 Oak Ave, City",
    "pickupDate": "2024-01-01T10:00:00.000Z",
    "estimatedDelivery": "2024-01-05T10:00:00.000Z",
    "specialInstructions": "Handle with care",
    "trackingEvents": [
      {
        "status": "PENDING",
        "description": "Parcel created",
        "timestamp": "2024-01-01T09:00:00.000Z"
      },
      {
        "status": "PICKED_UP",
        "description": "Parcel picked up",
        "location": "123 Main St, City",
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T09:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found` - Parcel not found
- `403 Forbidden` - Not authorized to view this parcel

---

### Track Parcel

Track a parcel using its tracking number.

**Endpoint**: `GET /parcels/tracking/:trackingNumber`

**Authentication**: Not required (public endpoint)

**Example**: `GET /parcels/tracking/TRK123ABC456`

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "trackingNumber": "TRK123ABC456",
    "status": "IN_TRANSIT",
    "currentLocation": "Distribution Center, City",
    "estimatedDelivery": "2024-01-05T10:00:00.000Z",
    "events": [
      {
        "status": "PENDING",
        "description": "Parcel created and awaiting pickup",
        "timestamp": "2024-01-01T09:00:00.000Z"
      },
      {
        "status": "PICKED_UP",
        "description": "Parcel picked up from sender",
        "location": "123 Main St, City",
        "timestamp": "2024-01-01T10:00:00.000Z"
      },
      {
        "status": "IN_TRANSIT",
        "description": "Parcel in transit to destination",
        "location": "Distribution Center",
        "timestamp": "2024-01-02T08:00:00.000Z"
      }
    ]
  }
}
```

---

### Update Parcel Status

Update the status of a parcel and create a tracking event.

**Endpoint**: `PATCH /parcels/:id/status`

**Authentication**: Required (ADMIN or DRIVER)

**Request Body**:
```json
{
  "status": "IN_TRANSIT",
  "description": "Parcel is on the way",
  "location": "Distribution Center, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Parcel status updated successfully",
  "data": {
    "id": "uuid",
    "trackingNumber": "TRK123ABC456",
    "status": "IN_TRANSIT",
    "updatedAt": "2024-01-02T08:00:00.000Z"
  }
}
```

---

### Delete Parcel

Delete a parcel (soft delete or hard delete based on status).

**Endpoint**: `DELETE /parcels/:id`

**Authentication**: Required (ADMIN or parcel sender)

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Parcel deleted successfully"
}
```

**Error Responses**:
- `404 Not Found` - Parcel not found
- `403 Forbidden` - Cannot delete parcel in current status
- `409 Conflict` - Parcel has active delivery

---

## Delivery Endpoints

### Create Delivery

Create a delivery assignment for a parcel.

**Endpoint**: `POST /deliveries`

**Authentication**: Required (ADMIN)

**Request Body**:
```json
{
  "parcelId": "parcel-uuid",
  "driverId": "driver-uuid"
}
```

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Delivery created successfully",
  "data": {
    "id": "uuid",
    "parcelId": "parcel-uuid",
    "driverId": "driver-uuid",
    "assignedAt": "2024-01-01T10:00:00.000Z",
    "parcel": {
      "trackingNumber": "TRK123ABC456",
      "description": "Important documents"
    },
    "driver": {
      "firstName": "Mike",
      "lastName": "Driver"
    }
  }
}
```

---

### Get All Deliveries

Get list of deliveries.

**Endpoint**: `GET /deliveries`

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status
- `driverId` - Filter by driver
- `page` - Page number
- `limit` - Items per page

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "parcel": {
        "trackingNumber": "TRK123ABC456",
        "description": "Important documents",
        "deliveryAddress": "456 Oak Ave"
      },
      "driver": {
        "firstName": "Mike",
        "lastName": "Driver"
      },
      "assignedAt": "2024-01-01T10:00:00.000Z",
      "startedAt": "2024-01-01T11:00:00.000Z"
    }
  ]
}
```

---

### Assign Driver

Assign or reassign a driver to a delivery.

**Endpoint**: `PATCH /deliveries/:id/assign`

**Authentication**: Required (ADMIN)

**Request Body**:
```json
{
  "driverId": "driver-uuid"
}
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Driver assigned successfully",
  "data": {
    "id": "uuid",
    "driverId": "driver-uuid",
    "assignedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Start Delivery

Mark a delivery as started.

**Endpoint**: `PATCH /deliveries/:id/start`

**Authentication**: Required (DRIVER or ADMIN)

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Delivery started successfully",
  "data": {
    "id": "uuid",
    "startedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

---

### Complete Delivery

Mark a delivery as completed.

**Endpoint**: `PATCH /deliveries/:id/complete`

**Authentication**: Required (DRIVER or ADMIN)

**Request Body**:
```json
{
  "notes": "Delivered to recipient",
  "proofOfDelivery": "base64-image-string",
  "signature": "base64-signature-string"
}
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Delivery completed successfully",
  "data": {
    "id": "uuid",
    "completedAt": "2024-01-01T15:00:00.000Z",
    "notes": "Delivered to recipient"
  }
}
```

---

### Update Driver Location

Update current GPS location during delivery.

**Endpoint**: `POST /deliveries/:id/location`

**Authentication**: Required (DRIVER or ADMIN)

**Request Body**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5
}
```

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Location updated successfully",
  "data": {
    "id": "uuid",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5,
    "timestamp": "2024-01-01T12:30:00.000Z"
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by
- `sortOrder` - Sort order: asc or desc

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Webhooks (Future Feature)

Subscribe to events:
- `parcel.created`
- `parcel.status_changed`
- `delivery.assigned`
- `delivery.completed`

---

## SDKs and Client Libraries (Future)

Official SDKs will be available for:
- JavaScript/TypeScript
- Python
- Java
- Go

---

## Support

For API support:
- GitHub Issues: [repository-url]/issues
- Email: support@example.com
- Documentation: [repository-url]/docs
