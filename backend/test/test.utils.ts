import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/entities/user.entity';
import { RoleEnum } from '../src/@common/enums/role.enum';
import { testConfig } from './test.config';

export class TestUtils {
    /**
     * Create a test user in the database
     */
    static async createTestUser(
        userRepository: Repository<User>,
        overrides: Partial<User> = {}
    ): Promise<User> {
        const hashedPassword = await bcrypt.hash(testConfig.testUser.password, testConfig.bcrypt.rounds);

        const user = userRepository.create({
            email: testConfig.testUser.email,
            password: hashedPassword,
            role: testConfig.testUser.role,
            ...overrides,
        });

        return await userRepository.save(user);
    }

    /**
     * Create multiple test users
     */
    static async createTestUsers(
        userRepository: Repository<User>,
        count: number,
        baseEmail: string = 'test'
    ): Promise<User[]> {
        const users: User[] = [];

        for (let i = 0; i < count; i++) {
            const hashedPassword = await bcrypt.hash('password123', testConfig.bcrypt.rounds);
            const user = userRepository.create({
                email: `${baseEmail}${i}@example.com`,
                password: hashedPassword,
                role: i === 0 ? RoleEnum.Admin : RoleEnum.User,
            });
            users.push(await userRepository.save(user));
        }

        return users;
    }

    /**
     * Clean up test data
     */
    static async cleanupTestData(userRepository: Repository<User>): Promise<void> {
        await userRepository.clear();
    }

    /**
     * Generate a valid JWT token for testing
     */
    static generateTestJwt(payload: any = {}): string {
        const defaultPayload = {
            id: 1,
            email: 'test@example.com',
            role: RoleEnum.Admin,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        };

        // Simple JWT encoding for testing (not cryptographically secure)
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const tokenPayload = Buffer.from(JSON.stringify({ ...defaultPayload, ...payload })).toString('base64url');
        const signature = Buffer.from('test-signature').toString('base64url');

        return `${header}.${tokenPayload}.${signature}`;
    }

    /**
     * Wait for a specified amount of time
     */
    static async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Extract JWT token from response
     */
    static extractTokenFromResponse(response: any): string | null {
        return response.body?.accessToken || null;
    }

    /**
     * Validate JWT token structure
     */
    static isValidJwtToken(token: string): boolean {
        if (!token || typeof token !== 'string') {
            return false;
        }

        const parts = token.split('.');
        return parts.length === 3;
    }

    /**
     * Create test sign-in data
     */
    static createSignInData(overrides: any = {}): any {
        return {
            email: testConfig.testUser.email,
            password: testConfig.testUser.password,
            ...overrides,
        };
    }

    /**
     * Create invalid sign-in data for testing
     */
    static createInvalidSignInData(): any[] {
        return [
            { email: '', password: 'password' },
            { email: 'invalid-email', password: 'password' },
            { email: 'test@example.com', password: '' },
            { email: 'test@example.com' }, // missing password
            { password: 'password' }, // missing email
            { email: 123, password: 'password' }, // invalid email type
            { email: 'test@example.com', password: 123 }, // invalid password type
        ];
    }

    /**
     * Setup test application with proper configuration
     */
    static async setupTestApp(app: INestApplication): Promise<void> {
        // Apply global validation pipe
        app.useGlobalPipes(new (await import('@nestjs/common')).ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        await app.init();
    }

    /**
     * Generate test data for different scenarios
     */
    static generateTestScenarios() {
        return {
            validCredentials: {
                email: 'test@example.com',
                password: 'testpassword123',
            },
            invalidPassword: {
                email: 'test@example.com',
                password: 'wrongpassword',
            },
            nonExistentUser: {
                email: 'nonexistent@example.com',
                password: 'anypassword',
            },
            sqlInjection: {
                email: "'; DROP TABLE users; --",
                password: 'anypassword',
            },
            xssAttempt: {
                email: '<script>alert("xss")</script>@example.com',
                password: 'anypassword',
            },
        };
    }
}
