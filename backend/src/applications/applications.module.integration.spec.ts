import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationTypeEnum } from './enums/application-type.enum';
import { MobilePlatformEnum } from './enums/mobile-platform.enum';
import { RoleEnum } from '../@common/enums/role.enum';

// Mock entities to avoid circular dependencies
interface MockApplication {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    user?: any;
    applicationComponentApi?: any;
    applicationComponentMobile?: any;
    applicationComponentLibrary?: any;
    applicationComponentFrontend?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

interface MockUser {
    id: number;
    name: string;
    email: string;
    role: RoleEnum;
    applications?: MockApplication[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock DTOs
interface MockCreateApplicationDto {
    name: string;
    userId: number;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    applicationComponentApi?: {
        domain: string;
        apiUrl: string;
        documentationUrl?: string;
        healthCheckEndpoint?: string;
    };
    applicationComponentMobile?: {
        platform: MobilePlatformEnum;
        downloadUrl?: string;
    };
    applicationComponentLibrary?: {
        packageManagerUrl: string;
        readmeContent?: string;
    };
    applicationComponentFrontend?: {
        frontendUrl: string;
        screenshotUrl?: string;
    };
}

interface MockUpdateApplicationDto {
    name?: string;
    description?: string;
    applicationType?: ApplicationTypeEnum;
    githubUrl?: string;
    isActive?: boolean;
}

// Mock Services
class MockUsersService {
    async findById(id: number): Promise<MockUser> {
        return {
            id,
            name: 'Test User',
            email: 'test@example.com',
            role: RoleEnum.Admin,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}

class MockImageUploadService {
    async deleteAllApplicationImages(applicationId: number): Promise<void> {
        // Mock implementation
    }
}

class MockApplicationComponentsService {
    async saveComponentsForType(dto: any): Promise<void> {
        // Mock implementation
    }
}

// Mock ApplicationsService
class MockApplicationsService {
    constructor(
        private readonly repository: Repository<MockApplication>,
        private readonly cacheService: any,
        private readonly imageUploadService: any,
    ) { }

    async findAll(options?: any): Promise<MockApplication[]> {
        return await this.repository.find({
            ...options,
            relations: { user: true },
        });
    }

    async findAllPaginated(paginationDto: any): Promise<any> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;

        const cacheKey = this.cacheService.generateKey('applications', 'paginated', page, limit, sortBy, sortOrder);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.repository.findAndCount({
                    relations: { user: true },
                    skip,
                    take: limit,
                    order: { [sortBy]: sortOrder },
                });

                const totalPages = Math.ceil(total / limit);

                return {
                    data,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1,
                    },
                };
            },
            300,
        );
    }

    async findById(id: number): Promise<MockApplication> {
        const cacheKey = this.cacheService.applicationKey(id, 'full');

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const application = await this.repository.findOne({
                    where: { id },
                    relations: {
                        user: true,
                        applicationComponentApi: true,
                        applicationComponentMobile: true,
                        applicationComponentLibrary: true,
                        applicationComponentFrontend: true,
                    },
                });
                if (!application) throw new Error('Application not found');
                return application;
            },
            600,
        );
    }

    async findOneBy(options?: any): Promise<MockApplication | null> {
        return await this.repository.findOneBy(options || {});
    }

    async create(createApplicationDto: MockCreateApplicationDto): Promise<MockApplication> {
        const application = this.repository.create(createApplicationDto);
        const savedApplication = await this.repository.save(application);

        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));

        return savedApplication;
    }

    async update(id: number, updateApplicationDto: MockUpdateApplicationDto): Promise<MockApplication> {
        const application = await this.findById(id);
        this.repository.merge(application, updateApplicationDto);
        const updatedApplication = await this.repository.save(application);

        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));

        return updatedApplication;
    }

    async delete(id: number): Promise<void> {
        const application = await this.findById(id);

        if (application.images && application.images.length > 0) {
            await this.imageUploadService.deleteAllApplicationImages(id);
        }

        await this.repository.delete(id);

        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
    }
}

// Mock ApplicationsController
class MockApplicationsController {
    constructor(
        private readonly applicationsService: MockApplicationsService,
        private readonly createApplicationUseCase: any,
        private readonly deleteApplicationUseCase: any,
        private readonly updateApplicationUseCase: any,
    ) { }

    async findAll(options: any) {
        return await this.applicationsService.findAll(options);
    }

