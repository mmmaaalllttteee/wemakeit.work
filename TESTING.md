# Testing Guide - WMIW Platform

## Overview

This guide covers testing strategies, best practices, and instructions for the WMIW Platform.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Test Coverage](#test-coverage)
8. [Continuous Integration](#continuous-integration)

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /----\     Integration Tests (30%)
     /------\    Unit Tests (60%)
    /--------\
```

### Test Types

1. **Unit Tests** (60% of tests)
   - Test individual functions/methods
   - Fast execution (< 1ms each)
   - No external dependencies
   - Mock all dependencies

2. **Integration Tests** (30% of tests)
   - Test module interactions
   - Use test database
   - Real database queries
   - Moderate execution time

3. **E2E Tests** (10% of tests)
   - Test complete user flows
   - Full application stack
   - Real API requests
   - Slow execution

---

## Unit Testing

### What to Test

- Service methods
- Utility functions
- Data transformations
- Business logic
- Validation functions

### Example: Service Unit Test

```typescript
// audit.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  it('should create audit log', async () => {
    const dto = {
      action: 'project.created',
      resourceType: 'project',
    };

    mockRepository.create.mockReturnValue(dto);
    mockRepository.save.mockResolvedValue(dto);

    const result = await service.log('org-1', 'user-1', 'test@example.com', dto);

    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toEqual(dto);
  });
});
```

### Best Practices

- **Arrange-Act-Assert** pattern
- Clear test descriptions
- Mock external dependencies
- Test edge cases
- One assertion per test (when possible)
- Use descriptive variable names

---

## Integration Testing

### What to Test

- Controller endpoints
- Database operations
- Module interactions
- Authentication flows
- File upload/download

### Setup Test Database

```typescript
// test/database.helper.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'wmiw_test',
  entities: ['src/**/*.entity.ts'],
  synchronize: true, // Only for tests!
  dropSchema: true, // Clean slate for each test
});
```

### Example: Controller Integration Test

```typescript
// audit.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AuditController (integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });

    authToken = response.body.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /audit - should create audit log', () => {
    return request(app.getHttpServer())
      .post('/audit')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        action: 'project.created',
        resourceType: 'project',
        resourceId: 'proj-123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.action).toBe('project.created');
      });
  });
});
```

---

## E2E Testing

### What to Test

- Complete user journeys
- Critical business flows
- Cross-module interactions
- Real-world scenarios

### Example: Authentication Flow E2E

```typescript
// auth.e2e-spec.ts
describe('Authentication Flow (e2e)', () => {
  it('should complete full authentication flow', async () => {
    // 1. Register
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Test123!',
        name: 'New User',
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('tokens');

    // 2. Verify email (simulate)
    const { userId } = registerResponse.body.user;
    // ... email verification logic

    // 3. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'newuser@example.com',
        password: 'Test123!',
      })
      .expect(200);

    const { accessToken } = loginResponse.body.tokens;

    // 4. Access protected resource
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 5. Logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 6. Verify token invalidation
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
```

### Critical Flows to Test

1. **User Registration & Login**
   - Register → Verify Email → Login → Access Resources

2. **Project Creation & Collaboration**
   - Create Project → Upload Files → Invite Members → Share

3. **Contract Workflow**
   - Create Template → Generate Contract → Sign → Download PDF

4. **Analytics Connection**
   - Connect OAuth → Sync Metrics → View Analytics

5. **Real-time Collaboration**
   - Join Moodboard → See Cursors → Make Changes → Sync

---

## Running Tests

### Commands

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test audit.service.spec.ts

# Run tests matching pattern
pnpm test --testNamePattern="should create"
```

### Test Environment Setup

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Run migrations
pnpm migration:run

# 3. Seed test data (optional)
pnpm seed:test

# 4. Run tests
pnpm test
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: wmiw_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test:cov

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Writing Tests

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Initialize test environment
  });

  // Teardown
  afterEach(() => {
    // Clean up
  });

  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = {
        /* ... */
      };

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should throw error when invalid input', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => component.method(invalidInput)).toThrow('Invalid input');
    });
  });
});
```

### Mocking Strategies

#### Mock Repository

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  create: jest.fn(),
};
```

#### Mock External Services

```typescript
const mockMailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
};
```

#### Mock HTTP Requests

```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({
  data: {
    /* ... */
  },
});
```

### Test Data Factories

```typescript
// test/factories/user.factory.ts
export const createTestUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  orgId: 'org-123',
  createdAt: new Date(),
  ...overrides,
});

// Usage
const user = createTestUser({ email: 'custom@example.com' });
```

---

## Test Coverage

### Coverage Goals

- **Overall**: 80% minimum
- **Critical paths**: 100% (auth, payments, contracts)
- **Services**: 90%
- **Controllers**: 80%
- **Utilities**: 95%

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:cov

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Reports

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   82.5  |   78.3   |   85.1  |   82.8  |
 audit                    |   95.2  |   91.7   |   100   |   95.5  |
  audit.service.ts        |   95.2  |   91.7   |   100   |   95.5  |
 activity                 |   88.9  |   82.4   |   90.9  |   89.1  |
  activity.service.ts     |   88.9  |   82.4   |   90.9  |   89.1  |
--------------------------|---------|----------|---------|---------|
```

### Improving Coverage

1. Identify uncovered code: `pnpm test:cov`
2. Write tests for critical paths first
3. Add edge case tests
4. Test error handling
5. Mock external dependencies properly

---

## Best Practices

### DO

✅ Write descriptive test names
✅ Test one thing per test
✅ Use meaningful assertions
✅ Mock external dependencies
✅ Clean up after tests
✅ Test edge cases and errors
✅ Keep tests fast (< 100ms unit tests)
✅ Use factories for test data
✅ Run tests before committing
✅ Maintain test coverage above 80%

### DON'T

❌ Test implementation details
❌ Write flaky tests
❌ Skip error cases
❌ Use real external APIs
❌ Share state between tests
❌ Write overly complex tests
❌ Ignore failing tests
❌ Test private methods directly
❌ Hard-code test data everywhere
❌ Commit code without tests

---

## Debugging Tests

### Enable Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm test

# Run single test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand audit.service.spec.ts
```

### VSCode Launch Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

**Tests hanging**

- Check for unresolved promises
- Verify timeouts are set
- Close database connections

**Flaky tests**

- Check for race conditions
- Verify test isolation
- Mock time-dependent code

**Slow tests**

- Profile test execution
- Optimize database queries
- Reduce test data size

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: 2025-10-12
**Version**: 1.0.0
