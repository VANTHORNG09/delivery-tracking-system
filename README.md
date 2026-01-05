# Delivery Tracking System

A comprehensive RESTful API for managing delivery tracking operations, including parcel management, real-time tracking, driver assignments, and location updates.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Customer, Driver)
- 📦 **Parcel Management**: Create, track, and manage parcels with unique tracking numbers
- 🚚 **Delivery Management**: Assign deliveries to drivers, track delivery status, and update locations
- 📍 **Real-time Location Tracking**: Track driver locations with GPS coordinates
- 📊 **Status History**: Complete tracking event history for each parcel
- 🔒 **Security**: Helmet.js, CORS, password hashing with bcrypt
- 📝 **Logging**: Winston logger with file and console transports
- 🐳 **Docker Support**: Containerized application with Docker and Docker Compose

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, bcryptjs

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd delivery-tracking-system
```

2. Start the application with Docker Compose:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### Manual Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd delivery-tracking-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_tracking?schema=public"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Parcel Endpoints

#### Create Parcel
```http
POST /parcels
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Important documents",
  "weight": 2.5,
  "dimensions": "30x20x10 cm",
  "value": 100,
  "priority": "EXPRESS",
  "receiverId": "receiver-uuid",
  "pickupAddress": "123 Main St, City",
  "deliveryAddress": "456 Oak Ave, City",
  "estimatedDelivery": "2024-01-20T10:00:00Z",
  "specialInstructions": "Handle with care"
}
```

#### Get All Parcels
```http
GET /parcels?status=PENDING
Authorization: Bearer <token>
```

#### Get Parcel by ID
```http
GET /parcels/:id
Authorization: Bearer <token>
```

#### Track Parcel
```http
GET /parcels/tracking/:trackingNumber
Authorization: Bearer <token>
```

#### Update Parcel Status
```http
PATCH /parcels/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PICKED_UP",
  "description": "Parcel picked up from sender",
  "location": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### Delete Parcel
```http
DELETE /parcels/:id
Authorization: Bearer <token>
```

### Delivery Endpoints

#### Create Delivery
```http
POST /deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "parcelId": "parcel-uuid",
  "driverId": "driver-uuid"
}
```

#### Get All Deliveries
```http
GET /deliveries
Authorization: Bearer <token>
```

#### Get Delivery by ID
```http
GET /deliveries/:id
Authorization: Bearer <token>
```

#### Assign Driver
```http
PATCH /deliveries/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "driverId": "driver-uuid"
}
```

#### Start Delivery
```http
PATCH /deliveries/:id/start
Authorization: Bearer <token>
```

#### Complete Delivery
```http
PATCH /deliveries/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Delivered to recipient",
  "proofOfDelivery": "base64-image-string",
  "signature": "base64-signature-string"
}
```

#### Update Driver Location
```http
POST /deliveries/:id/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5
}
```

## User Roles

- **ADMIN**: Full access to all endpoints, can manage deliveries and assign drivers
- **CUSTOMER**: Can create parcels, view own parcels and tracking information
- **DRIVER**: Can view assigned deliveries, update delivery status, and report locations

## Parcel Status Flow

1. `PENDING` - Parcel created, awaiting pickup
2. `PICKED_UP` - Parcel picked up from sender
3. `IN_TRANSIT` - Parcel in transit to destination
4. `OUT_FOR_DELIVERY` - Driver is delivering the parcel
5. `DELIVERED` - Parcel successfully delivered
6. `FAILED` - Delivery failed
7. `CANCELLED` - Parcel cancelled

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Database Schema

The system uses the following main entities:

- **User**: Stores user information (customers, drivers, admins)
- **Parcel**: Represents packages/parcels to be delivered
- **Delivery**: Links parcels to drivers and tracks delivery progress
- **TrackingEvent**: Records status changes and events for parcels
- **Location**: Stores GPS coordinates for driver location tracking

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire based on `JWT_EXPIRES_IN` configuration
- CORS is configured to allow specific origins
- Helmet.js adds security headers
- Input validation on all endpoints
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or create an issue in the repository.
