export const testConfig = {
    jwt: {
        secret: 'test-jwt-secret-key-for-testing-only',
        expiresIn: '60m',
    },
    database: {
        type: 'sqlite' as const,
        database: ':memory:',
        synchronize: true,
        logging: false,
    },
    bcrypt: {
        rounds: 4,
    },
    throttler: {
        ttl: 60000,
        limit: 10,
    },
    testUser: {
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'admin' as const,
    },
};
