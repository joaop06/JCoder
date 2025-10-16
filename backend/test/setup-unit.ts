import { config } from 'dotenv';

// Load environment variables for unit tests
config({ path: '.env.test' });

// Global test setup for unit tests
beforeAll(async () => {
    // Setup global test configuration
    process.env.NODE_ENV = 'test';
    process.env.BACKEND_JWT_SECRET = 'test-jwt-secret';
});

afterAll(async () => {
    // Cleanup after all tests
});

// Increase timeout for unit tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
    createMockUser: (overrides = {}) => ({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides,
    }),

    createMockRepository: () => ({
        findOneBy: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        count: jest.fn(),
        remove: jest.fn(),
        preload: jest.fn(),
        upsert: jest.fn(),
        insert: jest.fn(),
        createQueryBuilder: jest.fn(),
    }),

    resetAllMocks: () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    },
};
