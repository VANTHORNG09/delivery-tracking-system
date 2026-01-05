# Delivery Tracking System - Documentation

## Table of Contents

1. [Overview](../README.md)
2. [Service Architecture](./SERVICE_ARCHITECTURE.md)
3. [Contributing Guidelines](./CONTRIBUTING.md)
4. [API Documentation](./API.md)
5. [Development Guide](#development-guide)
6. [Deployment Guide](#deployment-guide)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

## Development Guide

### Project Structure

```
delivery-tracking-system/
├── src/                    # Source code
│   ├── config/            # Configuration (database, logger, environment)
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── __tests__/         # Test files
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # Integration tests
│   ├── app.ts             # Express application setup
│   └── server.ts          # Server entry point
│
├── shared/                 # Shared resources across services
│   ├── types/             # TypeScript interfaces and types
│   ├── utils/             # Common utility functions
│   ├── constants/         # Shared constants and enums
│   └── middleware/        # Shared middleware
│
├── prisma/                 # Database
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts            # Database seeding
│
├── docs/                   # Documentation
│   ├── SERVICE_ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── API.md
│
├── logs/                   # Application logs
├── dist/                   # Compiled output
│
├── .env.example           # Environment variables template
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker image definition
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
└── package.json           # Dependencies and scripts
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_tracking?schema=public"

# JWT Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:seed      # Seed database with test data

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

## Deployment Guide

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd delivery-tracking-system
   ```

2. **Configure environment variables**:
   ```bash
   # Edit docker-compose.yml or create .env file
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **Check logs**:
   ```bash
   docker-compose logs -f app
   ```

5. **Stop services**:
   ```bash
   docker-compose down
   ```

### Manual Deployment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

### Production Considerations

1. **Security**:
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Configure CORS properly
   - Use environment-specific configurations
   - Implement rate limiting

2. **Database**:
   - Use connection pooling
   - Set up regular backups
   - Monitor query performance
   - Use read replicas for scaling

3. **Monitoring**:
   - Set up application monitoring (New Relic, Datadog)
   - Configure log aggregation (ELK Stack)
   - Set up alerts for errors and performance issues
   - Monitor database performance

4. **Scaling**:
   - Use load balancer (Nginx, HAProxy)
   - Deploy multiple instances
   - Use Redis for caching
   - Consider CDN for static assets

## Testing Guide

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/unit/utils/errors.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Structure

```typescript
describe('Feature/Component Name', () => {
  // Setup
  beforeAll(() => {
    // Run once before all tests
  });

  beforeEach(() => {
    // Run before each test
  });

  afterEach(() => {
    // Run after each test
  });

  afterAll(() => {
    // Run once after all tests
  });

  // Test cases
  describe('Specific functionality', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Writing Integration Tests

```typescript
import request from 'supertest';
import app from '../../app';

describe('Auth API Integration Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Problem**: Cannot connect to PostgreSQL database

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### 2. Migration Errors

**Problem**: Prisma migration fails

**Solution**:
```bash
# Reset database (DEV ONLY - will delete all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_issue

# Check migration status
npx prisma migrate status
```

#### 3. Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

#### 4. JWT Token Errors

**Problem**: Invalid or expired token errors

**Solution**:
- Ensure JWT_SECRET is set in .env
- Check token expiration time (JWT_EXPIRES_IN)
- Verify token format (Bearer <token>)
- Clear old tokens and get new ones

#### 5. TypeScript Compilation Errors

**Problem**: Build fails with TypeScript errors

**Solution**:
```bash
# Clear dist folder
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Debugging Tips

1. **Enable Debug Logging**:
   ```env
   LOG_LEVEL=debug
   ```

2. **Use Prisma Studio** to inspect database:
   ```bash
   npm run prisma:studio
   ```

3. **Check Application Logs**:
   ```bash
   # View error logs
   tail -f logs/error.log

   # View all logs
   tail -f logs/combined.log
   ```

4. **Use VS Code Debugger**:
   Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Dev Server",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "dev"],
         "skipFiles": ["<node_internals>/**"]
       }
     ]
   }
   ```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines

## License

MIT License - see LICENSE file for details
