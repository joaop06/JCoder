import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global setup for auth module tests
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.BACKEND_JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.BCRYPT_ROUNDS = '4';
    process.env.JWT_EXPIRES_IN = '60m';
});

afterAll(async () => {
    // Cleanup after all tests
});

// Increase timeout for auth tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Global test utilities
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidJwtToken(): R;
            toHaveValidUserStructure(): R;
            toHaveValidSignInResponse(): R;
        }
    }
}

// Custom Jest matchers for auth tests
expect.extend({
    toBeValidJwtToken(received: string) {
        if (typeof received !== 'string') {
            return {
                message: () => `expected ${received} to be a string`,
                pass: false,
            };
        }

        const parts = received.split('.');
        const isValid = parts.length === 3 && parts.every(part => part.length > 0);

        return {
            message: () => `expected ${received} to be a valid JWT token`,
            pass: isValid,
        };
    },

    toHaveValidUserStructure(received: any) {
        const requiredFields = ['id', 'email', 'role', 'createdAt', 'updatedAt'];
        const hasRequiredFields = requiredFields.every(field => received.hasOwnProperty(field));
        const hasNoPassword = !received.hasOwnProperty('password');

        const isValid = hasRequiredFields && hasNoPassword;

        return {
            message: () => `expected ${JSON.stringify(received)} to have valid user structure`,
            pass: isValid,
        };
    },

    toHaveValidSignInResponse(received: any) {
        const hasAccessToken = received.hasOwnProperty('accessToken') && typeof received.accessToken === 'string';
        const hasUser = received.hasOwnProperty('user') && typeof received.user === 'object';
        const hasValidUserStructure = this.toHaveValidUserStructure(received.user).pass;

        const isValid = hasAccessToken && hasUser && hasValidUserStructure;

        return {
            message: () => `expected ${JSON.stringify(received)} to have valid sign-in response structure`,
            pass: isValid,
        };
    },
});
