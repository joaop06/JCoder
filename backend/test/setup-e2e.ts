import { config } from 'dotenv';

// Load environment variables for E2E tests
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
    // Setup global test configuration
    process.env.NODE_ENV = 'test';
    process.env.BACKEND_JWT_SECRET = 'test-jwt-secret';
});

afterAll(async () => {
    // Cleanup after all tests
});

// Increase timeout for E2E tests
jest.setTimeout(30000);
