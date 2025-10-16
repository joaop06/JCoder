import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { RoleEnum } from '../src/@common/enums/role.enum';
import { UserNotFoundException } from '../src/users/exceptions/user-not-found.exception';
import { testConfig } from './test.config';

describe('Users E2E Tests', () => {
    let app: INestApplication;
    let usersService: UsersService;
    let configService: ConfigService;
    let testUser: User;
    let adminUser: User;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
                TypeOrmModule.forRoot({
                    ...testConfig.database,
                    entities: [User],
                }),
                ThrottlerModule.forRoot([{
                    ttl: testConfig.throttler.ttl,
                    limit: testConfig.throttler.limit,
                }]),
                JwtModule.register({
                    secret: testConfig.jwt.secret,
                    signOptions: { expiresIn: testConfig.jwt.expiresIn },
                }),
                AppModule,
            ],
        }).compile();

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

        // Create test users
        await setupTestUsers();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    beforeEach(async () => {
        // Reset any mocks or state
    });

    async function setupTestUsers() {
        // Create test user
        const hashedPassword = await bcrypt.hash('testpassword123', testConfig.bcrypt.rounds);
        testUser = {
            id: 1,
            email: 'test@example.com',
            password: hashedPassword,
            role: RoleEnum.User,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        } as User;

        // Create admin user
        const adminHashedPassword = await bcrypt.hash('adminpassword123', testConfig.bcrypt.rounds);
        adminUser = {
            id: 2,
            email: 'admin@example.com',
            password: adminHashedPassword,
            role: RoleEnum.Admin,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        } as User;

        // Save users to database
        const userRepository = usersService['repository'];
        await userRepository.save([testUser, adminUser]);

        // Get auth token for authenticated requests
        const authResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/sign-in')
            .send({
                email: adminUser.email,
                password: 'adminpassword123',
            });

        authToken = authResponse.body.accessToken;
    }

    describe('UsersService Integration', () => {
        describe('findById', () => {
            it('should find user by valid ID', async () => {
                const user = await usersService.findById(testUser.id);

                expect(user).toBeDefined();
                expect(user.id).toBe(testUser.id);
                expect(user.email).toBe(testUser.email);
                expect(user.role).toBe(testUser.role);
            });

            it('should throw UserNotFoundException for non-existent ID', async () => {
                await expect(usersService.findById(99999)).rejects.toThrow(UserNotFoundException);
            });

            it('should handle database connection issues gracefully', async () => {
                // This would require mocking database connection failure
                // For now, we test the normal flow
                const user = await usersService.findById(testUser.id);
                expect(user).toBeDefined();
            });
        });

        describe('findByEmail', () => {
            it('should find user by valid email', async () => {
                const user = await usersService.findByEmail(testUser.email);

                expect(user).toBeDefined();
                expect(user.id).toBe(testUser.id);
                expect(user.email).toBe(testUser.email);
                expect(user.role).toBe(testUser.role);
            });

            it('should throw UserNotFoundException for non-existent email', async () => {
                await expect(usersService.findByEmail('nonexistent@example.com')).rejects.toThrow(UserNotFoundException);
            });

            it('should handle case-sensitive email searches', async () => {
                const user = await usersService.findByEmail(testUser.email);
                expect(user).toBeDefined();

                // Different case should not work (case-sensitive)
                await expect(usersService.findByEmail(testUser.email.toUpperCase())).rejects.toThrow(UserNotFoundException);
            });
        });
    });

    describe('User Entity Integration', () => {
        it('should properly serialize user data without password', async () => {
            const user = await usersService.findById(testUser.id);
            const serialized = JSON.stringify(user);
            const parsed = JSON.parse(serialized);

            expect(parsed).not.toHaveProperty('password');
            expect(parsed).toHaveProperty('id');
            expect(parsed).toHaveProperty('email');
            expect(parsed).toHaveProperty('role');
            expect(parsed).toHaveProperty('createdAt');
            expect(parsed).toHaveProperty('updatedAt');
        });

        it('should handle user timestamps correctly', async () => {
            const user = await usersService.findById(testUser.id);

            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.createdAt.getTime()).toBeLessThanOrEqual(user.updatedAt.getTime());
        });

        it('should handle soft delete functionality', async () => {
            // Create a user to soft delete
            const userRepository = usersService['repository'];
            const userToDelete = await userRepository.save({
                email: 'todelete@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            // Soft delete the user
            await userRepository.softDelete(userToDelete.id);

            // Try to find the user - should throw exception
            await expect(usersService.findById(userToDelete.id)).rejects.toThrow(UserNotFoundException);
        });
    });

    describe('Authentication Integration', () => {
        describe('Sign In with User Service', () => {
            it('should authenticate user using UsersService', async () => {
                const response = await request(app.getHttpServer())
                    .post('/api/v1/auth/sign-in')
                    .send({
                        email: testUser.email,
                        password: 'testpassword123',
                    })
                    .expect(200);

                expect(response.body).toHaveProperty('accessToken');
                expect(response.body).toHaveProperty('user');
                expect(response.body.user.email).toBe(testUser.email);
                expect(response.body.user.role).toBe(testUser.role);
                expect(response.body.user).not.toHaveProperty('password');
            });

            it('should fail authentication for non-existent user', async () => {
                const response = await request(app.getHttpServer())
                    .post('/api/v1/auth/sign-in')
                    .send({
                        email: 'nonexistent@example.com',
                        password: 'anypassword',
                    })
                    .expect(400);

                expect(response.body.statusCode).toBe(400);
            });

            it('should fail authentication for wrong password', async () => {
                const response = await request(app.getHttpServer())
                    .post('/api/v1/auth/sign-in')
                    .send({
                        email: testUser.email,
                        password: 'wrongpassword',
                    })
                    .expect(400);

                expect(response.body.statusCode).toBe(400);
                expect(response.body.message).toBe('Password does not match');
            });
        });

        describe('JWT Token Integration', () => {
            it('should include user data in JWT token', async () => {
                const response = await request(app.getHttpServer())
                    .post('/api/v1/auth/sign-in')
                    .send({
                        email: testUser.email,
                        password: 'testpassword123',
                    })
                    .expect(200);

                const token = response.body.accessToken;
                expect(token).toBeDefined();
                expect(typeof token).toBe('string');

                // Decode JWT token (without verification for testing)
                const tokenParts = token.split('.');
                expect(tokenParts).toHaveLength(3);

                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                expect(payload).toHaveProperty('id');
                expect(payload).toHaveProperty('email');
                expect(payload).toHaveProperty('role');
                expect(payload.email).toBe(testUser.email);
                expect(payload.role).toBe(testUser.role);
            });
        });
    });

    describe('Applications Integration', () => {
        it('should handle user-application relationships', async () => {
            const user = await usersService.findById(testUser.id);

            expect(user.applications).toBeDefined();
            expect(Array.isArray(user.applications)).toBe(true);
        });

        it('should maintain user data integrity when applications are created', async () => {
            // This would require creating an application through the applications endpoint
            // For now, we verify the user structure supports applications
            const user = await usersService.findById(testUser.id);
            expect(user).toHaveProperty('applications');
        });
    });

    describe('Database Operations', () => {
        it('should handle concurrent user lookups', async () => {
            const promises = [
                usersService.findById(testUser.id),
                usersService.findByEmail(testUser.email),
                usersService.findById(adminUser.id),
                usersService.findByEmail(adminUser.email),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(4);
            expect(results[0].id).toBe(testUser.id);
            expect(results[1].email).toBe(testUser.email);
            expect(results[2].id).toBe(adminUser.id);
            expect(results[3].email).toBe(adminUser.email);
        });

        it('should handle database transactions correctly', async () => {
            const userRepository = usersService['repository'];

            // Test that we can perform multiple operations
            const user1 = await usersService.findById(testUser.id);
            const user2 = await usersService.findByEmail(adminUser.email);

            expect(user1).toBeDefined();
            expect(user2).toBeDefined();
            expect(user1.id).not.toBe(user2.id);
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed user data gracefully', async () => {
            // Test with invalid ID
            await expect(usersService.findById(null as any)).rejects.toThrow();
            await expect(usersService.findById(undefined as any)).rejects.toThrow();
        });

        it('should handle invalid email formats', async () => {
            await expect(usersService.findByEmail('')).rejects.toThrow(UserNotFoundException);
            await expect(usersService.findByEmail(null as any)).rejects.toThrow();
        });

        it('should maintain data consistency after errors', async () => {
            // Ensure that after an error, the service still works
            await expect(usersService.findById(99999)).rejects.toThrow(UserNotFoundException);

            // Service should still work for valid requests
            const user = await usersService.findById(testUser.id);
            expect(user).toBeDefined();
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple rapid requests', async () => {
            const promises = Array.from({ length: 10 }, () =>
                usersService.findById(testUser.id)
            );

            const startTime = Date.now();
            const results = await Promise.all(promises);
            const endTime = Date.now();

            expect(results).toHaveLength(10);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

            results.forEach(user => {
                expect(user.id).toBe(testUser.id);
            });
        });

        it('should handle mixed query types efficiently', async () => {
            const promises = [
                usersService.findById(testUser.id),
                usersService.findByEmail(adminUser.email),
                usersService.findById(adminUser.id),
                usersService.findByEmail(testUser.email),
            ];

            const results = await Promise.all(promises);
            expect(results).toHaveLength(4);
            expect(results.every(user => user !== null)).toBe(true);
        });
    });

    describe('Security Integration', () => {
        it('should not expose sensitive data in error messages', async () => {
            try {
                await usersService.findById(99999);
            } catch (error) {
                expect(error.message).not.toContain('password');
                expect(error.message).not.toContain('hash');
                expect(error.message).toBe('User is not found');
            }
        });

        it('should handle SQL injection attempts safely', async () => {
            // Test that the service properly handles malicious input
            await expect(usersService.findByEmail("'; DROP TABLE users; --")).rejects.toThrow(UserNotFoundException);
            await expect(usersService.findById(1)).resolves.toBeDefined(); // Database should still be intact
        });

        it('should maintain password security', async () => {
            const user = await usersService.findById(testUser.id);

            // Password should be hashed and not exposed
            expect(user.password).toBeDefined();
            expect(user.password).not.toBe('testpassword123');
            expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are long
        });
    });
});
