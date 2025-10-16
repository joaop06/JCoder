import { User } from '../../src/users/entities/user.entity';
import { RoleEnum } from '../../src/@common/enums/role.enum';
import { SignInResponseDto } from '../../src/auth/dto/sign-in-response.dto';

export const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: RoleEnum.Admin,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    deletedAt: null,
    applications: [],
} as User;

export const mockUserWithUserRole: User = {
    ...mockUser,
    id: 2,
    email: 'user@example.com',
    role: RoleEnum.User,
} as User;

export const mockUserWithApplications: User = {
    ...mockUser,
    applications: [
        { id: 1, name: 'App 1' },
        { id: 2, name: 'App 2' },
    ] as any,
} as User;

export const mockSignInResponse: SignInResponseDto = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
    user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
        applications: mockUser.applications,
    },
};

export const mockSignInResponseWithUserRole: SignInResponseDto = {
    ...mockSignInResponse,
    user: {
        ...mockSignInResponse.user,
        id: mockUserWithUserRole.id,
        email: mockUserWithUserRole.email,
        role: mockUserWithUserRole.role,
    },
};

export const mockSignInResponseWithApplications: SignInResponseDto = {
    ...mockSignInResponse,
    user: {
        ...mockSignInResponse.user,
        applications: mockUserWithApplications.applications,
    },
};

export const mockJwtPayload = {
    id: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
    deletedAt: mockUser.deletedAt,
    applications: mockUser.applications,
    iat: 1760103793,
    exp: 1760107393,
};

export const mockJwtPayloadWithUserRole = {
    ...mockJwtPayload,
    id: mockUserWithUserRole.id,
    email: mockUserWithUserRole.email,
    role: mockUserWithUserRole.role,
};

export const mockJwtPayloadWithApplications = {
    ...mockJwtPayload,
    applications: mockUserWithApplications.applications,
};

export const mockSignInDto = {
    email: 'test@example.com',
    password: 'plainpassword',
};

export const mockInvalidSignInDto = {
    email: 'test@example.com',
    password: 'wrongpassword',
};

export const mockNonExistentUserSignInDto = {
    email: 'nonexistent@example.com',
    password: 'anypassword',
};

export const mockValidationErrors = {
    emptyEmail: {
        email: '',
        password: 'password',
    },
    invalidEmail: {
        email: 'invalid-email',
        password: 'password',
    },
    emptyPassword: {
        email: 'test@example.com',
        password: '',
    },
    missingEmail: {
        password: 'password',
    },
    missingPassword: {
        email: 'test@example.com',
    },
    nonStringEmail: {
        email: 123,
        password: 'password',
    },
    nonStringPassword: {
        email: 'test@example.com',
        password: 123,
    },
};

export const mockSecurityTestData = {
    sqlInjection: {
        email: "'; DROP TABLE users; --",
        password: 'anypassword',
    },
    xssAttempt: {
        email: '<script>alert("xss")</script>@example.com',
        password: 'anypassword',
    },
    longEmail: {
        email: 'a'.repeat(1000) + '@example.com',
        password: 'password',
    },
    longPassword: {
        email: 'test@example.com',
        password: 'a'.repeat(1000),
    },
};

export const mockRateLimitTestData = Array.from({ length: 10 }, (_, i) => ({
    email: 'test@example.com',
    password: 'wrongpassword',
}));

export const mockHttpMethods = ['GET', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export const mockContentTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'text/plain',
    'multipart/form-data',
];

export const mockHeaders = {
    valid: {
        'Content-Type': 'application/json',
    },
    invalid: {
        'Content-Type': 'text/plain',
    },
    missing: {},
};

export const mockErrorResponses = {
    badRequest: {
        statusCode: 400,
        message: 'Bad Request',
    },
    unauthorized: {
        statusCode: 401,
        message: 'Unauthorized',
    },
    forbidden: {
        statusCode: 403,
        message: 'Forbidden',
    },
    notFound: {
        statusCode: 404,
        message: 'Not Found',
    },
    tooManyRequests: {
        statusCode: 429,
        message: 'Too Many Requests',
    },
    internalServerError: {
        statusCode: 500,
        message: 'Internal Server Error',
    },
};

export const mockValidationErrorResponse = {
    statusCode: 400,
    message: [
        'email must be an email',
        'email should not be empty',
        'password should not be empty',
        'password must be a string',
    ],
    error: 'Bad Request',
};

export const mockPasswordDoesNotMatchResponse = {
    statusCode: 400,
    message: 'Password does not match',
    error: 'Bad Request',
};
