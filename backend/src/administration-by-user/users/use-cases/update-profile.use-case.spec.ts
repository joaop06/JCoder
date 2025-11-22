import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UpdateProfileUseCase } from './update-profile.use-case';
import { UsersService } from '../users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { EmailAlreadyExistsException } from '../exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../exceptions/username-already-exists.exception';
import { InvalidCurrentPasswordException } from '../exceptions/invalid-current-password.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/user.entity', () => ({
    User: class User {},
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
        existsBy: jest.fn(),
        update: jest.fn(),
    })),
}));

describe('UpdateProfileUseCase', () => {
    let useCase: UpdateProfileUseCase;
    let usersService: UsersService;

    const mockUsersService = {
        findOneBy: jest.fn(),
        existsBy: jest.fn(),
        update: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        fullName: 'Test User',
        email: 'test@example.com',
        githubUrl: null,
        linkedinUrl: null,
        profileImage: null,
        phone: null,
        address: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateProfileUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve atualizar campos básicos do perfil', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                firstName: 'Updated',
                fullName: 'Updated User',
            };
            const updatedUser = { ...mockUser, ...updateDto };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockUsersService.update).toHaveBeenCalled();
        });

        it('deve atualizar senha quando fornecida corretamente', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                currentPassword: 'currentpass',
                newPassword: 'newpass',
            };
            const hashedNewPassword = 'hashednewpassword';
            const updatedUser = { ...mockUser, password: hashedNewPassword };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result).toEqual(updatedUser);
            expect(bcrypt.compare).toHaveBeenCalledWith(updateDto.currentPassword, mockUser.password);
            expect(bcrypt.hash).toHaveBeenCalledWith(updateDto.newPassword, 10);
        });

        it('deve lançar exceção quando senha atual não fornecida ao tentar alterar senha', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                newPassword: 'newpass',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);

            await expect(useCase.execute(username, updateDto)).rejects.toThrow(
                InvalidCurrentPasswordException,
            );

            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando senha atual está incorreta', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                currentPassword: 'wrongpass',
                newPassword: 'newpass',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(useCase.execute(username, updateDto)).rejects.toThrow(
                InvalidCurrentPasswordException,
            );

            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('deve atualizar username quando fornecido e disponível', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                username: 'newusername',
            };
            const updatedUser = { ...mockUser, username: 'newusername' };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.existsBy.mockResolvedValue(false);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUsersService.existsBy).toHaveBeenCalledWith({
                username: updateDto.username,
            });
        });

        it('deve lançar exceção quando username já existe', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                username: 'existinguser',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.existsBy.mockResolvedValue(true);

            await expect(useCase.execute(username, updateDto)).rejects.toThrow(
                UsernameAlreadyExistsException,
            );
        });

        it('não deve verificar username quando não está sendo alterado', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                username: 'testuser', // mesmo username
                firstName: 'Updated',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.update.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

            await useCase.execute(username, updateDto);

            expect(mockUsersService.existsBy).not.toHaveBeenCalled();
        });

        it('deve atualizar email quando fornecido e disponível', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                email: 'newemail@example.com',
            };
            const updatedUser = { ...mockUser, email: 'newemail@example.com' };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.existsBy.mockResolvedValue(false);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUsersService.existsBy).toHaveBeenCalledWith({
                email: updateDto.email,
            });
        });

        it('deve lançar exceção quando email já existe', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                email: 'existing@example.com',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.existsBy.mockResolvedValue(true);

            await expect(useCase.execute(username, updateDto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );
        });

        it('não deve verificar email quando não está sendo alterado', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                email: 'test@example.com', // mesmo email
                firstName: 'Updated',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.update.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

            await useCase.execute(username, updateDto);

            expect(mockUsersService.existsBy).not.toHaveBeenCalled();
        });

        it('deve atualizar todos os campos opcionais', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                firstName: 'New First',
                fullName: 'New Full',
                githubUrl: 'https://github.com/user',
                linkedinUrl: 'https://linkedin.com/in/user',
                profileImage: 'image.jpg',
                phone: '123456789',
                address: 'New Address',
            };
            const updatedUser = { ...mockUser, ...updateDto };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result).toEqual(updatedUser);
        });

        it('deve atualizar apenas campos definidos', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                firstName: 'Updated',
            };
            const updatedUser = { ...mockUser, firstName: 'Updated' };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(username, updateDto);

            expect(result.firstName).toBe('Updated');
            expect(result.fullName).toBe(mockUser.fullName);
        });
    });
});

