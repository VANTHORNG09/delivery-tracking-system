# Service Architecture

## Overview

The Delivery Tracking System is organized as a modular monolith with clear service boundaries, making it ready for potential microservices migration. Each domain is isolated with its own responsibilities and can be extracted into a separate service when needed.

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Delivery Tracking System                  │
│                      (Modular Monolith)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Orders     │  │   Tracking   │      │
│  │   Domain     │  │   Domain     │  │   Domain     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Shared Resources                      │     │
│  │  (Types, Utils, Constants, Middleware)             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Database Layer (Prisma)                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │   PostgreSQL   │
                   └────────────────┘
```

## Service Domains

### 1. Authentication Service (Auth Domain)

**Responsibility**: User authentication, authorization, and user management

**Core Functions**:
- User registration
- User login/logout
- JWT token generation and validation
- Password hashing and verification
- Role-based access control (RBAC)
- User profile management

**API Endpoints**:
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

**Database Tables**:
- `users` - User information and credentials

**Key Dependencies**:
- jsonwebtoken - JWT token handling
- bcryptjs - Password hashing
- express-validator - Input validation

**Future Microservice Considerations**:
- Can be extracted with user database
- Would communicate via JWT tokens
- Could use Redis for session management

---

### 2. Orders Service (Orders Domain)

**Responsibility**: Parcel creation, management, and order lifecycle

**Core Functions**:
- Create new parcels/orders
- Update parcel information
- Delete/cancel parcels
- List parcels with filtering
- Manage parcel status
- Calculate shipping costs (future)
- Handle special instructions

**API Endpoints**:
- `POST /api/v1/parcels` - Create new parcel
- `GET /api/v1/parcels` - List all parcels (with filters)
- `GET /api/v1/parcels/:id` - Get parcel by ID
- `PATCH /api/v1/parcels/:id` - Update parcel
- `DELETE /api/v1/parcels/:id` - Delete parcel
- `PATCH /api/v1/parcels/:id/status` - Update parcel status

**Database Tables**:
- `parcels` - Parcel information
- `tracking_events` - Status change history

**Key Dependencies**:
- Prisma Client - Database operations
- express-validator - Input validation

**Future Microservice Considerations**:
- Would own parcels table
- Publish events on status changes
- Subscribe to tracking updates

---

### 3. Tracking Service (Tracking Domain)

**Responsibility**: Real-time tracking, location updates, and delivery management

**Core Functions**:
- Track parcel by tracking number
- Manage deliveries
- Assign drivers to deliveries
- Update delivery status
- Record GPS locations
- Calculate estimated delivery time
- Provide delivery history

**API Endpoints**:
- `GET /api/v1/parcels/tracking/:trackingNumber` - Track parcel
- `POST /api/v1/deliveries` - Create delivery
- `GET /api/v1/deliveries` - List deliveries
- `GET /api/v1/deliveries/:id` - Get delivery details
- `PATCH /api/v1/deliveries/:id/assign` - Assign driver
- `PATCH /api/v1/deliveries/:id/start` - Start delivery
- `PATCH /api/v1/deliveries/:id/complete` - Complete delivery
- `POST /api/v1/deliveries/:id/location` - Update driver location

**Database Tables**:
- `deliveries` - Delivery assignments
- `locations` - GPS tracking data
- `tracking_events` - Event history

**Key Dependencies**:
- Prisma Client - Database operations
- Date/time utilities - ETA calculations

**Future Microservice Considerations**:
- Would own deliveries and locations tables
- Could use WebSocket for real-time updates
- Publish location events to message queue

---

### 4. Notifications Service (Future)

**Responsibility**: Customer notifications and communication

**Core Functions** (Planned):
- Send email notifications
- Send SMS notifications
- Push notifications
- Notification templates
- Delivery alerts
- Status change notifications

**Future API Endpoints**:
- `POST /api/v1/notifications/email` - Send email
- `POST /api/v1/notifications/sms` - Send SMS
- `GET /api/v1/notifications/preferences` - Get notification preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

**Planned Integration**:
- Email service (SendGrid, SES, etc.)
- SMS service (Twilio, etc.)
- Push notification service (FCM, etc.)

---

### 5. API Gateway (Future)

**Responsibility**: Request routing, rate limiting, API composition

**Core Functions** (Planned):
- Route requests to appropriate services
- API rate limiting
- Request/response logging
- API versioning
- Authentication middleware
- Load balancing
- Circuit breaker pattern

**Future Implementation**:
- Could use Express.js with http-proxy-middleware
- Or dedicated gateway like Kong, Nginx, or AWS API Gateway

---

## Shared Resources

### Location
`/shared/`

### Contents
- **types/** - Common TypeScript interfaces and types
- **utils/** - Reusable utility functions
- **constants/** - Application constants and enums
- **middleware/** - Shared middleware functions

### Usage
All services import from the shared directory to maintain consistency and reduce code duplication.

```typescript
import { ApiResponse, UserRole } from '../shared/types';
import { formatApiResponse, generateTrackingNumber } from '../shared/utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../shared/constants';
```

---

## Data Flow

### 1. Create Parcel Flow
```
Client → Auth Middleware → Orders Controller → Orders Service → Database
                              ↓
                         Response to Client
