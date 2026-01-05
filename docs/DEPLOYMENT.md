# Deployment Guide

This guide covers deploying the Delivery Tracking System to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployments](#cloud-deployments)
5. [Database Setup](#database-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Scaling Strategies](#scaling-strategies)

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker (for containerized deployment)
- Git

## Environment Configuration

### Production Environment Variables

Create a `.env` file with production values:

```env
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@host:5432/delivery_tracking?schema=public"

# JWT Authentication
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Generating Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

## Docker Deployment

### Using Docker Compose

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd delivery-tracking-system
   ```

2. **Update docker-compose.yml** with production values:
   ```yaml
   environment:
     NODE_ENV: production
     PORT: 3000
     DATABASE_URL: postgresql://user:password@postgres:5432/delivery_tracking
     JWT_SECRET: <your-secret>
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

5. **Stop services**:
   ```bash
   docker-compose down
   ```

### Building Custom Docker Image

```bash
# Build image
docker build -t delivery-tracking-system:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  --name delivery-tracking-app \
  delivery-tracking-system:latest
```

## Cloud Deployments

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)

1. **Push Docker image to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag delivery-tracking-system:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/delivery-tracking-system:latest
   
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/delivery-tracking-system:latest
   ```

2. **Create RDS PostgreSQL instance**

3. **Configure ECS task definition** with environment variables

4. **Deploy to ECS cluster**

#### Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p docker delivery-tracking-system

# Create environment
eb create production-env

# Deploy
eb deploy
```

### Heroku Deployment

1. **Create Heroku app**:
   ```bash
   heroku create delivery-tracking-system
   ```

2. **Add PostgreSQL addon**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=<your-secret>
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Run migrations**:
   ```bash
   heroku run npm run prisma:migrate
   ```

### DigitalOcean App Platform

1. **Create new app** from GitHub repository

2. **Configure build settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Add PostgreSQL database**

4. **Set environment variables** in App Platform dashboard

5. **Deploy**

### Google Cloud Platform (GCP)

#### Using Cloud Run

1. **Build and push to Container Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/delivery-tracking-system
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy delivery-tracking-system \
     --image gcr.io/PROJECT_ID/delivery-tracking-system \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,JWT_SECRET=<secret>
   ```

### Azure Deployment

#### Using Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name delivery-tracking-system \
  --image delivery-tracking-system:latest \
  --dns-name-label delivery-tracking \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    JWT_SECRET=<secret> \
    DATABASE_URL=<url>
```

## Database Setup

### PostgreSQL Setup

#### Production Database Checklist

- [ ] Create dedicated database user
- [ ] Set strong password
- [ ] Enable SSL connections
- [ ] Configure connection pooling
- [ ] Set up regular backups
- [ ] Enable query logging (temporarily for optimization)

#### Running Migrations

```bash
# Production migration (be careful!)
npm run prisma:migrate deploy

# Or using Docker
docker-compose exec app npx prisma migrate deploy
```

#### Database Backup

```bash
# Backup database
pg_dump -h hostname -U username -d delivery_tracking > backup.sql

# Restore database
psql -h hostname -U username -d delivery_tracking < backup.sql
```

### Connection Pooling

For production, use connection pooling:

```typescript
// Update src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

Or use PgBouncer for external connection pooling.

## Monitoring & Logging

### Application Monitoring

#### Using PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name delivery-tracking-system

# Monitor
pm2 monit

# View logs
pm2 logs delivery-tracking-system

# Restart
pm2 restart delivery-tracking-system

# Setup startup script
pm2 startup
pm2 save
```

#### Health Check Endpoint

Add a health check endpoint:

```typescript
// src/routes/health.ts
import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
    });
  }
});

export default router;
```

### Logging Services

#### Using Winston with CloudWatch (AWS)

```bash
npm install winston-cloudwatch
```

```typescript
// Update src/config/logger.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: '/aws/ecs/delivery-tracking-system',
      logStreamName: process.env.HOSTNAME || 'default',
      awsRegion: 'us-east-1',
    }),
  ],
});
```

#### Using External Services

- **Datadog**: Application performance monitoring
- **New Relic**: Full-stack observability
- **Sentry**: Error tracking
- **LogDNA**: Log management

## Scaling Strategies

### Horizontal Scaling

#### Load Balancing with Nginx

```nginx
upstream delivery_tracking {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://delivery_tracking;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Scaling

- **Read Replicas**: Use PostgreSQL read replicas for read-heavy operations
- **Connection Pooling**: Use PgBouncer
- **Caching**: Implement Redis for frequently accessed data

### Caching Strategy

```typescript
// Example: Using Redis for caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache parcel tracking data
export const getParcelTracking = async (trackingNumber: string) => {
  const cached = await redis.get(`tracking:${trackingNumber}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const tracking = await fetchFromDatabase(trackingNumber);
  await redis.setex(`tracking:${trackingNumber}`, 300, JSON.stringify(tracking));
  
  return tracking;
};
```

## Security Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Set strong JWT secret
- [ ] Enable CORS for specific origins only
- [ ] Implement rate limiting
- [ ] Use environment variables for sensitive data
- [ ] Enable database SSL connections
- [ ] Keep dependencies updated
- [ ] Implement input validation
- [ ] Use helmet.js for security headers
- [ ] Enable database query logging (temporarily)
- [ ] Set up firewalls and security groups

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t delivery-tracking-system .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push delivery-tracking-system:latest
      
      - name: Deploy to production
        run: |
          # Your deployment commands
```

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Check DATABASE_URL
   - Verify database is accessible
   - Check firewall rules

2. **Memory Issues**
   - Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096`
   - Monitor memory usage with PM2

3. **High CPU Usage**
   - Check for infinite loops
   - Optimize database queries
   - Implement caching

## Support

For deployment issues:
- Check logs: `docker-compose logs` or `pm2 logs`
- Review [troubleshooting guide](./README.md#troubleshooting)
- Create an issue on GitHub
