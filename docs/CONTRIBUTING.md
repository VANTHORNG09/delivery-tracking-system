# Contributing to Delivery Tracking System

Thank you for considering contributing to the Delivery Tracking System! This document provides guidelines and standards for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Testing Guidelines](#testing-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Project Structure](#project-structure)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (optional but recommended)
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/delivery-tracking-system.git
   cd delivery-tracking-system
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up postgres -d
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

7. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-notification-service`
- `fix/tracking-number-validation`
- `docs/update-api-documentation`

## Coding Standards

### TypeScript Guidelines

1. **Use TypeScript strictly**
   ```typescript
   // ✅ Good
   function calculateTotal(price: number, quantity: number): number {
     return price * quantity;
   }

   // ❌ Bad
   function calculateTotal(price: any, quantity: any) {
     return price * quantity;
   }
   ```

2. **Define interfaces for data structures**
   ```typescript
   // ✅ Good
   interface User {
     id: string;
     email: string;
     role: UserRole;
   }

   // ❌ Bad - using any
   const user: any = { id: '1', email: 'test@example.com' };
   ```

3. **Use enums for fixed sets of values**
   ```typescript
   // ✅ Good
   enum ParcelStatus {
     PENDING = 'PENDING',
     IN_TRANSIT = 'IN_TRANSIT',
     DELIVERED = 'DELIVERED',
   }

   // ❌ Bad - magic strings
   const status = 'PENDING';
   ```

### Code Style

1. **Use async/await instead of callbacks**
   ```typescript
   // ✅ Good
   async function getUser(id: string): Promise<User> {
     const user = await UserModel.findUnique({ where: { id } });
     return user;
   }

   // ❌ Bad
   function getUser(id: string, callback: Function) {
     UserModel.findUnique({ where: { id } }, callback);
   }
   ```

2. **Use arrow functions for callbacks**
   ```typescript
   // ✅ Good
   users.map((user) => user.email);

   // ❌ Bad
   users.map(function(user) {
     return user.email;
   });
   ```

3. **Destructure objects and arrays**
   ```typescript
   // ✅ Good
   const { email, firstName, lastName } = user;

   // ❌ Bad
   const email = user.email;
   const firstName = user.firstName;
   const lastName = user.lastName;
   ```

4. **Use const and let, never var**
   ```typescript
   // ✅ Good
   const API_VERSION = 'v1';
   let counter = 0;

   // ❌ Bad
   var API_VERSION = 'v1';
   var counter = 0;
   ```

### Error Handling

1. **Use custom error classes**
   ```typescript
   // ✅ Good
   if (!user) {
     throw new NotFoundError('User not found');
   }

   // ❌ Bad
   if (!user) {
     throw new Error('User not found');
   }
   ```

2. **Wrap async route handlers**
   ```typescript
   // ✅ Good
   router.get('/users/:id', asyncHandler(async (req, res) => {
     const user = await getUser(req.params.id);
     res.json(formatApiResponse(user));
   }));

   // ❌ Bad
   router.get('/users/:id', async (req, res) => {
     try {
       const user = await getUser(req.params.id);
       res.json(user);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

### Naming Conventions

1. **Files and Folders**
   - Use kebab-case for files: `user-controller.ts`
   - Use camelCase for folders: `middleware/`, `controllers/`

2. **Variables and Functions**
   - Use camelCase: `getUserById`, `trackingNumber`
   - Use descriptive names: `isActive` not `flag`

3. **Classes and Interfaces**
   - Use PascalCase: `UserService`, `ApiResponse`
   - Prefix interfaces with 'I' is optional

4. **Constants**
   - Use UPPER_SNAKE_CASE: `MAX_RETRY_ATTEMPTS`, `API_VERSION`

5. **Private Members**
   - Prefix with underscore: `_privateMethod`, `_internalState`

### Import Organization

```typescript
// 1. External imports
import express from 'express';
import { body, validationResult } from 'express-validator';

// 2. Internal imports (absolute)
import { asyncHandler } from '@/middleware/asyncHandler';
import { UserModel } from '@/models';

// 3. Internal imports (relative)
import { formatApiResponse } from '../utils';
import { NotFoundError } from '../utils/errors';

// 4. Type imports
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
```

### Comments and Documentation

1. **Use JSDoc for functions**
   ```typescript
   /**
    * Calculate distance between two coordinates
    * @param lat1 - Latitude of first point
    * @param lon1 - Longitude of first point
    * @param lat2 - Latitude of second point
    * @param lon2 - Longitude of second point
    * @returns Distance in kilometers
    */
   function calculateDistance(
     lat1: number,
     lon1: number,
     lat2: number,
     lon2: number
   ): number {
     // Implementation
   }
   ```

2. **Comment complex logic**
   ```typescript
   // Calculate estimated delivery time based on distance and traffic
   const estimatedTime = baseTime + (distance * SPEED_FACTOR) + trafficDelay;
   ```

3. **Avoid obvious comments**
   ```typescript
   // ❌ Bad - obvious
   // Set user email
   user.email = email;

   // ✅ Good - explains why
   // Email must be verified before activation
   user.email = email;
   user.isVerified = false;
   ```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

Implement password reset with email verification.
Includes new endpoints and email templates.

Closes #123
```

```bash
fix(tracking): correct tracking number validation

Fix regex pattern to allow alphanumeric characters.

Fixes #456
```

```bash
docs(api): update authentication documentation

Add examples for JWT token usage and refresh tokens.
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issues in commit messages
- Use present tense ("add feature" not "added feature")

## Testing Guidelines

### Writing Tests

1. **Test File Naming**
   - Unit tests: `*.test.ts` or `*.spec.ts`
   - Integration tests: `*.integration.test.ts`
   - Place tests in `__tests__/` directory

2. **Test Structure**
   ```typescript
   describe('UserService', () => {
     describe('createUser', () => {
       it('should create a new user', async () => {
         // Arrange
         const userData = { email: 'test@example.com', password: 'pass123' };

         // Act
         const user = await createUser(userData);

         // Assert
         expect(user.email).toBe(userData.email);
         expect(user.id).toBeDefined();
       });

       it('should throw error for duplicate email', async () => {
         // Test implementation
       });
     });
   });
   ```

3. **Test Coverage**
   - Aim for at least 80% code coverage
   - Test edge cases and error conditions
   - Test both success and failure paths

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test
   ```

2. **Run linting**
   ```bash
   npm run lint
   npm run lint:fix
   ```

3. **Format code**
   ```bash
   npm run format
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Update documentation** if needed

### Submitting Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Use a descriptive title
   - Reference related issues
   - Provide detailed description of changes
   - Add screenshots for UI changes

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues
   Fixes #123

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally
   ```

### Code Review Process

1. Wait for at least one approval
2. Address review comments
3. Keep discussions constructive
4. Update PR based on feedback
5. Request re-review after changes

## Project Structure

```
delivery-tracking-system/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── __tests__/       # Test files
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── shared/              # Shared resources
│   ├── types/           # TypeScript types
│   ├── utils/           # Shared utilities
│   ├── constants/       # Shared constants
│   └── middleware/      # Shared middleware
├── prisma/              # Database schema and migrations
├── docs/                # Documentation
├── logs/                # Application logs
└── dist/                # Compiled output
```

## Questions?

If you have questions:
- Check existing issues
- Review documentation
- Ask in discussions
- Create a new issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
