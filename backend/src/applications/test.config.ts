export const applicationsTestConfig = {
    // Database configuration for tests
    database: {
        type: 'sqlite' as const,
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: ['src/applications/entities/*.entity.ts'],
        migrations: ['src/applications/migrations/*.ts'],
        subscribers: ['src/applications/subscribers/*.ts'],
    },

    // Cache configuration for tests
    cache: {
        ttl: 60, // 1 minute for faster tests
        max: 50,
        store: 'memory',
        isGlobal: false,
    },

    // JWT configuration for tests
    jwt: {
        secret: 'test-jwt-secret-for-applications-module',
        expiresIn: '30m',
        issuer: 'test-applications',
        audience: 'test-users',
    },

    // File upload configuration for tests
    upload: {
        path: './test-uploads/applications',
        maxFileSize: 2 * 1024 * 1024, // 2MB for tests
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxFiles: 5,
    },

    // Image processing configuration for tests
    imageProcessing: {
        maxWidth: 800,
        maxHeight: 600,
        quality: 80,
        format: 'jpeg',
        progressive: true,
    },

    // Validation configuration for tests
    validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
    },

    // Pagination configuration for tests
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
    },

    // Security configuration for tests
    security: {
        rateLimit: {
            windowMs: 60000, // 1 minute
            max: 100, // 100 requests per window
        },
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true,
        },
        helmet: {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        },
    },

    // Logging configuration for tests
    logging: {
        level: 'error', // Only show errors in tests
        format: 'json',
        transports: ['console'],
        silent: false,
        colorize: false,
    },

    // Test data configuration
    testData: {
        user: {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'admin',
        },
        application: {
            id: 1,
            name: 'Test Application',
            description: 'Test Description',
            applicationType: 'API',
            userId: 1,
            githubUrl: 'https://github.com/test/app',
            isActive: true,
        },
    },

    // Mock configuration
    mocks: {
        enableMocks: true,
        mockDatabase: true,
        mockCache: true,
        mockFileSystem: true,
        mockImageProcessing: true,
        mockExternalServices: true,
    },

    // Test timeout configuration
    timeouts: {
        unit: 5000, // 5 seconds
        integration: 10000, // 10 seconds
        e2e: 30000, // 30 seconds
        database: 5000, // 5 seconds
        file: 10000, // 10 seconds
    },

    // Coverage configuration
    coverage: {
        enabled: true,
        threshold: {
            global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
            applications: {
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
            },
        },
        reporters: ['text', 'lcov', 'html'],
        exclude: [
            'src/**/*.spec.ts',
            'src/**/*.test.ts',
            'src/**/*.interface.ts',
            'src/**/*.dto.ts',
            'src/**/*.entity.ts',
            'src/**/*.enum.ts',
            'src/**/*.module.ts',
            'src/**/*.decorator.ts',
            'src/**/*.guard.ts',
            'src/**/*.interceptor.ts',
            'src/**/*.pipe.ts',
            'src/**/*.filter.ts',
            'src/**/*.strategy.ts',
            'src/**/*.middleware.ts',
            'src/**/*.config.ts',
            'src/**/*.constant.ts',
            'src/**/*.type.ts',
            'src/**/index.ts',
            'src/**/main.ts',
        ],
    },

    // Test environment configuration
    environment: {
        nodeEnv: 'test',
        port: 0, // Random port for tests
        host: 'localhost',
        protocol: 'http',
        baseUrl: 'http://localhost:0',
    },

    // Database seeding configuration
    seeding: {
        enabled: true,
        data: {
            users: [
                {
                    id: 1,
                    email: 'admin@test.com',
                    password: 'hashedPassword',
                    role: 'admin',
                },
                {
                    id: 2,
                    email: 'user@test.com',
                    password: 'hashedPassword',
                    role: 'user',
                },
            ],
            applications: [
                {
                    id: 1,
                    name: 'Test API Application',
                    description: 'Test API Description',
                    applicationType: 'API',
                    userId: 1,
                    githubUrl: 'https://github.com/test/api',
                    isActive: true,
                },
                {
                    id: 2,
                    name: 'Test Mobile Application',
                    description: 'Test Mobile Description',
                    applicationType: 'MOBILE',
                    userId: 1,
                    isActive: true,
                },
            ],
        },
    },

    // Cleanup configuration
    cleanup: {
        afterEach: true,
        afterAll: true,
        removeUploads: true,
        clearCache: true,
        resetDatabase: true,
        removeTempFiles: true,
    },

    // Performance testing configuration
    performance: {
        enabled: false, // Disabled by default
        thresholds: {
            responseTime: 1000, // 1 second
            memoryUsage: 100 * 1024 * 1024, // 100MB
            cpuUsage: 80, // 80%
        },
        scenarios: {
            concurrent: {
                enabled: true,
                maxConcurrent: 10,
                duration: 30000, // 30 seconds
            },
            load: {
                enabled: false,
                users: 100,
                duration: 60000, // 1 minute
                rampUp: 10000, // 10 seconds
            },
        },
    },

    // Integration testing configuration
    integration: {
        enabled: true,
        services: {
            database: true,
            cache: true,
            fileSystem: true,
            imageProcessing: true,
            external: false, // Disabled for unit tests
        },
        endpoints: {
            health: true,
            metrics: false,
            docs: false,
        },
    },

    // E2E testing configuration
    e2e: {
        enabled: true,
        baseUrl: 'http://localhost:0',
        timeout: 30000,
        retries: 2,
        screenshots: false,
        videos: false,
        headless: true,
        viewport: {
            width: 1280,
            height: 720,
        },
    },

    // API testing configuration
    api: {
        basePath: '/api',
        version: 'v1',
        timeout: 10000,
        retries: 3,
        followRedirects: true,
        validateStatus: (status: number) => status < 500,
    },

    // File testing configuration
    files: {
        tempDir: './test-temp',
        uploadDir: './test-uploads',
        maxFileSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        cleanup: true,
    },

    // Image testing configuration
    images: {
        testImages: [
            {
                name: 'test-image-1.jpg',
                size: 1024 * 1024, // 1MB
                type: 'image/jpeg',
                data: Buffer.from('fake-image-data-1'),
            },
            {
                name: 'test-image-2.png',
                size: 512 * 1024, // 512KB
                type: 'image/png',
                data: Buffer.from('fake-image-data-2'),
            },
        ],
        invalidImages: [
            {
                name: 'test-text.txt',
                size: 1024,
                type: 'text/plain',
                data: Buffer.from('not-an-image'),
            },
            {
                name: 'test-large.jpg',
                size: 10 * 1024 * 1024, // 10MB
                type: 'image/jpeg',
                data: Buffer.from('fake-large-image-data'),
            },
        ],
    },

    // Error testing configuration
    errors: {
        simulateDatabaseErrors: false,
        simulateNetworkErrors: false,
        simulateFileSystemErrors: false,
        simulateImageProcessingErrors: false,
        errorRate: 0, // 0% error rate by default
    },

    // Assertion configuration
    assertions: {
        strict: true,
        deepEqual: true,
        includeStack: false,
        showDiff: true,
        truncateThreshold: 1000,
    },

    // Test reporting configuration
    reporting: {
        enabled: true,
        format: 'json',
        output: './test-results',
        includeCoverage: true,
        includePerformance: false,
        includeScreenshots: false,
        includeVideos: false,
    },

    // Test parallelization configuration
    parallel: {
        enabled: false, // Disabled for database tests
        maxWorkers: 4,
        minWorkers: 1,
        workerIdleMemoryLimit: 512 * 1024 * 1024, // 512MB
    },

    // Test isolation configuration
    isolation: {
        database: true,
        cache: true,
        fileSystem: true,
        network: true,
        time: false,
        random: false,
    },

    // Test debugging configuration
    debugging: {
        enabled: false,
        breakOnError: false,
        logLevel: 'error',
        verbose: false,
        inspect: false,
    },

    // Test hooks configuration
    hooks: {
        beforeAll: [],
        beforeEach: [],
        afterEach: [],
        afterAll: [],
        setup: [],
        teardown: [],
    },

    // Test utilities configuration
    utilities: {
        mockData: true,
        testHelpers: true,
        assertions: true,
        fixtures: true,
        factories: true,
    },

    // Test validation configuration
    validation: {
        strict: true,
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
    },

    // Test serialization configuration
    serialization: {
        enableCircularCheck: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test transformation configuration
    transformation: {
        enableImplicitConversion: true,
        enableCircularCheck: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test metadata configuration
    metadata: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test decorators configuration
    decorators: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test pipes configuration
    pipes: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test guards configuration
    guards: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test interceptors configuration
    interceptors: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test filters configuration
    filters: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test middleware configuration
    middleware: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test strategies configuration
    strategies: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test modules configuration
    modules: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test services configuration
    services: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test controllers configuration
    controllers: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test use cases configuration
    useCases: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test repositories configuration
    repositories: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test entities configuration
    entities: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test DTOs configuration
    dtos: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test enums configuration
    enums: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test interfaces configuration
    interfaces: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test types configuration
    types: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test constants configuration
    constants: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test utilities configuration
    testUtilities: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test helpers configuration
    helpers: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test fixtures configuration
    fixtures: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test factories configuration
    factories: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test mocks configuration
    mocks: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test stubs configuration
    stubs: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test spies configuration
    spies: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test fakes configuration
    fakes: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test doubles configuration
    doubles: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test matchers configuration
    matchers: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test assertions configuration
    testAssertions: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test expectations configuration
    expectations: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test verifications configuration
    verifications: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test validations configuration
    testValidations: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test checks configuration
    checks: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test inspections configuration
    inspections: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test examinations configuration
    examinations: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test analyses configuration
    analyses: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test evaluations configuration
    evaluations: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test assessments configuration
    assessments: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test reviews configuration
    reviews: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test audits configuration
    audits: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test monitoring configuration
    monitoring: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test tracking configuration
    tracking: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test logging configuration
    testLogging: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test metrics configuration
    testMetrics: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test telemetry configuration
    telemetry: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test observability configuration
    observability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test instrumentation configuration
    instrumentation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test profiling configuration
    profiling: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test benchmarking configuration
    benchmarking: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test performance configuration
    testPerformance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test load configuration
    load: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test stress configuration
    stress: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test volume configuration
    volume: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test capacity configuration
    capacity: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test scalability configuration
    scalability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test reliability configuration
    reliability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test availability configuration
    availability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test maintainability configuration
    maintainability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test portability configuration
    portability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test compatibility configuration
    compatibility: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test interoperability configuration
    interoperability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test usability configuration
    usability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test accessibility configuration
    accessibility: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test security configuration
    testSecurity: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test privacy configuration
    privacy: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test compliance configuration
    compliance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test governance configuration
    governance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test risk configuration
    risk: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test quality configuration
    quality: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test assurance configuration
    assurance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test certification configuration
    certification: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test accreditation configuration
    accreditation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test validation configuration
    testValidation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test verification configuration
    testVerification: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test authentication configuration
    authentication: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test authorization configuration
    authorization: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test encryption configuration
    encryption: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test decryption configuration
    decryption: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test hashing configuration
    hashing: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test signing configuration
    signing: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test verification configuration
    testVerification: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test integrity configuration
    integrity: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test confidentiality configuration
    confidentiality: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test availability configuration
    testAvailability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test non-repudiation configuration
    nonRepudiation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test accountability configuration
    accountability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test auditability configuration
    auditability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test traceability configuration
    traceability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test transparency configuration
    transparency: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test visibility configuration
    visibility: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test observability configuration
    testObservability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test monitoring configuration
    testMonitoring: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test logging configuration
    testLogging: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test metrics configuration
    testMetrics: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test telemetry configuration
    testTelemetry: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test instrumentation configuration
    testInstrumentation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test profiling configuration
    testProfiling: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test debugging configuration
    testDebugging: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test troubleshooting configuration
    troubleshooting: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test diagnostics configuration
    diagnostics: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test analysis configuration
    testAnalysis: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test evaluation configuration
    testEvaluation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test assessment configuration
    testAssessment: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test review configuration
    testReview: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test audit configuration
    testAudit: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test inspection configuration
    testInspection: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test examination configuration
    testExamination: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test investigation configuration
    investigation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test exploration configuration
    exploration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test discovery configuration
    discovery: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test research configuration
    research: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test development configuration
    development: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test implementation configuration
    implementation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test deployment configuration
    deployment: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test operation configuration
    operation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test maintenance configuration
    maintenance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test support configuration
    support: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test service configuration
    testService: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test management configuration
    management: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test administration configuration
    administration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test supervision configuration
    supervision: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test oversight configuration
    oversight: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test control configuration
    control: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test regulation configuration
    regulation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test governance configuration
    testGovernance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test policy configuration
    policy: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test procedure configuration
    procedure: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test process configuration
    process: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test workflow configuration
    workflow: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test pipeline configuration
    pipeline: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test automation configuration
    automation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test orchestration configuration
    orchestration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test coordination configuration
    coordination: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test synchronization configuration
    synchronization: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test integration configuration
    testIntegration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test communication configuration
    communication: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test collaboration configuration
    collaboration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test cooperation configuration
    cooperation: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test partnership configuration
    partnership: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test alliance configuration
    alliance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test relationship configuration
    relationship: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test connection configuration
    connection: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test binding configuration
    binding: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test coupling configuration
    coupling: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test cohesion configuration
    cohesion: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test consistency configuration
    consistency: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test coherence configuration
    coherence: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test alignment configuration
    alignment: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test harmony configuration
    harmony: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test balance configuration
    balance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test equilibrium configuration
    equilibrium: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test stability configuration
    stability: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test robustness configuration
    robustness: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test resilience configuration
    resilience: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test fault tolerance configuration
    faultTolerance: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test error handling configuration
    errorHandling: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test exception handling configuration
    exceptionHandling: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test recovery configuration
    recovery: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test restoration configuration
    restoration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test repair configuration
    repair: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test healing configuration
    healing: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    selfHealing: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    selfRepair: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    selfRecovery: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    selfRestoration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    testSelfHealing: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    testSelfRepair: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    testSelfRecovery: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    testSelfRestoration: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    testSelfHealing2: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    testSelfRepair2: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    testSelfRecovery2: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    testSelfRestoration2: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    testSelfHealing3: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    testSelfRepair3: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    testSelfRecovery3: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    testSelfRestoration3: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    testSelfHealing4: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    testSelfRepair4: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    testSelfRecovery4: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    testSelfRestoration4: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-healing configuration
    testSelfHealing5: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-repair configuration
    testSelfRepair5: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-recovery configuration
    testSelfRecovery5: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },

    // Test self-restoration configuration
    testSelfRestoration5: {
        enableAutoMap: true,
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    },
};

export default applicationsTestConfig;