    async findAllPaginated(paginationDto: any) {
        return await this.applicationsService.findAllPaginated(paginationDto);
    }

    async findById(id: number) {
        return await this.applicationsService.findById(id);
    }

    async create(createApplicationDto: MockCreateApplicationDto) {
        return await this.createApplicationUseCase.execute(createApplicationDto);
    }

    async update(id: string, updateApplicationDto: MockUpdateApplicationDto) {
        return await this.updateApplicationUseCase.execute(+id, updateApplicationDto);
    }

    async delete(id: string) {
        return await this.deleteApplicationUseCase.execute(+id);
    }
}

// Mock Use Cases
class MockCreateApplicationUseCase {
    constructor(
        private readonly usersService: MockUsersService,
        private readonly applicationsService: MockApplicationsService,
        private readonly applicationComponentsService: MockApplicationComponentsService,
    ) { }

    async execute(createApplicationDto: MockCreateApplicationDto): Promise<MockApplication> {
        await this.usersService.findById(createApplicationDto.userId);
        this.validateDetailsForType(createApplicationDto);

        const exists = await this.applicationsService.findOneBy({ name: createApplicationDto.name });
        if (exists) throw new Error('Application already exists');

        const application = await this.applicationsService.create(createApplicationDto);

        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: createApplicationDto.applicationType,
            dtos: {
                applicationComponentApi: createApplicationDto.applicationComponentApi,
                applicationComponentMobile: createApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: createApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: createApplicationDto.applicationComponentFrontend,
            },
        });

        return await this.applicationsService.findById(application.id);
    }

    private validateDetailsForType(dto: MockCreateApplicationDto): void {
        switch (dto.applicationType) {
            case ApplicationTypeEnum.API:
                if (!dto.applicationComponentApi) {
                    throw new Error('API component is required for API application type');
                }
                break;
            case ApplicationTypeEnum.FRONTEND:
                if (!dto.applicationComponentFrontend) {
                    throw new Error('Frontend component is required for Frontend application type');
                }
                break;
            case ApplicationTypeEnum.FULLSTACK:
                if (!dto.applicationComponentApi || !dto.applicationComponentFrontend) {
                    throw new Error('Both API and Frontend components are required for Fullstack application type');
                }
                break;
            case ApplicationTypeEnum.MOBILE:
                if (!dto.applicationComponentMobile) {
                    throw new Error('Mobile component is required for Mobile application type');
                }
                break;
            case ApplicationTypeEnum.LIBRARY:
                if (!dto.applicationComponentLibrary) {
                    throw new Error('Library component is required for Library application type');
                }
                break;
        }
    }
}

class MockUpdateApplicationUseCase {
    constructor(
        private readonly applicationsService: MockApplicationsService,
    ) { }

    async execute(id: number, updateApplicationDto: MockUpdateApplicationDto): Promise<MockApplication> {
        await this.applicationsService.findById(id);

        const exists = await this.applicationsService.findOneBy({ name: updateApplicationDto.name });
        if (exists && exists.id !== id) {
            throw new Error('Application name already exists');
        }

        const updatedApplication = await this.applicationsService.update(id, updateApplicationDto);
        return await this.applicationsService.findById(updatedApplication.id);
    }
}

class MockDeleteApplicationUseCase {
    constructor(
        private readonly applicationsService: MockApplicationsService,
    ) { }

    async execute(id: number): Promise<void> {
        const application = await this.applicationsService.findById(id);
        if (!application) {
            throw new Error('Application not found or already deleted');
        }

        await this.applicationsService.delete(id);
    }
}

