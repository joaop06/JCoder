# Testing Configuration - Backend

This project is configured to run unit and integration tests using Jest with SWC for fast compilation.

## Configuration

### Installed Dependencies

- `@swc/cli` - SWC CLI
- `@swc/core` - SWC Core
- `@swc/jest` - Jest transformer for SWC
- `jest` - Testing framework
- `@types/jest` - TypeScript types for Jest
- `ts-jest` - Jest transformer for TypeScript (backup)
- `supertest` - For e2e tests
- `@types/supertest` - TypeScript types for supertest

### Configuration Files

- `.swcrc` - SWC configuration
- `jest.config.js` - Jest configuration
- `test/jest-e2e.json` - Configuration for e2e tests
- `test/setup.ts` - Global setup for unit tests
- `test/setup-e2e.ts` - Global setup for e2e tests

## Available Scripts

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run tests in debug mode
pnpm test:debug

# Run e2e tests
pnpm test:e2e
```

## Test Structure

### Unit Tests

Unit tests should be in the same directory as the files they test, with `.spec.ts` suffix:

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.controller.spec.ts  # Controller test
│   └── auth.service.ts
├── users/
│   ├── users.service.ts
│   └── users.service.spec.ts    # Service test
└── app.module.spec.ts           # Main module test
```

### E2E Tests

E2E tests should be in the `test/` directory with `.e2e-spec.ts` suffix:

```
test/
├── app.e2e-spec.ts              # Application e2e test
├── auth.e2e-spec.ts             # Authentication e2e test
└── users.e2e-spec.ts            # Users e2e test
```

## Test Examples

### Controller Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SignInUseCase } from './use-cases/sign-in.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let signInUseCase: SignInUseCase;

  const mockSignInUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignInUseCase,
          useValue: mockSignInUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signInUseCase = module.get<SignInUseCase>(SignInUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

### Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });
});
```

## Coverage Configuration

The coverage configuration is defined in `jest.config.js` and automatically excludes:

- Test files (`.spec.ts`)
- Interfaces (`.interface.ts`)
- DTOs (`.dto.ts`)
- Entities (`.entity.ts`)
- Enums (`.enum.ts`)
- Decorators (`.decorator.ts`)
- Guards, Interceptors, Pipes, Filters, Strategies, Middlewares
- Main files (`main.ts`, `app.module.ts`)

## Best Practices

1. **Naming**: Use descriptive names for tests
2. **Arrange-Act-Assert**: Structure tests with this pattern
3. **Mocks**: Use mocks for external dependencies
4. **Cleanup**: Always clean mocks between tests
5. **Isolation**: Each test should be independent
6. **Coverage**: Maintain adequate code coverage
7. **Performance**: Use SWC for fast compilation

## Troubleshooting

### Common Issues

1. **Import error**: Check if `moduleNameMapper` is correct in `jest.config.js`
2. **Timeout**: Increase `testTimeout` if necessary
3. **Memory leaks**: Use `forceExit: true` and clean resources properly
4. **SWC not working**: Check if `.swcrc` is configured correctly
5. **Circular dependencies**: If there are circular dependencies between entities (TypeORM), consider:
   - Using mocks for entities instead of importing them directly
   - Testing services in isolation without loading the entire module
   - Focus on testing more isolated components (DTOs, guards, interceptors, etc.)

### Debug

To debug tests:

```bash
# Run specific test
pnpm test pagination.dto.spec.ts

# Run with verbose
pnpm test --verbose

# Run in debug mode
pnpm test:debug

# Run only modified tests
pnpm test --onlyChanged
```

## Working Examples

### DTO Test

See `src/@common/dto/pagination.dto.spec.ts` for an example of a DTO test that validates transformations and validations.

### Controller Test

See `src/health/health.controller.spec.ts` for an example of a controller test without complex dependencies.
