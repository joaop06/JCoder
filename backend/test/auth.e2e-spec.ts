import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../src/auth/auth.module';
import { Test, TestingModule } from '@nestjs/testing';
import { SignInDto } from '../src/auth/dto/sign-in.dto';
import { User } from '../src/users/entities/user.entity';
import { RoleEnum } from '../src/@common/enums/role.enum';
import { UsersService } from '../src/users/users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UserNotFoundException } from '../src/users/exceptions/user-not-found.exception';

describe('Auth E2E Tests', () => {
    let app: INestApplication;
    let configService: ConfigService;
    let testUser: User;
    let usersService: UsersService;

    beforeAll(async () => {
        // Create test user data
        const hashedPassword = await bcrypt.hash('testpassword123', 10);
        testUser = {
            id: 1,
            email: 'test@example.com',
            password: hashedPassword,
            role: RoleEnum.Admin,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: undefined,
        } as User;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
                ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
                AuthModule,
            ],
        })
            .overrideProvider(UsersService)
            .useValue({
                findByEmail: jest.fn().mockImplementation(async (email: string) => {
                    if (email === testUser.email) {
                        return testUser;
                    }
                    throw new UserNotFoundException();
                }),
                findById: jest.fn().mockResolvedValue(testUser),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        configService = app.get<ConfigService>(ConfigService);
        usersService = app.get<UsersService>(UsersService);

        // Apply global validation pipe
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();
    });

    describe('POST /auth/sign-in', () => {
        const signInEndpoint = '/auth/sign-in';

        describe('Successful Authentication', () => {
            it('should authenticate user with valid credentials', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(200);

                expect(response.body).toHaveProperty('accessToken');
                expect(response.body).toHaveProperty('user');
                expect(response.body.user).toHaveProperty('id');
                expect(response.body.user).toHaveProperty('email');
                expect(response.body.user).toHaveProperty('role');
                expect(response.body.user).not.toHaveProperty('password');
                expect(response.body.user.email).toBe(testUser.email);
                expect(response.body.user.id).toBe(testUser.id);
                expect(response.body.user.role).toBe(testUser.role);
                expect(typeof response.body.accessToken).toBe('string');
                expect(response.body.accessToken.length).toBeGreaterThan(0);
            });

            it('should return valid JWT token structure', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(200);

                const token = response.body.accessToken;
                const tokenParts = token.split('.');
                expect(tokenParts).toHaveLength(3); // Header, Payload, Signature
            });

            it('should exclude password from response', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(200);

                expect(response.body.user.password).toBeUndefined();
                expect(JSON.stringify(response.body)).not.toContain('password');
            });
        });

        describe('Authentication Failures', () => {
            it('should return 400 for invalid password', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'wrongpassword',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toBe('Password does not match');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for non-existent user', async () => {
                const signInDto: SignInDto = {
                    email: 'nonexistent@example.com',
                    password: 'anypassword',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.statusCode).toBe(400);
            });
        });

        describe('Input Validation', () => {
            it('should return 400 for invalid email format', async () => {
                const signInDto = {
                    email: 'invalid-email',
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('email must be an email');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for empty email', async () => {
                const signInDto = {
                    email: '',
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('email should not be empty');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for empty password', async () => {
                const signInDto = {
                    email: testUser.email,
                    password: '',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('password should not be empty');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for missing email field', async () => {
                const signInDto = {
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('email should not be empty');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for missing password field', async () => {
                const signInDto = {
                    email: testUser.email,
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('password should not be empty');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for non-string email', async () => {
                const signInDto = {
                    email: 123,
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('email must be a string');
                expect(response.body.statusCode).toBe(400);
            });

            it('should return 400 for non-string password', async () => {
                const signInDto = {
                    email: testUser.email,
                    password: 123,
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(400);

                expect(response.body.message).toContain('password must be a string');
                expect(response.body.statusCode).toBe(400);
            });
        });

        describe('Rate Limiting', () => {
            it('should respect rate limiting', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'wrongpassword',
                };

                // Make multiple requests to trigger rate limiting
                for (let i = 0; i < 6; i++) {
                    const response = await request(app.getHttpServer())
                        .post(signInEndpoint)
                        .send(signInDto);

                    if (i < 5) {
                        expect(response.status).toBe(400); // Wrong password
                    } else {
                        expect(response.status).toBe(429); // Rate limited
                    }
                }
            }, 10000);
        });

        describe('HTTP Method Validation', () => {
            it('should only accept POST requests', async () => {
                await request(app.getHttpServer())
                    .get(signInEndpoint)
                    .expect(404);

                await request(app.getHttpServer())
                    .put(signInEndpoint)
                    .expect(404);

                await request(app.getHttpServer())
                    .delete(signInEndpoint)
                    .expect(404);

                await request(app.getHttpServer())
                    .patch(signInEndpoint)
                    .expect(404);
            });
        });

        describe('Content-Type Validation', () => {
            it('should accept JSON content type', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .set('Content-Type', 'application/json')
                    .send(signInDto)
                    .expect(200);
            });

            it('should handle missing Content-Type header', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(200);
            });
        });

        describe('Response Headers', () => {
            it('should return appropriate response headers', async () => {
                const signInDto: SignInDto = {
                    email: testUser.email,
                    password: 'testpassword123',
                };

                const response = await request(app.getHttpServer())
                    .post(signInEndpoint)
                    .send(signInDto)
                    .expect(200);

                expect(response.headers['content-type']).toContain('application/json');
            });
        });
    });

    describe('Security Tests', () => {
        it('should not expose sensitive information in error messages', async () => {
            const signInDto: SignInDto = {
                email: 'nonexistent@example.com',
                password: 'anypassword',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/sign-in')
                .send(signInDto)
                .expect(400);

            // Should not expose whether user exists or not
            expect(response.body.message).not.toContain('user');
            expect(response.body.message).not.toContain('email');
        });

        it('should handle SQL injection attempts', async () => {
            const signInDto = {
                email: "'; DROP TABLE users; --",
                password: 'anypassword',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/sign-in')
                .send(signInDto)
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });

        it('should handle XSS attempts', async () => {
            const signInDto = {
                email: '<script>alert("xss")</script>@example.com',
                password: 'anypassword',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/sign-in')
                .send(signInDto)
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });
    });
});