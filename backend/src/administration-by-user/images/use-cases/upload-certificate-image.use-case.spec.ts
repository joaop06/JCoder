import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { UploadCertificateImageUseCase } from './upload-certificate-image.use-case';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';

describe('UploadCertificateImageUseCase', () => {
    let useCase: UploadCertificateImageUseCase;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let certificateRepository: jest.Mocked<Repository<UserComponentCertificate>>;

    const mockFile: Express.Multer.File = {
        fieldname: 'profileImage',
        originalname: 'certificate.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    const mockCertificate1: Partial<UserComponentCertificate> = {
        id: 1,
        userId: 1,
        certificateName: 'AWS Certified Solutions Architect',
        profileImage: 'old-certificate.jpg',
    };

    const mockCertificate2: Partial<UserComponentCertificate> = {
        id: 2,
        userId: 2,
        certificateName: 'Google Cloud Professional',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockCertificateRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadCertificateImageUseCase,
                {
                    provide: getRepositoryToken(UserComponentCertificate),
                    useValue: mockCertificateRepository,
                },
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
            ],
        }).compile();

        useCase = module.get<UploadCertificateImageUseCase>(UploadCertificateImageUseCase);
        certificateRepository = module.get(getRepositoryToken(UserComponentCertificate));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve fazer upload de imagem de certificado com sucesso quando não existe imagem anterior', async () => {
            // Arrange
            const username = 'user2';
            const certificateId = 2;
            const newFilename = 'new-certificate.jpg';
            const updatedCertificate = {
                ...mockCertificate2,
                profileImage: newFilename,
            };

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate2 as UserComponentCertificate,
            );
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            certificateRepository.save.mockResolvedValue(
                updatedCertificate as UserComponentCertificate,
            );

            // Act
            const result = await useCase.execute(username, certificateId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                certificateId,
                ImageType.Component,
                'certificates',
                'user2',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve deletar imagem anterior antes de fazer upload de nova imagem', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 1;
            const newFilename = 'new-certificate.jpg';
            const updatedCertificate = {
                ...mockCertificate1,
                profileImage: newFilename,
            };

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );
            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            certificateRepository.save.mockResolvedValue(
                updatedCertificate as UserComponentCertificate,
            );

            // Act
            const result = await useCase.execute(username, certificateId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                certificateId,
                'old-certificate.jpg',
                'certificates',
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                certificateId,
                ImageType.Component,
                'certificates',
                'user1',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve lançar ComponentNotFoundException quando o certificado não existe', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 999;

            certificateRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                useCase.execute(username, certificateId, mockFile),
            ).rejects.toThrow(ComponentNotFoundException);
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deve lançar ComponentNotFoundException quando o certificado pertence a outro usuário', async () => {
            // Arrange
            const username = 'user2'; // Tentando acessar certificado do user1
            const certificateId = 1;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );

            // Act & Assert
            await expect(
                useCase.execute(username, certificateId, mockFile),
            ).rejects.toThrow(ComponentNotFoundException);
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários fazendo upload simultaneamente', async () => {
            // Arrange
            const user1Username = 'user1';
            const user2Username = 'user2';
            const user1CertificateId = 1;
            const user2CertificateId = 2;
            const user1NewFilename = 'user1-certificate.jpg';
            const user2NewFilename = 'user2-certificate.jpg';

            certificateRepository.findOne
                .mockResolvedValueOnce(mockCertificate1 as UserComponentCertificate)
                .mockResolvedValueOnce(mockCertificate2 as UserComponentCertificate);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            certificateRepository.save
                .mockResolvedValueOnce({
                    ...mockCertificate1,
                    profileImage: user1NewFilename,
                } as UserComponentCertificate)
                .mockResolvedValueOnce({
                    ...mockCertificate2,
                    profileImage: user2NewFilename,
                } as UserComponentCertificate);

            // Act
            const result1 = await useCase.execute(
                user1Username,
                user1CertificateId,
                mockFile,
            );
            const result2 = await useCase.execute(
                user2Username,
                user2CertificateId,
                mockFile,
            );

            // Assert
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                1,
                mockFile,
                ResourceType.User,
                user1CertificateId,
                ImageType.Component,
                'certificates',
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                2,
                mockFile,
                ResourceType.User,
                user2CertificateId,
                ImageType.Component,
                'certificates',
                'user2',
            );
            expect(result1.profileImage).toBe(user1NewFilename);
            expect(result2.profileImage).toBe(user2NewFilename);
        });

        it('deve garantir que imagens de diferentes usuários são armazenadas em diretórios separados', async () => {
            // Arrange
            const user1Username = 'user1';
            const user2Username = 'user2';
            const user1CertificateId = 1;
            const user2CertificateId = 2;
            const user1NewFilename = 'user1-certificate.jpg';
            const user2NewFilename = 'user2-certificate.jpg';

            certificateRepository.findOne
                .mockResolvedValueOnce(mockCertificate1 as UserComponentCertificate)
                .mockResolvedValueOnce(mockCertificate2 as UserComponentCertificate);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            certificateRepository.save
                .mockResolvedValueOnce({
                    ...mockCertificate1,
                    profileImage: user1NewFilename,
                } as UserComponentCertificate)
                .mockResolvedValueOnce({
                    ...mockCertificate2,
                    profileImage: user2NewFilename,
                } as UserComponentCertificate);

            // Act
            await useCase.execute(user1Username, user1CertificateId, mockFile);
            await useCase.execute(user2Username, user2CertificateId, mockFile);

            // Assert - Verifica que o username foi passado corretamente para cada usuário
            const user1Call = imageStorageService.uploadImage.mock.calls[0];
            const user2Call = imageStorageService.uploadImage.mock.calls[1];

            expect(user1Call[4]).toBe('user1'); // username parameter
            expect(user2Call[4]).toBe('user2'); // username parameter
            expect(user1Call[4]).not.toBe(user2Call[4]);
        });
    });
});

