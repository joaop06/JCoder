import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { UsersService } from '../../administration-by-user/users/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../../administration-by-user/users/exceptions/username-already-exists.exception';

// Mock das entidades
jest.mock('../../administration-by-user/users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../entities/email-verification.entity', () => ({
    EmailVerification: class EmailVerification {},
}));

jest.mock('../../administration-by-user/users/user-components/entities/user-component-about-me.entity', () => ({
    UserComponentAboutMe: class UserComponentAboutMe {},
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

// Mock dos serviços
jest.mock('../../administration-by-user/users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        existsBy: jest.fn(),
    })),
}));

import { User } from '../../administration-by-user/users/entities/user.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { UserComponentAboutMe } from '../../administration-by-user/users/user-components/entities/user-component-about-me.entity';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let usersService: UsersService;
    let userRepository: Repository<User>;
    let aboutMeRepository: Repository<UserComponentAboutMe>;
    let emailVerificationRepository: Repository<EmailVerification>;

    const mockUsersService = {
        existsBy: jest.fn(),
    };

    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockAboutMeRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockEmailVerificationRepository = {
        findOne: jest.fn(),
    };

    const mockCreateUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        fullName: 'Test User',
        occupation: 'Developer',
        description: 'Test description',
    };

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    const mockEmailVerification: EmailVerification = {
        id: 1,
        email: 'test@example.com',
        code: '123456',
        verified: true,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
    } as EmailVerification;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(UserComponentAboutMe),
                    useValue: mockAboutMeRepository,
                },
                {
                    provide: getRepositoryToken(EmailVerification),
                    useValue: mockEmailVerificationRepository,
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        aboutMeRepository = module.get<Repository<UserComponentAboutMe>>(
            getRepositoryToken(UserComponentAboutMe),
        );
        emailVerificationRepository = module.get<Repository<EmailVerification>>(
            getRepositoryToken(EmailVerification),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve criar novo usuário com sucesso', async () => {
            const hashedPassword = 'hashedpassword';
            const userWithoutPassword = { ...mockUser };
            delete (userWithoutPassword as any).password;

            mockUsersService.existsBy
                .mockResolvedValueOnce(false) // username não existe
                .mockResolvedValueOnce(false); // email não existe
            mockEmailVerificationRepository.findOne.mockResolvedValue(mockEmailVerification);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAboutMeRepository.create.mockReturnValue({ id: 1, userId: 1 });
            mockAboutMeRepository.save.mockResolvedValue({ id: 1, userId: 1 });

            const result = await useCase.execute(mockCreateUserDto);

            expect(result).toEqual(userWithoutPassword);
            expect(mockUsersService.existsBy).toHaveBeenCalledWith({ username: mockCreateUserDto.username });
            expect(mockUsersService.existsBy).toHaveBeenCalledWith({ email: mockCreateUserDto.email });
            expect(mockEmailVerificationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockCreateUserDto.email,
                    verified: true,
                },
                order: {
                    createdAt: 'DESC',
                },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(mockAboutMeRepository.create).toHaveBeenCalled();
            expect(mockAboutMeRepository.save).toHaveBeenCalled();
        });

        it('deve lançar exceção quando username já existe', async () => {
            mockUsersService.existsBy.mockResolvedValueOnce(true); // username existe

            await expect(useCase.execute(mockCreateUserDto)).rejects.toThrow(
                UsernameAlreadyExistsException,
            );

            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando email já existe', async () => {
            mockUsersService.existsBy
                .mockResolvedValueOnce(false) // username não existe
                .mockResolvedValueOnce(true); // email existe

            await expect(useCase.execute(mockCreateUserDto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );

            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando email não foi verificado', async () => {
            mockUsersService.existsBy
                .mockResolvedValueOnce(false) // username não existe
                .mockResolvedValueOnce(false); // email não existe
            mockEmailVerificationRepository.findOne.mockResolvedValue(null); // email não verificado

            await expect(useCase.execute(mockCreateUserDto)).rejects.toThrow(
                BadRequestException,
            );

            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it('deve criar aboutMe mesmo quando campos estão vazios', async () => {
            const hashedPassword = 'hashedpassword';
            const userWithoutPassword = { ...mockUser };
            delete (userWithoutPassword as any).password;
            const createDtoWithoutAboutMe = {
                ...mockCreateUserDto,
                occupation: undefined,
                description: undefined,
            };

            mockUsersService.existsBy
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false);
            mockEmailVerificationRepository.findOne.mockResolvedValue(mockEmailVerification);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAboutMeRepository.create.mockReturnValue({ id: 1, userId: 1 });
            mockAboutMeRepository.save.mockResolvedValue({ id: 1, userId: 1 });

            await useCase.execute(createDtoWithoutAboutMe);

            expect(mockAboutMeRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUser.id,
                    occupation: undefined,
                    description: undefined,
                }),
            );
        });
    });
});

