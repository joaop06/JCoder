import { Application } from '../entities/application.entity';
import { User } from '../../users/entities/user.entity';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { RoleEnum } from '../../@common/enums/role.enum';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';

export const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: RoleEnum.Admin,
    applications: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
};

export const mockApplication: Application = {
    id: 1,
    name: 'Test Application',
    description: 'Test Description',
    applicationType: ApplicationTypeEnum.API,
    userId: 1,
    githubUrl: 'https://github.com/test/app',
    isActive: true,
    images: ['image1.jpg', 'image2.png'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    user: mockUser,
};

export const mockApplicationWithoutImages: Application = {
    ...mockApplication,
    images: [],
};

export const mockApplicationWithNullImages: Application = {
    ...mockApplication,
    images: null,
};

export const mockApplicationSoftDeleted: Application = {
    ...mockApplication,
    deletedAt: new Date('2024-01-02T00:00:00Z'),
};

export const mockCreateApplicationDto: CreateApplicationDto = {
    name: 'Test Application',
    userId: 1,
    description: 'Test Description',
    applicationType: ApplicationTypeEnum.API,
    githubUrl: 'https://github.com/test/app',
    applicationComponentApi: {
        domain: 'api.example.com',
        apiUrl: 'https://api.example.com/v1',
        documentationUrl: 'https://api.example.com/docs',
        healthCheckEndpoint: 'https://api.example.com/health',
    },
};

export const mockCreateApplicationDtoMinimal: CreateApplicationDto = {
    name: 'Minimal Application',
    userId: 1,
    description: 'Minimal Description',
    applicationType: ApplicationTypeEnum.API,
    applicationComponentApi: {
        domain: 'api.example.com',
        apiUrl: 'https://api.example.com/v1',
    },
};

export const mockCreateApplicationDtoMobile: CreateApplicationDto = {
    name: 'Mobile Application',
    userId: 1,
    description: 'Mobile Description',
    applicationType: ApplicationTypeEnum.MOBILE,
    applicationComponentMobile: {
        platform: 'ANDROID',
        packageName: 'com.example.app',
        version: '1.0.0',
    },
};

export const mockCreateApplicationDtoLibrary: CreateApplicationDto = {
    name: 'Library Application',
    userId: 1,
    description: 'Library Description',
    applicationType: ApplicationTypeEnum.LIBRARY,
    applicationComponentLibrary: {
        packageName: '@example/library',
        version: '1.0.0',
        repositoryUrl: 'https://github.com/example/library',
    },
};

export const mockCreateApplicationDtoFrontend: CreateApplicationDto = {
    name: 'Frontend Application',
    userId: 1,
    description: 'Frontend Description',
    applicationType: ApplicationTypeEnum.FRONTEND,
    applicationComponentFrontend: {
        domain: 'app.example.com',
        url: 'https://app.example.com',
    },
};

export const mockCreateApplicationDtoFullstack: CreateApplicationDto = {
    name: 'Fullstack Application',
    userId: 1,
    description: 'Fullstack Description',
    applicationType: ApplicationTypeEnum.FULLSTACK,
    applicationComponentApi: {
        domain: 'api.example.com',
        apiUrl: 'https://api.example.com/v1',
    },
    applicationComponentFrontend: {
        domain: 'app.example.com',
        url: 'https://app.example.com',
    },
};

export const mockUpdateApplicationDto: UpdateApplicationDto = {
    name: 'Updated Application',
    description: 'Updated Description',
    applicationType: ApplicationTypeEnum.MOBILE,
    githubUrl: 'https://github.com/test/updated-app',
    applicationComponentMobile: {
        platform: 'ANDROID',
        packageName: 'com.example.updated',
        version: '2.0.0',
    },
};

export const mockUpdateApplicationDtoPartial: UpdateApplicationDto = {
    name: 'Updated Name Only',
};

export const mockUpdateApplicationDtoEmpty: UpdateApplicationDto = {};

export const mockApplications: Application[] = [
    mockApplication,
    {
        ...mockApplication,
        id: 2,
        name: 'Second Application',
        description: 'Second Description',
        applicationType: ApplicationTypeEnum.MOBILE,
    },
    {
        ...mockApplication,
        id: 3,
        name: 'Third Application',
        description: 'Third Description',
        applicationType: ApplicationTypeEnum.LIBRARY,
    },
];

export const mockPaginatedResponse = {
    data: mockApplications,
    meta: {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    },
};

export const mockFile: Express.Multer.File = {
    fieldname: 'images',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('test-image-data'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
};

export const mockFiles: Express.Multer.File[] = [
    mockFile,
    {
        ...mockFile,
        originalname: 'test-image-2.png',
        mimetype: 'image/png',
    },
];

export const mockInvalidFile: Express.Multer.File = {
    ...mockFile,
    mimetype: 'text/plain',
};

export const mockLargeFile: Express.Multer.File = {
    ...mockFile,
    size: 10 * 1024 * 1024, // 10MB
};

export const mockRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    preload: jest.fn(),
    upsert: jest.fn(),
    insert: jest.fn(),
    createQueryBuilder: jest.fn(),
};

export const mockCacheService = {
    getOrSet: jest.fn(),
    del: jest.fn(),
    generateKey: jest.fn(),
    applicationKey: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    reset: jest.fn(),
};

export const mockImageUploadService = {
    uploadImages: jest.fn(),
    deleteApplicationImages: jest.fn(),
    deleteAllApplicationImages: jest.fn(),
    getImagePath: jest.fn(),
};

export const mockUsersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

export const mockApplicationComponentsService = {
    saveComponentsForType: jest.fn(),
    findComponentsByApplication: jest.fn(),
    updateComponentsForType: jest.fn(),
    deleteComponentsForApplication: jest.fn(),
};

export const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
};