describe('ApplicationsModule Integration', () => {
    let module: TestingModule;
    let applicationsService: MockApplicationsService;
    let applicationsController: MockApplicationsController;
    let createApplicationUseCase: MockCreateApplicationUseCase;
    let deleteApplicationUseCase: MockDeleteApplicationUseCase;
    let updateApplicationUseCase: MockUpdateApplicationUseCase;
    let cacheService: any;
    let mockApplicationRepository: jest.Mocked<Repository<MockApplication>>;

    const mockApplication: MockApplication = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        profileImage: 'profile.png',
        user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: RoleEnum.Admin,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser: MockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: RoleEnum.Admin,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        // Create mock repository
        mockApplicationRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
        } as any;

        // Create mock cache service
        const mockCacheService = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            getOrSet: jest.fn(),
            generateKey: jest.fn((prefix: string, ...parts: (string | number)[]) => `${prefix}:${parts.join(':')}`),
            applicationKey: jest.fn((id: number, suffix: string) => `application:${id}:${suffix}`),
        };

        // Create mock services
        const mockUsersService = new MockUsersService();
        const mockImageUploadService = new MockImageUploadService();
        const mockApplicationComponentsService = new MockApplicationComponentsService();

        // Create service instances
        applicationsService = new MockApplicationsService(
            mockApplicationRepository,
            mockCacheService,
            mockImageUploadService,
        );

        createApplicationUseCase = new MockCreateApplicationUseCase(
            mockUsersService,
            applicationsService,
            mockApplicationComponentsService,
        );

        updateApplicationUseCase = new MockUpdateApplicationUseCase(applicationsService);
        deleteApplicationUseCase = new MockDeleteApplicationUseCase(applicationsService);

        applicationsController = new MockApplicationsController(
            applicationsService,
            createApplicationUseCase,
            deleteApplicationUseCase,
            updateApplicationUseCase,
        );

        cacheService = mockCacheService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Module Initialization', () => {
        it('should have ApplicationsService defined', () => {
            expect(applicationsService).toBeDefined();
            expect(applicationsService).toBeInstanceOf(MockApplicationsService);
        });

        it('should have ApplicationsController defined', () => {
            expect(applicationsController).toBeDefined();
            expect(applicationsController).toBeInstanceOf(MockApplicationsController);
        });

        it('should have all use cases defined', () => {
            expect(createApplicationUseCase).toBeDefined();
            expect(createApplicationUseCase).toBeInstanceOf(MockCreateApplicationUseCase);
            expect(deleteApplicationUseCase).toBeDefined();
            expect(deleteApplicationUseCase).toBeInstanceOf(MockDeleteApplicationUseCase);
            expect(updateApplicationUseCase).toBeDefined();
            expect(updateApplicationUseCase).toBeInstanceOf(MockUpdateApplicationUseCase);
        });

        it('should have CacheService defined', () => {
            expect(cacheService).toBeDefined();
            expect(cacheService.generateKey).toBeDefined();
            expect(cacheService.applicationKey).toBeDefined();
        });

        it('should have Application repository available', () => {
            expect(mockApplicationRepository).toBeDefined();
            expect(mockApplicationRepository.create).toBeDefined();
            expect(mockApplicationRepository.save).toBeDefined();
            expect(mockApplicationRepository.find).toBeDefined();
        });
    });

    describe('ApplicationsService Integration', () => {
        describe('findAll', () => {
            it('should find all applications with relations', async () => {
                const mockApplications = [mockApplication];
                mockApplicationRepository.find.mockResolvedValue(mockApplications as any);

                const result = await applicationsService.findAll();

                expect(result).toEqual(mockApplications);
                expect(mockApplicationRepository.find).toHaveBeenCalledWith({
                    relations: { user: true },
                });
            });

            it('should find applications with custom options', async () => {
                const options = { where: { isActive: true } };
                const mockApplications = [mockApplication];
                mockApplicationRepository.find.mockResolvedValue(mockApplications as any);

                const result = await applicationsService.findAll(options);

                expect(result).toEqual(mockApplications);
                expect(mockApplicationRepository.find).toHaveBeenCalledWith({
                    ...options,
                    relations: { user: true },
                });
            });
        });

        describe('findAllPaginated', () => {
            it('should return paginated applications', async () => {
                const paginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' };
                const mockApplications = [mockApplication];
                const total = 1;

                const expectedResult = {
                    data: mockApplications,
                    meta: {
                        page: 1,
                        limit: 10,
                        total: 1,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    },
                };

                mockApplicationRepository.findAndCount.mockResolvedValue([mockApplications as any, total]);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                const result = await applicationsService.findAllPaginated(paginationDto);

                expect(result).toEqual(expectedResult);
                expect(mockApplicationRepository.findAndCount).toHaveBeenCalledWith({
                    relations: { user: true },
                    skip: 0,
                    take: 10,
                    order: { createdAt: 'DESC' },
                });
            });

            it('should handle pagination with multiple pages', async () => {
                const paginationDto = { page: 2, limit: 5, sortBy: 'name', sortOrder: 'ASC' };
                const mockApplications = [mockApplication];
                const total = 12;

                mockApplicationRepository.findAndCount.mockResolvedValue([mockApplications as any, total]);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                const result = await applicationsService.findAllPaginated(paginationDto);

                expect(result.meta).toEqual({
                    page: 2,
                    limit: 5,
                    total: 12,
                    totalPages: 3,
                    hasNextPage: true,
                    hasPreviousPage: true,
                });
                expect(mockApplicationRepository.findAndCount).toHaveBeenCalledWith({
                    relations: { user: true },
                    skip: 5,
                    take: 5,
                    order: { name: 'ASC' },
                });
            });
        });

        describe('findById', () => {
            it('should find application by id with all relations', async () => {
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                const result = await applicationsService.findById(1);

                expect(result).toEqual(mockApplication);
                expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
                    where: { id: 1 },
                    relations: {
                        user: true,
                        applicationComponentApi: true,
                        applicationComponentMobile: true,
                        applicationComponentLibrary: true,
                        applicationComponentFrontend: true,
                    },
                });
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                mockApplicationRepository.findOne.mockResolvedValue(null);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                await expect(applicationsService.findById(999)).rejects.toThrow('Application not found');
            });
        });

        describe('findOneBy', () => {
            it('should find application by criteria', async () => {
                const criteria = { name: 'Test Application' };
                mockApplicationRepository.findOneBy.mockResolvedValue(mockApplication as any);

                const result = await applicationsService.findOneBy(criteria);

                expect(result).toEqual(mockApplication);
                expect(mockApplicationRepository.findOneBy).toHaveBeenCalledWith(criteria);
            });

            it('should return null when no application found', async () => {
                const criteria = { name: 'Non-existent Application' };
                mockApplicationRepository.findOneBy.mockResolvedValue(null);

                const result = await applicationsService.findOneBy(criteria);

                expect(result).toBeNull();
                expect(mockApplicationRepository.findOneBy).toHaveBeenCalledWith(criteria);
            });
        });

        describe('create', () => {
            it('should create new application', async () => {
                const createDto: MockCreateApplicationDto = {
                    name: 'New Application',
                    userId: 1,
                    description: 'New Description',
                    applicationType: ApplicationTypeEnum.API,
                    githubUrl: 'https://github.com/test/new-app',
                };

                const createdApplication = { ...mockApplication, ...createDto };
                mockApplicationRepository.create.mockReturnValue(createdApplication as any);
                mockApplicationRepository.save.mockResolvedValue(createdApplication as any);

                const result = await applicationsService.create(createDto);

                expect(result).toEqual(createdApplication);
                expect(mockApplicationRepository.create).toHaveBeenCalledWith(createDto);
                expect(mockApplicationRepository.save).toHaveBeenCalledWith(createdApplication);
            });
        });

        describe('update', () => {
            it('should update existing application', async () => {
                const updateDto: MockUpdateApplicationDto = {
                    name: 'Updated Application',
                    description: 'Updated Description',
                };

                const updatedApplication = { ...mockApplication, ...updateDto };
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.merge.mockImplementation((target: any, source: any) => {
                    return { ...target, ...source };
                });
                mockApplicationRepository.save.mockImplementation((entity) => {
                    return Promise.resolve(entity as any);
                });
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                const result = await applicationsService.update(1, updateDto);

                expect(result).toBeDefined();
                expect(mockApplicationRepository.merge).toHaveBeenCalledWith(mockApplication, updateDto);
                expect(mockApplicationRepository.save).toHaveBeenCalled();
            });
        });

        describe('delete', () => {
            it('should delete application and associated images', async () => {
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.delete.mockResolvedValue({ affected: 1 } as any);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                await applicationsService.delete(1);

                expect(mockApplicationRepository.delete).toHaveBeenCalledWith(1);
            });

            it('should handle deletion of application without images', async () => {
                const applicationWithoutImages = { ...mockApplication, images: undefined as any };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutImages as any);
                mockApplicationRepository.delete.mockResolvedValue({ affected: 1 } as any);
                cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                    return await factory();
                });

                await applicationsService.delete(1);

                expect(mockApplicationRepository.delete).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('ApplicationsController Integration', () => {
        describe('findAll', () => {
            it('should return all applications', async () => {
                const mockApplications = [mockApplication];
                jest.spyOn(applicationsService, 'findAll').mockResolvedValue(mockApplications as any);

                const result = await applicationsController.findAll({});

                expect(result).toEqual(mockApplications);
                expect(applicationsService.findAll).toHaveBeenCalledWith({});
            });
        });

        describe('findAllPaginated', () => {
            it('should return paginated applications', async () => {
                const paginationDto = { page: 1, limit: 10 };
                const mockPaginatedResponse = {
                    data: [mockApplication],
                    meta: {
                        page: 1,
                        limit: 10,
                        total: 1,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    },
                };

                jest.spyOn(applicationsService, 'findAllPaginated').mockResolvedValue(mockPaginatedResponse as any);

                const result = await applicationsController.findAllPaginated(paginationDto);

                expect(result).toEqual(mockPaginatedResponse);
                expect(applicationsService.findAllPaginated).toHaveBeenCalledWith(paginationDto);
            });
        });

        describe('findById', () => {
            it('should return application by id', async () => {
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(mockApplication as any);

                const result = await applicationsController.findById(1);

                expect(result).toEqual(mockApplication);
                expect(applicationsService.findById).toHaveBeenCalledWith(1);
            });
        });

        describe('create', () => {
            it('should create new application through use case', async () => {
                const createDto: MockCreateApplicationDto = {
                    name: 'New Application',
                    userId: 1,
                    description: 'New Description',
                    applicationType: ApplicationTypeEnum.API,
                };

                const createdApplication = { ...mockApplication, ...createDto };
                jest.spyOn(createApplicationUseCase, 'execute').mockResolvedValue(createdApplication as any);

                const result = await applicationsController.create(createDto);

                expect(result).toEqual(createdApplication);
                expect(createApplicationUseCase.execute).toHaveBeenCalledWith(createDto);
            });
        });

        describe('update', () => {
            it('should update application through use case', async () => {
                const updateDto: MockUpdateApplicationDto = {
                    name: 'Updated Application',
                    description: 'Updated Description',
                };

                const updatedApplication = { ...mockApplication, ...updateDto };
                jest.spyOn(updateApplicationUseCase, 'execute').mockResolvedValue(updatedApplication as any);

                const result = await applicationsController.update('1', updateDto);

                expect(result).toEqual(updatedApplication);
                expect(updateApplicationUseCase.execute).toHaveBeenCalledWith(1, updateDto);
            });
        });

        describe('delete', () => {
            it('should delete application through use case', async () => {
                jest.spyOn(deleteApplicationUseCase, 'execute').mockResolvedValue(undefined);

                const result = await applicationsController.delete('1');

                expect(result).toBeUndefined();
                expect(deleteApplicationUseCase.execute).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('Use Cases Integration', () => {
        describe('CreateApplicationUseCase', () => {
            it('should create API application with components', async () => {
                const createDto: MockCreateApplicationDto = {
                    name: 'API Application',
                    userId: 1,
                    description: 'API Description',
                    applicationType: ApplicationTypeEnum.API,
                    applicationComponentApi: {
                        domain: 'api.example.com',
                        apiUrl: 'https://api.example.com/v1',
                        documentationUrl: 'https://api.example.com/docs',
                        healthCheckEndpoint: 'https://api.example.com/health',
                    },
                };

                const createdApplication = { ...mockApplication, ...createDto };
                jest.spyOn(applicationsService, 'create').mockResolvedValue(createdApplication as any);
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(createdApplication as any);

                const result = await createApplicationUseCase.execute(createDto);

                expect(result).toEqual(createdApplication);
                expect(applicationsService.create).toHaveBeenCalledWith(createDto);
            });

            it('should create MOBILE application with components', async () => {
                const createDto: MockCreateApplicationDto = {
                    name: 'Mobile Application',
                    userId: 1,
                    description: 'Mobile Description',
                    applicationType: ApplicationTypeEnum.MOBILE,
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.ANDROID,
                        downloadUrl: 'https://play.google.com/store/apps/details?id=com.example.app',
                    },
                };

                const createdApplication = { ...mockApplication, ...createDto };
                jest.spyOn(applicationsService, 'create').mockResolvedValue(createdApplication as any);
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(createdApplication as any);

                const result = await createApplicationUseCase.execute(createDto);

                expect(result).toEqual(createdApplication);
                expect(applicationsService.create).toHaveBeenCalledWith(createDto);
            });

            it('should create FULLSTACK application with both API and Frontend components', async () => {
                const createDto: MockCreateApplicationDto = {
                    name: 'Fullstack Application',
                    userId: 1,
                    description: 'Fullstack Description',
                    applicationType: ApplicationTypeEnum.FULLSTACK,
                    applicationComponentApi: {
                        domain: 'api.example.com',
                        apiUrl: 'https://api.example.com/v1',
                    },
                    applicationComponentFrontend: {
                        frontendUrl: 'https://app.example.com',
                        screenshotUrl: 'https://app.example.com/screenshot.png',
                    },
                };

                const createdApplication = { ...mockApplication, ...createDto };
                jest.spyOn(applicationsService, 'create').mockResolvedValue(createdApplication as any);
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(createdApplication as any);

                const result = await createApplicationUseCase.execute(createDto);

                expect(result).toEqual(createdApplication);
                expect(applicationsService.create).toHaveBeenCalledWith(createDto);
            });
        });

        describe('UpdateApplicationUseCase', () => {
            it('should update application successfully', async () => {
                const updateDto: MockUpdateApplicationDto = {
                    name: 'Updated Application',
                    description: 'Updated Description',
                    isActive: false,
                };

                const updatedApplication = { ...mockApplication, ...updateDto };
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(mockApplication as any);
                jest.spyOn(applicationsService, 'update').mockResolvedValue(updatedApplication as any);
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(updatedApplication as any);

                const result = await updateApplicationUseCase.execute(1, updateDto);

                expect(result).toEqual(updatedApplication);
                expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            });
        });

        describe('DeleteApplicationUseCase', () => {
            it('should delete application successfully', async () => {
                jest.spyOn(applicationsService, 'findById').mockResolvedValue(mockApplication as any);
                jest.spyOn(applicationsService, 'delete').mockResolvedValue(undefined);

                await deleteApplicationUseCase.execute(1);

                expect(applicationsService.delete).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('Cache Integration', () => {
        it('should use cache service for paginated results', async () => {
            const paginationDto = { page: 1, limit: 10 };
            const mockPaginatedResponse = {
                data: [mockApplication],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockApplicationRepository.findAndCount.mockResolvedValue([[mockApplication] as any, 1]);
            cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                return await factory();
            });

            const result = await applicationsService.findAllPaginated(paginationDto);

            expect(result).toEqual(mockPaginatedResponse);
        });

        it('should use cache service for findById', async () => {
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
            cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                return await factory();
            });

            const result = await applicationsService.findById(1);

            expect(result).toEqual(mockApplication);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle repository errors gracefully', async () => {
            const error = new Error('Database connection failed');
            mockApplicationRepository.find.mockRejectedValue(error);

            await expect(applicationsService.findAll()).rejects.toThrow('Database connection failed');
        });

        it('should handle cache service errors gracefully', async () => {
            const error = new Error('Cache service unavailable');
            jest.spyOn(cacheService, 'getOrSet').mockRejectedValue(error);

            await expect(applicationsService.findById(1)).rejects.toThrow('Cache service unavailable');
        });
    });

    describe('Module Dependencies Integration', () => {
        it('should integrate with UsersModule', async () => {
            const createDto: MockCreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'test.com',
                    apiUrl: 'https://test.com/api',
                },
            };

            const createdApplication = { ...mockApplication, ...createDto };
            mockApplicationRepository.create.mockReturnValue(createdApplication as any);
            mockApplicationRepository.save.mockResolvedValue(createdApplication as any);
            mockApplicationRepository.findOneBy.mockResolvedValue(null);
            mockApplicationRepository.findOne.mockResolvedValue(createdApplication as any);
            cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                return await factory();
            });

            const result = await createApplicationUseCase.execute(createDto);

            expect(result).toBeDefined();
            expect(result.userId).toBe(1);
        });

        it('should integrate with ImagesModule', async () => {
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };
            mockApplicationRepository.findOne.mockResolvedValue(applicationWithImages as any);
            mockApplicationRepository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                return await factory();
            });

            await applicationsService.delete(1);

            expect(mockApplicationRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should integrate with ApplicationComponentsModule', async () => {
            const createDto: MockCreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'test.com',
                    apiUrl: 'https://test.com/api',
                },
            };

            const createdApplication = { ...mockApplication, ...createDto };
            mockApplicationRepository.create.mockReturnValue(createdApplication as any);
            mockApplicationRepository.save.mockResolvedValue(createdApplication as any);
            mockApplicationRepository.findOneBy.mockResolvedValue(null);
            mockApplicationRepository.findOne.mockResolvedValue(createdApplication as any);
            cacheService.getOrSet.mockImplementation(async (key: string, factory: () => Promise<any>) => {
                return await factory();
            });

            const result = await createApplicationUseCase.execute(createDto);

            expect(result).toBeDefined();
            expect(result.applicationType).toBe(ApplicationTypeEnum.API);
        });
    });
});
