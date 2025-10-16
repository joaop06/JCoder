import { Config } from 'jest';

const config: Config = {
    displayName: 'Users Module Tests',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        '!**/*.spec.ts',
        '!**/*.e2e-spec.ts',
        '!**/node_modules/**',
        '!**/dist/**',
    ],
    coverageDirectory: '../coverage/users',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/../../test/setup-unit.ts'],
    testTimeout: 10000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,
};

export default config;