export const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
};

export const mockAuthToken = 'mock-jwt-token';

export const mockAuthUser = {
    id: 1,
    email: 'test@example.com',
    role: RoleEnum.Admin,
};

export const mockNonAdminUser = {
    id: 2,
    email: 'user@example.com',
    role: RoleEnum.User,
};

export const mockNonAdminToken = 'mock-non-admin-jwt-token';

export const mockExpiredToken = 'mock-expired-jwt-token';

export const mockInvalidToken = 'mock-invalid-jwt-token';

export const mockDatabaseError = new Error('Database connection failed');

export const mockNetworkError = new Error('Network timeout');

export const mockPermissionError = new Error('Permission denied');

export const mockFileSystemError = new Error('File system error');

export const mockImageProcessingError = new Error('Image processing failed');

export const mockValidationError = new Error('Validation failed');

export const mockNotFoundError = new Error('Not found');

export const mockConflictError = new Error('Conflict');

export const mockUnauthorizedError = new Error('Unauthorized');

export const mockForbiddenError = new Error('Forbidden');

export const mockInternalServerError = new Error('Internal server error');

export const mockBadRequestError = new Error('Bad request');

export const mockTooManyRequestsError = new Error('Too many requests');

export const mockServiceUnavailableError = new Error('Service unavailable');

export const mockGatewayTimeoutError = new Error('Gateway timeout');

export const mockPayloadTooLargeError = new Error('Payload too large');

export const mockUnsupportedMediaTypeError = new Error('Unsupported media type');

export const mockNotAcceptableError = new Error('Not acceptable');

export const mockMethodNotAllowedError = new Error('Method not allowed');

export const mockGoneError = new Error('Gone');

export const mockLengthRequiredError = new Error('Length required');

export const mockPreconditionFailedError = new Error('Precondition failed');

export const mockRequestEntityTooLargeError = new Error('Request entity too large');

export const mockRequestUriTooLongError = new Error('Request URI too long');

export const mockUnsupportedMediaTypeError2 = new Error('Unsupported media type');

export const mockRequestedRangeNotSatisfiableError = new Error('Requested range not satisfiable');

export const mockExpectationFailedError = new Error('Expectation failed');

export const mockImATeapotError = new Error('I\'m a teapot');

export const mockMisdirectedRequestError = new Error('Misdirected request');

export const mockUnprocessableEntityError = new Error('Unprocessable entity');

export const mockLockedError = new Error('Locked');

export const mockFailedDependencyError = new Error('Failed dependency');

export const mockTooEarlyError = new Error('Too early');

export const mockUpgradeRequiredError = new Error('Upgrade required');

export const mockPreconditionRequiredError = new Error('Precondition required');

export const mockTooManyRequestsError2 = new Error('Too many requests');

export const mockRequestHeaderFieldsTooLargeError = new Error('Request header fields too large');

export const mockUnavailableForLegalReasonsError = new Error('Unavailable for legal reasons');