```

### 2. Track Parcel Flow
```
Client → Auth Middleware → Tracking Controller → Tracking Service → Database
                              ↓
                    Query tracking_events & locations
                              ↓
                         Response to Client
```

### 3. Update Location Flow
```
Driver App → Auth Middleware → Tracking Controller → Tracking Service → Database
                                      ↓
                              Record GPS coordinates
                                      ↓
                           Update delivery status (if needed)
                                      ↓
                         Response to Driver App
```

---

## Migration to Microservices

### Step 1: Extract Authentication Service
- Move auth controllers and middleware
- Set up dedicated database or schema
- Implement JWT-based inter-service communication
- Deploy as separate container

### Step 2: Extract Tracking Service
- Move tracking and delivery logic
- Set up location tracking database
- Implement event-driven updates
- Add WebSocket support for real-time tracking

### Step 3: Extract Orders Service
- Move parcel management logic
- Set up orders database
- Implement event publishing on status changes
- Add messaging queue (RabbitMQ, Kafka)

### Step 4: Add Notifications Service
- Implement notification system
- Subscribe to order and tracking events
- Integrate with email/SMS providers
- Set up notification preferences

### Step 5: Implement API Gateway
- Set up gateway service
- Configure routing rules
- Implement rate limiting
- Add API composition layer

---

## Communication Patterns

### Current (Monolith)
- Direct function calls
- Shared database access

### Future (Microservices)
- **Synchronous**: REST APIs, gRPC
- **Asynchronous**: Message queues (RabbitMQ, Kafka)
- **Real-time**: WebSockets, Server-Sent Events
- **Service Discovery**: Consul, etcd, or Kubernetes DNS

---

## Database Strategy

### Current
- Single PostgreSQL database
- Shared schema across domains
- Prisma ORM for data access

### Future Options

#### Option 1: Database per Service
```
Auth Service → User DB (PostgreSQL)
Orders Service → Orders DB (PostgreSQL)
Tracking Service → Tracking DB (PostgreSQL/TimescaleDB)
```

#### Option 2: Shared Database with Schemas
```
PostgreSQL
├── auth_schema
├── orders_schema
└── tracking_schema
```

#### Option 3: Polyglot Persistence
```
Auth Service → PostgreSQL (relational data)
Orders Service → PostgreSQL (transactional data)
Tracking Service → TimescaleDB (time-series location data)
Notifications Service → MongoDB (flexible notification logs)
```

---

## Technology Recommendations

### For Microservices Migration

**API Gateway**:
- Kong Gateway
- Nginx with lua
- AWS API Gateway
- Express.js with http-proxy-middleware

**Message Queue**:
- RabbitMQ (easier setup)
- Apache Kafka (high throughput)
- AWS SQS (managed service)

**Service Discovery**:
- Consul
- etcd
- Kubernetes built-in DNS

**Monitoring & Logging**:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Prometheus + Grafana
- Datadog or New Relic (managed)

**Container Orchestration**:
- Docker Compose (development)
- Kubernetes (production)
- AWS ECS/EKS (managed)

---

## Best Practices

1. **Clear Boundaries**: Each service owns its data and business logic
2. **Loose Coupling**: Services communicate via well-defined APIs
3. **Independent Deployment**: Services can be deployed independently
4. **Fault Tolerance**: Implement circuit breakers and retries
5. **Monitoring**: Comprehensive logging and monitoring for each service
6. **API Versioning**: Use versioned APIs to prevent breaking changes
7. **Documentation**: Keep API documentation up to date
8. **Testing**: Unit tests, integration tests, and end-to-end tests

---

## Performance Considerations

- **Caching**: Implement Redis for frequently accessed data
- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: Efficient database connection management
- **Rate Limiting**: Prevent API abuse
- **Load Balancing**: Distribute load across service instances
- **Asynchronous Processing**: Use queues for non-critical operations

---

## Security Considerations

- **Authentication**: JWT tokens with proper expiration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Validate all inputs
- **SQL Injection Protection**: Use parameterized queries (Prisma handles this)
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Configure proper CORS policies
- **Security Headers**: Use Helmet.js for security headers
