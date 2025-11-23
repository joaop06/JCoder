import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProfileCompletenessUseCase } from './get-profile-completeness.use-case';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../../@common/services/cache.service';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../../users/user-components/entities/user-component-about-me.entity', () => ({
    UserComponentAboutMe: class UserComponentAboutMe {},
}));

jest.mock('../../users/user-components/entities/user-component-education.entity', () => ({
    UserComponentEducation: class UserComponentEducation {},
}));

jest.mock('../../users/user-components/entities/user-component-experience.entity', () => ({
    UserComponentExperience: class UserComponentExperience {},
}));

jest.mock('../../users/user-components/entities/user-component-certificate.entity', () => ({
    UserComponentCertificate: class UserComponentCertificate {},
}));

jest.mock('../../users/user-components/entities/user-component-reference.entity', () => ({
    UserComponentReference: class UserComponentReference {},
}));

// Mock dos serviços antes de importar
jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    })),
}));

// Mock das entidades para evitar dependências circulares
class UserComponentAboutMe {}
class UserComponentEducation {}
class UserComponentExperience {}
class UserComponentCertificate {}
class UserComponentReference {}

describe('GetProfileCompletenessUseCase', () => {
    let useCase: GetProfileCompletenessUseCase;
    let usersService: UsersService;
    let cacheService: CacheService;
    let aboutMeRepository: Repository<UserComponentAboutMe>;
    let educationRepository: Repository<UserComponentEducation>;
    let experienceRepository: Repository<UserComponentExperience>;
    let certificateRepository: Repository<UserComponentCertificate>;
    let referenceRepository: Repository<UserComponentReference>;

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockCacheService = {
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    };

    const mockAboutMeRepository = {
        count: jest.fn(),
    };

    const mockEducationRepository = {
        count: jest.fn(),
    };

    const mockExperienceRepository = {
        count: jest.fn(),
    };

    const mockCertificateRepository = {
        count: jest.fn(),
    };

    const mockReferenceRepository = {
        count: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        profileImage: 'image.jpg',
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Address',
        githubUrl: 'https://github.com/test',
        linkedinUrl: 'https://linkedin.com/in/test',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetProfileCompletenessUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: getRepositoryToken(UserComponentAboutMe),
                    useValue: mockAboutMeRepository,
                },
                {
                    provide: getRepositoryToken(UserComponentEducation),
                    useValue: mockEducationRepository,
                },
                {
                    provide: getRepositoryToken(UserComponentExperience),
                    useValue: mockExperienceRepository,
                },
                {
                    provide: getRepositoryToken(UserComponentCertificate),
                    useValue: mockCertificateRepository,
                },
                {
                    provide: getRepositoryToken(UserComponentReference),
                    useValue: mockReferenceRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetProfileCompletenessUseCase>(GetProfileCompletenessUseCase);
        usersService = module.get<UsersService>(UsersService);
        cacheService = module.get<CacheService>(CacheService);
        aboutMeRepository = module.get<Repository<UserComponentAboutMe>>(
            getRepositoryToken(UserComponentAboutMe),
        );
        educationRepository = module.get<Repository<UserComponentEducation>>(
            getRepositoryToken(UserComponentEducation),
        );
        experienceRepository = module.get<Repository<UserComponentExperience>>(
            getRepositoryToken(UserComponentExperience),
        );
        certificateRepository = module.get<Repository<UserComponentCertificate>>(
            getRepositoryToken(UserComponentCertificate),
        );
        referenceRepository = module.get<Repository<UserComponentReference>>(
            getRepositoryToken(UserComponentReference),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar completude do perfil com todos os campos preenchidos', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockAboutMeRepository.count.mockResolvedValue(1);
            mockEducationRepository.count.mockResolvedValue(2);
            mockExperienceRepository.count.mockResolvedValue(3);
            mockCertificateRepository.count.mockResolvedValue(1);
            mockReferenceRepository.count.mockResolvedValue(1);

            const result = await useCase.execute(username);

            expect(result.percentage).toBe(100);
            expect(result.completedFields).toBe(12);
            expect(result.totalFields).toBe(12);
            expect(result.fields.profileImage).toBe(true);
            expect(result.fields.fullName).toBe(true);
            expect(result.fields.email).toBe(true);
            expect(result.fields.phone).toBe(true);
            expect(result.fields.address).toBe(true);
            expect(result.fields.githubUrl).toBe(true);
            expect(result.fields.linkedinUrl).toBe(true);
            expect(result.fields.aboutMe).toBe(true);
            expect(result.fields.education).toBe(true);
            expect(result.fields.experience).toBe(true);
            expect(result.fields.certificates).toBe(true);
            expect(result.fields.references).toBe(true);
        });

        it('deve retornar completude parcial do perfil', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';
            const partialUser = {
                ...mockUser,
                phone: null,
                address: null,
                linkedinUrl: null,
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(partialUser);
            mockAboutMeRepository.count.mockResolvedValue(1);
            mockEducationRepository.count.mockResolvedValue(0);
            mockExperienceRepository.count.mockResolvedValue(1);
            mockCertificateRepository.count.mockResolvedValue(0);
            mockReferenceRepository.count.mockResolvedValue(0);

            const result = await useCase.execute(username);

            expect(result.percentage).toBeGreaterThan(0);
            expect(result.percentage).toBeLessThan(100);
            expect(result.completedFields).toBeLessThan(12);
            expect(result.fields.phone).toBe(false);
            expect(result.fields.address).toBe(false);
            expect(result.fields.linkedinUrl).toBe(false);
            expect(result.fields.education).toBe(false);
            expect(result.fields.certificates).toBe(false);
            expect(result.fields.references).toBe(false);
        });

        it('deve retornar completude vazia quando usuário não encontrado', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(null);

            const result = await useCase.execute(username);

            expect(result.percentage).toBe(0);
            expect(result.completedFields).toBe(0);
            expect(result.totalFields).toBe(12);
            expect(Object.values(result.fields).every((v) => v === false)).toBe(true);
        });

        it('deve usar cache quando disponível', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';
            const cachedData = {
                percentage: 75,
                completedFields: 9,
                totalFields: 12,
                fields: {
                    profileImage: true,
                    fullName: true,
                    email: true,
                    phone: false,
                    address: false,
                    githubUrl: true,
                    linkedinUrl: true,
                    aboutMe: true,
                    education: true,
                    experience: true,
                    certificates: false,
                    references: false,
                },
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockResolvedValue(cachedData);

            const result = await useCase.execute(username);

            expect(result).toEqual(cachedData);
            expect(mockUsersService.findOneBy).not.toHaveBeenCalled();
        });
    });
});