export const mockInternalServerError2 = new Error('Internal server error');

export const mockNotImplementedError = new Error('Not implemented');

export const mockBadGatewayError = new Error('Bad gateway');

export const mockServiceUnavailableError2 = new Error('Service unavailable');

export const mockGatewayTimeoutError2 = new Error('Gateway timeout');

export const mockHttpVersionNotSupportedError = new Error('HTTP version not supported');

export const mockVariantAlsoNegotiatesError = new Error('Variant also negotiates');

export const mockInsufficientStorageError = new Error('Insufficient storage');

export const mockLoopDetectedError = new Error('Loop detected');

export const mockNotExtendedError = new Error('Not extended');

export const mockNetworkAuthenticationRequiredError = new Error('Network authentication required');

export const mockTestData = {
    user: mockUser,
    application: mockApplication,
    applications: mockApplications,
    createDto: mockCreateApplicationDto,
    updateDto: mockUpdateApplicationDto,
    file: mockFile,
    files: mockFiles,
    authToken: mockAuthToken,
    authUser: mockAuthUser,
    paginatedResponse: mockPaginatedResponse,
};

export const mockTestErrors = {
    database: mockDatabaseError,
    network: mockNetworkError,
    permission: mockPermissionError,
    fileSystem: mockFileSystemError,
    imageProcessing: mockImageProcessingError,
    validation: mockValidationError,
    notFound: mockNotFoundError,
    conflict: mockConflictError,
    unauthorized: mockUnauthorizedError,
    forbidden: mockForbiddenError,
    internalServer: mockInternalServerError,
    badRequest: mockBadRequestError,
    tooManyRequests: mockTooManyRequestsError,
    serviceUnavailable: mockServiceUnavailableError,
    gatewayTimeout: mockGatewayTimeoutError,
    payloadTooLarge: mockPayloadTooLargeError,
    unsupportedMediaType: mockUnsupportedMediaTypeError,
    notAcceptable: mockNotAcceptableError,
    methodNotAllowed: mockMethodNotAllowedError,
    gone: mockGoneError,
    lengthRequired: mockLengthRequiredError,
    preconditionFailed: mockPreconditionFailedError,
    requestEntityTooLarge: mockRequestEntityTooLargeError,
    requestUriTooLong: mockRequestUriTooLongError,
    requestedRangeNotSatisfiable: mockRequestedRangeNotSatisfiableError,
    expectationFailed: mockExpectationFailedError,
    imATeapot: mockImATeapotError,
    misdirectedRequest: mockMisdirectedRequestError,
    unprocessableEntity: mockUnprocessableEntityError,
    locked: mockLockedError,
    failedDependency: mockFailedDependencyError,
    tooEarly: mockTooEarlyError,
    upgradeRequired: mockUpgradeRequiredError,
    preconditionRequired: mockPreconditionRequiredError,
    requestHeaderFieldsTooLarge: mockRequestHeaderFieldsTooLargeError,
    unavailableForLegalReasons: mockUnavailableForLegalReasonsError,
    notImplemented: mockNotImplementedError,
    badGateway: mockBadGatewayError,
    httpVersionNotSupported: mockHttpVersionNotSupportedError,
    variantAlsoNegotiates: mockVariantAlsoNegotiatesError,
    insufficientStorage: mockInsufficientStorageError,
    loopDetected: mockLoopDetectedError,
    notExtended: mockNotExtendedError,
    networkAuthenticationRequired: mockNetworkAuthenticationRequiredError,
};

export const mockTestServices = {
    repository: mockRepository,
    cacheService: mockCacheService,
    imageUploadService: mockImageUploadService,
    usersService: mockUsersService,
    applicationComponentsService: mockApplicationComponentsService,
    configService: mockConfigService,
    jwtService: mockJwtService,
};

export const mockTestTokens = {
    auth: mockAuthToken,
    nonAdmin: mockNonAdminToken,
    expired: mockExpiredToken,
    invalid: mockInvalidToken,
};

export const mockTestUsers = {
    admin: mockAuthUser,
    user: mockNonAdminUser,
};

export const mockTestFiles = {
    valid: mockFile,
    validMultiple: mockFiles,
    invalid: mockInvalidFile,
    large: mockLargeFile,
};

