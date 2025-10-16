export const authJestConfig = {
    displayName: 'Auth Module Tests',
    testMatch: [
        '<rootDir>/src/auth/**/*.spec.ts',
    ],
    collectCoverageFrom: [
        'src/auth/**/*.ts',
        '!src/auth/**/*.spec.ts',
        '!src/auth/**/*.interface.ts',
        '!src/auth/**/*.dto.ts',
        '!src/auth/**/*.entity.ts',
        '!src/auth/**/*.enum.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        'src/auth/': {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup-auth.ts'],
    testTimeout: 10000,
    verbose: true,
};
