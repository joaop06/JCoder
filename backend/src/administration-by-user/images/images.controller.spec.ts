import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';

// Mock das entidades para evitar dependências circulares
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../applications/entities/application.entity', () => ({
    Application: class Application {},
}));

jest.mock('../technologies/entities/technology.entity', () => ({
    Technology: class Technology {},
}));

// Mock de todos os use-cases antes de importar
const mockUseCase = {
    execute: jest.fn(),
};

jest.mock('./use-cases/get-image.use-case', () => ({
    GetImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/delete-image.use-case', () => ({
    DeleteImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/upload-images.use-case', () => ({
    UploadImagesUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/get-profile-image.use-case', () => ({
    GetProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/delete-profile-image.use-case', () => ({
    DeleteProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/update-profile-image.use-case', () => ({
    UpdateProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/upload-profile-image.use-case', () => ({
    UploadProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/get-technology-profile-image.use-case', () => ({
    GetTechnologyProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/upload-technology-profile-image.use-case', () => ({
    UploadTechnologyProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/delete-technology-profile-image.use-case', () => ({
    DeleteTechnologyProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/get-user-profile-image.use-case', () => ({
    GetUserProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/delete-user-profile-image.use-case', () => ({
    DeleteUserProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/upload-user-profile-image.use-case', () => ({
    UploadUserProfileImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/get-certificate-image.use-case', () => ({
    GetCertificateImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/delete-certificate-image.use-case', () => ({
    DeleteCertificateImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

jest.mock('./use-cases/upload-certificate-image.use-case', () => ({
    UploadCertificateImageUseCase: jest.fn().mockImplementation(() => mockUseCase),
}));

import { GetImageUseCase } from './use-cases/get-image.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';
import { GetTechnologyProfileImageUseCase } from './use-cases/get-technology-profile-image.use-case';
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';
import { GetUserProfileImageUseCase } from './use-cases/get-user-profile-image.use-case';
import { DeleteUserProfileImageUseCase } from './use-cases/delete-user-profile-image.use-case';
import { UploadUserProfileImageUseCase } from './use-cases/upload-user-profile-image.use-case';
import { GetCertificateImageUseCase } from './use-cases/get-certificate-image.use-case';
import { DeleteCertificateImageUseCase } from './use-cases/delete-certificate-image.use-case';
import { UploadCertificateImageUseCase } from './use-cases/upload-certificate-image.use-case';

describe('ImagesController', () => {
    let controller: ImagesController;

    const mockGetImageUseCase = { execute: jest.fn() };
    const mockDeleteImageUseCase = { execute: jest.fn() };
    const mockUploadImagesUseCase = { execute: jest.fn() };
    const mockGetProfileImageUseCase = { execute: jest.fn() };
    const mockDeleteProfileImageUseCase = { execute: jest.fn() };
    const mockUpdateProfileImageUseCase = { execute: jest.fn() };
    const mockUploadProfileImageUseCase = { execute: jest.fn() };
    const mockGetTechnologyProfileImageUseCase = { execute: jest.fn() };
    const mockUploadTechnologyProfileImageUseCase = { execute: jest.fn() };
    const mockDeleteTechnologyProfileImageUseCase = { execute: jest.fn() };
    const mockGetUserProfileImageUseCase = { execute: jest.fn() };
    const mockDeleteUserProfileImageUseCase = { execute: jest.fn() };
    const mockUploadUserProfileImageUseCase = { execute: jest.fn() };
    const mockGetCertificateImageUseCase = { execute: jest.fn() };
    const mockDeleteCertificateImageUseCase = { execute: jest.fn() };
    const mockUploadCertificateImageUseCase = { execute: jest.fn() };

    const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImagesController],
            providers: [
                { provide: GetImageUseCase, useValue: mockGetImageUseCase },
                { provide: DeleteImageUseCase, useValue: mockDeleteImageUseCase },
                { provide: UploadImagesUseCase, useValue: mockUploadImagesUseCase },
                { provide: GetProfileImageUseCase, useValue: mockGetProfileImageUseCase },
                { provide: DeleteProfileImageUseCase, useValue: mockDeleteProfileImageUseCase },
                { provide: UpdateProfileImageUseCase, useValue: mockUpdateProfileImageUseCase },
                { provide: UploadProfileImageUseCase, useValue: mockUploadProfileImageUseCase },
                { provide: GetTechnologyProfileImageUseCase, useValue: mockGetTechnologyProfileImageUseCase },
                { provide: UploadTechnologyProfileImageUseCase, useValue: mockUploadTechnologyProfileImageUseCase },
                { provide: DeleteTechnologyProfileImageUseCase, useValue: mockDeleteTechnologyProfileImageUseCase },
                { provide: GetUserProfileImageUseCase, useValue: mockGetUserProfileImageUseCase },
                { provide: DeleteUserProfileImageUseCase, useValue: mockDeleteUserProfileImageUseCase },
                { provide: UploadUserProfileImageUseCase, useValue: mockUploadUserProfileImageUseCase },
                { provide: GetCertificateImageUseCase, useValue: mockGetCertificateImageUseCase },
                { provide: DeleteCertificateImageUseCase, useValue: mockDeleteCertificateImageUseCase },
                { provide: UploadCertificateImageUseCase, useValue: mockUploadCertificateImageUseCase },
            ],
        }).compile();

        controller = module.get<ImagesController>(ImagesController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Application endpoints', () => {
        it('deve fazer upload de imagem de perfil de aplicação', async () => {
            const id = 1;
            const files = [mockFile];
            const mockApplication = { id, name: 'Test App' };

            mockUploadProfileImageUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.uploadApplicationProfileImage(id, files);

            expect(result).toEqual(mockApplication);
            expect(mockUploadProfileImageUseCase.execute).toHaveBeenCalledWith(id, mockFile);
        });

        it('deve atualizar imagem de perfil de aplicação', async () => {
            const id = 1;
            const files = [mockFile];
            const mockApplication = { id, name: 'Test App' };

            mockUpdateProfileImageUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.updateApplicationProfileImage(id, files);

            expect(result).toEqual(mockApplication);
            expect(mockUpdateProfileImageUseCase.execute).toHaveBeenCalledWith(id, mockFile);
        });

        it('deve fazer upload de múltiplas imagens de aplicação', async () => {
            const id = 1;
            const files = [mockFile, mockFile];
            const mockApplication = { id, name: 'Test App' };

            mockUploadImagesUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.uploadApplicationImages(id, files);

            expect(result).toEqual(mockApplication);
            expect(mockUploadImagesUseCase.execute).toHaveBeenCalledWith(id, files);
        });

        it('deve deletar imagem de aplicação', async () => {
            const id = 1;
            const filename = 'image.jpg';

            mockDeleteImageUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteApplicationImage(id, filename);

            expect(mockDeleteImageUseCase.execute).toHaveBeenCalledWith(id, filename);
        });

        it('deve deletar imagem de perfil de aplicação', async () => {
            const id = 1;

            mockDeleteProfileImageUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteApplicationProfileImage(id);

            expect(mockDeleteProfileImageUseCase.execute).toHaveBeenCalledWith(id);
        });
    });

    describe('Technology endpoints', () => {
        it('deve fazer upload de imagem de perfil de tecnologia', async () => {
            const id = 1;
            const files = [mockFile];
            const mockTechnology = { id, name: 'Test Tech' };

            mockUploadTechnologyProfileImageUseCase.execute.mockResolvedValue(mockTechnology);

            const result = await controller.uploadTechnologyProfileImage(id, files);

            expect(result).toEqual(mockTechnology);
            expect(mockUploadTechnologyProfileImageUseCase.execute).toHaveBeenCalledWith(id, mockFile);
        });

        it('deve deletar imagem de perfil de tecnologia', async () => {
            const id = 1;

            mockDeleteTechnologyProfileImageUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteTechnologyProfileImage(id);

            expect(mockDeleteTechnologyProfileImageUseCase.execute).toHaveBeenCalledWith(id);
        });
    });

    describe('User endpoints', () => {
        it('deve fazer upload de imagem de perfil de usuário', async () => {
            const id = 1;
            const files = [mockFile];
            const mockUser = { id, username: 'testuser' };

            mockUploadUserProfileImageUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.uploadUserProfileImage(id, files);

            expect(result).toEqual(mockUser);
            expect(mockUploadUserProfileImageUseCase.execute).toHaveBeenCalledWith(id, mockFile);
        });

        it('deve deletar imagem de perfil de usuário', async () => {
            const id = 1;

            mockDeleteUserProfileImageUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteUserProfileImage(id);

            expect(mockDeleteUserProfileImageUseCase.execute).toHaveBeenCalledWith(id);
        });
    });

    describe('Certificate endpoints', () => {
        it('deve fazer upload de imagem de certificado', async () => {
            const username = 'testuser';
            const certificateId = 1;
            const files = [mockFile];
            const mockCertificate = { id: certificateId };

            mockUploadCertificateImageUseCase.execute.mockResolvedValue(mockCertificate);

            const result = await controller.uploadCertificateImage(username, certificateId, files);

            expect(result).toEqual(mockCertificate);
            expect(mockUploadCertificateImageUseCase.execute).toHaveBeenCalledWith(
                username,
                certificateId,
                mockFile,
            );
        });

        it('deve deletar imagem de certificado', async () => {
            const username = 'testuser';
            const certificateId = 1;

            mockDeleteCertificateImageUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteCertificateImage(username, certificateId);

            expect(mockDeleteCertificateImageUseCase.execute).toHaveBeenCalledWith(username, certificateId);
        });
    });

    describe('Error handling', () => {
        it('deve lançar erro quando nenhum arquivo é enviado no upload de perfil', async () => {
            const id = 1;
            const files: Express.Multer.File[] = [];

            await expect(controller.uploadApplicationProfileImage(id, files)).rejects.toThrow(
                'No file uploaded',
            );
        });

        it('deve lançar erro quando nenhum arquivo é enviado no update de perfil', async () => {
            const id = 1;
            const files: Express.Multer.File[] = [];

            await expect(controller.updateApplicationProfileImage(id, files)).rejects.toThrow(
                'No file uploaded',
            );
        });
    });
});




