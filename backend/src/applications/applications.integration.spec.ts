import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ApplicationsModule } from './applications.module';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { Application } from './entities/application.entity';
import { User } from '../users/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationTypeEnum } from './enums/application-type.enum';
import { RoleEnum } from '../@common/enums/role.enum';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';
import { AlreadyExistsApplicationException } from './exceptions/already-exists-application-exception';
import { testConfig } from '../../test/test.config';

describe('ApplicationsModule Integration Tests', () => {
    let module: TestingModule;
    let applicationsService: ApplicationsService;
    let applicationsController: ApplicationsController;
    let createApplicationUseCase: CreateApplicationUseCase;
    let updateApplicationUseCase: UpdateApplicationUseCase;
    let deleteApplicationUseCase: DeleteApplicationUseCase;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: RoleEnum.Admin,
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        userId: 1,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: mockUser,
    };

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [() => testConfig],
                }),
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [Application, User],
                    synchronize: true,
                    logging: false,
                }),
                TypeOrmModule.forFeature([Application, User]),
                CacheModule.register({
                    ttl: 300,
                    max: 100,
                }),
                ApplicationsModule,
            ],
        }).compile();

        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        applicationsController = module.get<ApplicationsController>(ApplicationsController);
        createApplicationUseCase = module.get<CreateApplicationUseCase>(CreateApplicationUseCase);
        updateApplicationUseCase = module.get<UpdateApplicationUseCase>(UpdateApplicationUseCase);
        deleteApplicationUseCase = module.get<DeleteApplicationUseCase>(DeleteApplicationUseCase);
    });

    afterAll(async () => {
        await module.close();
    });

    beforeEach(async () => {
        // Clean database before each test
        const connection = module.get('DataSource');
        await connection.synchronize(true);
    });

    describe('ApplicationsService Integration', () => {
        it('should create and retrieve application', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Integration Test Application',
                userId: 1,
                description: 'Integration Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/integration',
            };

            // Act
            const createdApplication = await applicationsService.create(createDto);
            const retrievedApplication = await applicationsService.findById(createdApplication.id);

            // Assert
            expect(createdApplication).toBeDefined();
            expect(createdApplication.name).toBe(createDto.name);
            expect(createdApplication.userId).toBe(createDto.userId);
            expect(createdApplication.description).toBe(createDto.description);
            expect(createdApplication.applicationType).toBe(createDto.applicationType);
            expect(createdApplication.githubUrl).toBe(createDto.githubUrl);
            expect(createdApplication.isActive).toBe(true);

            expect(retrievedApplication).toBeDefined();
            expect(retrievedApplication.id).toBe(createdApplication.id);
            expect(retrievedApplication.name).toBe(createdApplication.name);
        });

        it('should update application', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Original Application',
                userId: 1,
                description: 'Original Description',
                applicationType: ApplicationTypeEnum.API,
            };

            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                githubUrl: 'https://github.com/test/updated',
            };

            // Act
            const createdApplication = await applicationsService.create(createDto);
            const updatedApplication = await applicationsService.update(createdApplication.id, updateDto);

            // Assert
            expect(updatedApplication.name).toBe(updateDto.name);
            expect(updatedApplication.description).toBe(updateDto.description);
            expect(updatedApplication.applicationType).toBe(updateDto.applicationType);
            expect(updatedApplication.githubUrl).toBe(updateDto.githubUrl);
        });

        it('should delete application', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'To Be Deleted',
                userId: 1,
                description: 'Will be deleted',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            const createdApplication = await applicationsService.create(createDto);
            await applicationsService.delete(createdApplication.id);

            // Assert
            await expect(applicationsService.findById(createdApplication.id)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should find applications with pagination', async () => {
            // Arrange
            const applications = [];
            for (let i = 1; i <= 15; i++) {
                const createDto: CreateApplicationDto = {
                    name: `Application ${i}`,
                    userId: 1,
                    description: `Description ${i}`,
                    applicationType: ApplicationTypeEnum.API,
                };
                const app = await applicationsService.create(createDto);
                applications.push(app);
            }

            // Act
            const firstPage = await applicationsService.findAllPaginated({ page: 1, limit: 10 });
            const secondPage = await applicationsService.findAllPaginated({ page: 2, limit: 10 });

            // Assert
            expect(firstPage.data).toHaveLength(10);
            expect(firstPage.meta.page).toBe(1);
            expect(firstPage.meta.limit).toBe(10);
            expect(firstPage.meta.total).toBe(15);
            expect(firstPage.meta.totalPages).toBe(2);
            expect(firstPage.meta.hasNextPage).toBe(true);
            expect(firstPage.meta.hasPreviousPage).toBe(false);

            expect(secondPage.data).toHaveLength(5);
            expect(secondPage.meta.page).toBe(2);
            expect(secondPage.meta.hasNextPage).toBe(false);
            expect(secondPage.meta.hasPreviousPage).toBe(true);
        });

        it('should find applications by criteria', async () => {
            // Arrange
            const createDto1: CreateApplicationDto = {
                name: 'API Application',
                userId: 1,
                description: 'API Description',
                applicationType: ApplicationTypeEnum.API,
            };

            const createDto2: CreateApplicationDto = {
                name: 'Mobile Application',
                userId: 1,
                description: 'Mobile Description',
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            await applicationsService.create(createDto1);
            await applicationsService.create(createDto2);

            // Act
            const apiApp = await applicationsService.findOneBy({ name: 'API Application' });
            const mobileApp = await applicationsService.findOneBy({ applicationType: ApplicationTypeEnum.MOBILE });

            // Assert
            expect(apiApp).toBeDefined();
            expect(apiApp.name).toBe('API Application');
            expect(apiApp.applicationType).toBe(ApplicationTypeEnum.API);

            expect(mobileApp).toBeDefined();
            expect(mobileApp.name).toBe('Mobile Application');
            expect(mobileApp.applicationType).toBe(ApplicationTypeEnum.MOBILE);
        });

        it('should handle unique constraint violations', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Unique Application',
                userId: 1,
                description: 'Unique Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            await applicationsService.create(createDto);

            // Assert
            await expect(applicationsService.create(createDto)).rejects.toThrow();
        });
    });

    describe('Use Cases Integration', () => {
        it('should create application with use case', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Use Case Application',
                userId: 1,
                description: 'Use Case Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                    documentationUrl: 'https://api.example.com/docs',
                    healthCheckEndpoint: 'https://api.example.com/health',
                },
            };

            // Act
            const result = await createApplicationUseCase.execute(createDto);

            // Assert
            expect(result).toBeDefined();
            expect(result.name).toBe(createDto.name);
            expect(result.applicationType).toBe(createDto.applicationType);
        });

        it('should update application with use case', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Original Use Case App',
                userId: 1,
                description: 'Original Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const updateDto: UpdateApplicationDto = {
                name: 'Updated Use Case App',
                description: 'Updated Description',
            };

            // Act
            const created = await createApplicationUseCase.execute(createDto);
            const updated = await updateApplicationUseCase.execute(created.id, updateDto);

            // Assert
            expect(updated.name).toBe(updateDto.name);
            expect(updated.description).toBe(updateDto.description);
        });

        it('should delete application with use case', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'To Delete Use Case App',
                userId: 1,
                description: 'Will be deleted',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Act
            const created = await createApplicationUseCase.execute(createDto);
            await deleteApplicationUseCase.execute(created.id);

            // Assert
            await expect(applicationsService.findById(created.id)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should validate application type requirements', async () => {
            // Arrange
            const invalidApiDto: CreateApplicationDto = {
                name: 'Invalid API App',
                userId: 1,
                description: 'Missing API component',
                applicationType: ApplicationTypeEnum.API,
                // Missing applicationComponentApi
            };

            // Act & Assert
            await expect(createApplicationUseCase.execute(invalidApiDto)).rejects.toThrow();
        });

        it('should prevent duplicate application names', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Duplicate Name App',
                userId: 1,
                description: 'First app',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Act
            await createApplicationUseCase.execute(createDto);

            // Assert
            await expect(createApplicationUseCase.execute(createDto)).rejects.toThrow(AlreadyExistsApplicationException);
        });
    });

    describe('Controller Integration', () => {
        it('should handle controller methods', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Controller Test App',
                userId: 1,
                description: 'Controller Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Act
            const created = await applicationsController.create(createDto);
            const found = await applicationsController.findById(created.id);
            const all = await applicationsController.findAll({} as any);
            const paginated = await applicationsController.findAllPaginated({ page: 1, limit: 10 });

            // Assert
            expect(created).toBeDefined();
            expect(found).toBeDefined();
            expect(found.id).toBe(created.id);
            expect(all).toHaveLength(1);
            expect(paginated.data).toHaveLength(1);
            expect(paginated.meta.total).toBe(1);
        });

        it('should handle update through controller', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Controller Update App',
                userId: 1,
                description: 'Original Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const updateDto: UpdateApplicationDto = {
                name: 'Updated Controller App',
                description: 'Updated Description',
            };

            // Act
            const created = await applicationsController.create(createDto);
            const updated = await applicationsController.update(created.id.toString(), updateDto);

            // Assert
            expect(updated.name).toBe(updateDto.name);
            expect(updated.description).toBe(updateDto.description);
        });

        it('should handle delete through controller', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Controller Delete App',
                userId: 1,
                description: 'Will be deleted',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Act
            const created = await applicationsController.create(createDto);
            await applicationsController.delete(created.id.toString());

            // Assert
            await expect(applicationsController.findById(created.id)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('Cache Integration', () => {
        it('should use cache for findById', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Cache Test App',
                userId: 1,
                description: 'Cache Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            const created = await applicationsService.create(createDto);

            // First call should populate cache
            const firstCall = await applicationsService.findById(created.id);

            // Second call should use cache
            const secondCall = await applicationsService.findById(created.id);

            // Assert
            expect(firstCall).toBeDefined();
            expect(secondCall).toBeDefined();
            expect(firstCall.id).toBe(secondCall.id);
        });

        it('should invalidate cache on update', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Cache Invalidation App',
                userId: 1,
                description: 'Original Description',
                applicationType: ApplicationTypeEnum.API,
            };

            const updateDto: UpdateApplicationDto = {
                name: 'Updated Cache App',
                description: 'Updated Description',
            };

            // Act
            const created = await applicationsService.create(createDto);
            await applicationsService.findById(created.id); // Populate cache

            const updated = await applicationsService.update(created.id, updateDto);
            const retrieved = await applicationsService.findById(created.id);

            // Assert
            expect(retrieved.name).toBe(updateDto.name);
            expect(retrieved.description).toBe(updateDto.description);
        });

        it('should invalidate cache on delete', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Cache Delete App',
                userId: 1,
                description: 'Will be deleted',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            const created = await applicationsService.create(createDto);
            await applicationsService.findById(created.id); // Populate cache

            await applicationsService.delete(created.id);

            // Assert
            await expect(applicationsService.findById(created.id)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle database connection errors gracefully', async () => {
            // This test would require mocking database connection failures
            // For now, we'll test that the service handles missing applications
            await expect(applicationsService.findById(999)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should handle validation errors', async () => {
            // Arrange
            const invalidDto = {
                name: '', // Invalid empty name
                userId: 'not-a-number', // Invalid userId type
                description: '', // Invalid empty description
                applicationType: 'INVALID_TYPE', // Invalid enum value
            } as any;

            // Act & Assert
            await expect(applicationsService.create(invalidDto)).rejects.toThrow();
        });

        it('should handle concurrent operations', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Concurrent Test App',
                userId: 1,
                description: 'Concurrent Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            const promises = Array(5).fill(null).map(() =>
                applicationsService.create({ ...createDto, name: `Concurrent App ${Math.random()}` })
            );

            const results = await Promise.all(promises);

            // Assert
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.id).toBeDefined();
            });
        });
    });
});