export const mockTestApplications = {
    basic: mockApplication,
    withoutImages: mockApplicationWithoutImages,
    withNullImages: mockApplicationWithNullImages,
    softDeleted: mockApplicationSoftDeleted,
    multiple: mockApplications,
};

export const mockTestDtos = {
    create: mockCreateApplicationDto,
    createMinimal: mockCreateApplicationDtoMinimal,
    createMobile: mockCreateApplicationDtoMobile,
    createLibrary: mockCreateApplicationDtoLibrary,
    createFrontend: mockCreateApplicationDtoFrontend,
    createFullstack: mockCreateApplicationDtoFullstack,
    update: mockUpdateApplicationDto,
    updatePartial: mockUpdateApplicationDtoPartial,
    updateEmpty: mockUpdateApplicationDtoEmpty,
};

export const mockTestResponses = {
    paginated: mockPaginatedResponse,
    single: mockApplication,
    multiple: mockApplications,
    empty: [],
};

export const mockTestConfig = {
    uploadPath: './uploads/applications',
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    cacheTtl: 300,
    cacheMax: 100,
    jwtSecret: 'test-jwt-secret',
    jwtExpiresIn: '60m',
};

export const mockTestEnvironment = {
    nodeEnv: 'test',
    databaseUrl: 'sqlite::memory:',
    redisUrl: 'redis://localhost:6379',
    uploadPath: './test-uploads',
    maxFileSize: 5242880,
    jwtSecret: 'test-jwt-secret',
    jwtExpiresIn: '60m',
    bcryptRounds: 4,
    throttlerTtl: 60000,
    throttlerLimit: 10,
};

export const mockTestDatabase = {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Application, User],
    migrations: [],
    subscribers: [],
};

export const mockTestCache = {
    ttl: 300,
    max: 100,
    store: 'memory',
    isGlobal: true,
};

export const mockTestJwt = {
    secret: 'test-jwt-secret',
    expiresIn: '60m',
    issuer: 'test-app',
    audience: 'test-users',
};

export const mockTestBcrypt = {
    rounds: 4,
    saltRounds: 10,
};

export const mockTestThrottler = {
    ttl: 60000,
    limit: 10,
    skipIf: jest.fn(),
    ignoreUserAgents: [],
    throttlers: [],
};

export const mockTestValidation = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false,
    exceptionFactory: jest.fn(),
};

export const mockTestSwagger = {
    title: 'Test API',
    description: 'Test API Description',
    version: '1.0.0',
    tags: ['test'],
    servers: [{ url: 'http://localhost:3000' }],
    contact: { name: 'Test', email: 'test@example.com' },
    license: { name: 'MIT' },
};

export const mockTestCors = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

export const mockTestHelmet = {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
};

export const mockTestCompression = {
    level: 6,
    threshold: 1024,
    filter: jest.fn(),
};

export const mockTestLogger = {
    level: 'debug',
    format: 'json',
    transports: ['console'],
    silent: false,
};

export const mockTestMetrics = {
    enabled: true,
    path: '/metrics',
    defaultMetrics: true,
    customMetrics: [],
};

export const mockTestHealth = {
    enabled: true,
    path: '/health',
    checks: ['database', 'redis', 'memory'],
    timeout: 5000,
};

export const mockTestSecurity = {
    rateLimit: { windowMs: 900000, max: 100 },
    helmet: mockTestHelmet,
    cors: mockTestCors,
    compression: mockTestCompression,
};

export const mockTestMonitoring = {
    logger: mockTestLogger,
    metrics: mockTestMetrics,
    health: mockTestHealth,
    tracing: { enabled: true, sampleRate: 0.1 },
};

export const mockTestConfiguration = {
    database: mockTestDatabase,
    cache: mockTestCache,
    jwt: mockTestJwt,
    bcrypt: mockTestBcrypt,
    throttler: mockTestThrottler,
    validation: mockTestValidation,
    swagger: mockTestSwagger,
    security: mockTestSecurity,
    monitoring: mockTestMonitoring,
    environment: mockTestEnvironment,
};

export default {
    data: mockTestData,
    errors: mockTestErrors,
    services: mockTestServices,
    tokens: mockTestTokens,
    users: mockTestUsers,
    files: mockTestFiles,
    applications: mockTestApplications,
    dtos: mockTestDtos,
    responses: mockTestResponses,
    config: mockTestConfig,
    configuration: mockTestConfiguration,
};
