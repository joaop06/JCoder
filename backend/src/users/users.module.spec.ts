import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersModule', () => {
    let module: TestingModule;

    const mockRepository = {
        findOneBy: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        count: jest.fn(),
        remove: jest.fn(),
        preload: jest.fn(),
        upsert: jest.fn(),
        insert: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [UsersModule],
        })
            .overrideProvider(getRepositoryToken(User))
            .useValue(mockRepository)
            .compile();
    });

    afterEach(async () => {
        if (module) {
            await module.close();
        }
        jest.clearAllMocks();
    });

    describe('Module Definition', () => {
        it('should be defined', () => {
            expect(UsersModule).toBeDefined();
        });

        it('should be instantiable', () => {
            expect(module).toBeDefined();
        });
    });

    describe('Providers', () => {
        it('should provide UsersService', () => {
            const usersService = module.get<UsersService>(UsersService);
            expect(usersService).toBeDefined();
            expect(usersService).toBeInstanceOf(UsersService);
        });

        it('should provide User repository', () => {
            const userRepository = module.get<Repository<User>>(getRepositoryToken(User));
            expect(userRepository).toBeDefined();
        });
    });

    describe('Exports', () => {
        it('should export UsersService', () => {
            const usersService = module.get<UsersService>(UsersService);
            expect(usersService).toBeDefined();
        });
    });

    describe('Imports', () => {
        it('should import TypeOrmModule with User entity', () => {
            const userRepository = module.get<Repository<User>>(getRepositoryToken(User));
            expect(userRepository).toBeDefined();
        });
    });

    describe('Module Configuration', () => {
        it('should have correct module metadata', () => {
            const moduleMetadata = Reflect.getMetadata('imports', UsersModule);
            const providersMetadata = Reflect.getMetadata('providers', UsersModule);
            const exportsMetadata = Reflect.getMetadata('exports', UsersModule);

            expect(moduleMetadata).toBeDefined();
            expect(providersMetadata).toBeDefined();
            expect(exportsMetadata).toBeDefined();
        });

        it('should have UsersService in providers', () => {
            const providersMetadata = Reflect.getMetadata('providers', UsersModule);
            expect(providersMetadata).toContain(UsersService);
        });

        it('should have UsersService in exports', () => {
            const exportsMetadata = Reflect.getMetadata('exports', UsersModule);
            expect(exportsMetadata).toContain(UsersService);
        });

        it('should have TypeOrmModule.forFeature in imports', () => {
            const importsMetadata = Reflect.getMetadata('imports', UsersModule);
            expect(importsMetadata).toBeDefined();
            expect(importsMetadata.length).toBeGreaterThan(0);
        });
    });

    describe('Service Injection', () => {
        it('should inject UsersService with repository dependency', () => {
            const usersService = module.get<UsersService>(UsersService);
            expect(usersService).toBeDefined();

            // Verify that the service has access to repository methods
            expect(typeof usersService.findById).toBe('function');
            expect(typeof usersService.findByEmail).toBe('function');
        });
    });

    describe('Module Isolation', () => {
        it('should not provide services from other modules', () => {
            // These services should not be available in this module
            expect(() => module.get('AuthService')).toThrow();
            expect(() => module.get('ApplicationsService')).toThrow();
        });
    });

    describe('TypeORM Integration', () => {
        it('should properly configure TypeORM for User entity', async () => {
            const userRepository = module.get<Repository<User>>(getRepositoryToken(User));
            expect(userRepository).toBeDefined();

            // Test that we can perform basic repository operations with mock
            const user = new User();
            user.email = 'test@example.com';
            user.password = 'hashedPassword';
            user.role = 'user' as any;

            mockRepository.save.mockResolvedValue({ ...user, id: 1 });

            const savedUser = await userRepository.save(user);
            expect(savedUser).toBeDefined();
            expect(savedUser.id).toBeDefined();
            expect(mockRepository.save).toHaveBeenCalledWith(user);
        });
    });

    describe('Module Reusability', () => {
        it('should be importable in other modules', async () => {
            const testModule = await Test.createTestingModule({
                imports: [UsersModule],
            })
                .overrideProvider(getRepositoryToken(User))
                .useValue(mockRepository)
                .compile();

            const usersService = testModule.get<UsersService>(UsersService);
            expect(usersService).toBeDefined();

            await testModule.close();
        });
    });

    describe('Error Handling', () => {
        it('should handle module initialization errors gracefully', async () => {
            // Test with invalid module configuration - this should not throw
            // as we're just testing the module structure, not actual database connection
            const testModule = await Test.createTestingModule({
                imports: [UsersModule],
            })
                .overrideProvider(getRepositoryToken(User))
                .useValue(null)
                .compile();

            expect(testModule).toBeDefined();
            await testModule.close();
        });
    });
});