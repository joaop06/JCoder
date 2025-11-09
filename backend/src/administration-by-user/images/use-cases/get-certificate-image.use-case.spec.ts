import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { GetCertificateImageUseCase } from './get-certificate-image.use-case';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';

describe('GetCertificateImageUseCase', () => {
    let useCase: GetCertificateImageUseCase;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let certificateRepository: jest.Mocked<Repository<UserComponentCertificate>>;

    const mockCertificate1: Partial<UserComponentCertificate> = {
        id: 1,
        userId: 1,
        certificateName: 'AWS Certified Solutions Architect',
        profileImage: 'certificate-1.jpg',
    };

    const mockCertificate2: Partial<UserComponentCertificate> = {
        id: 2,
        userId: 2,
        certificateName: 'Google Cloud Professional',
        profileImage: 'certificate-2.jpg',
    };

    beforeEach(async () => {
        const mockCertificateRepository = {
            findOne: jest.fn(),
        };

        const mockImageStorageService = {
            getImagePath: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetCertificateImageUseCase,
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

        useCase = module.get<GetCertificateImageUseCase>(GetCertificateImageUseCase);
        certificateRepository = module.get(getRepositoryToken(UserComponentCertificate));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar o caminho da imagem de certificado com sucesso', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 1;
            const expectedImagePath = '/path/to/user1/users/1/certificates/certificate-1.jpg';

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(username, certificateId);

            // Assert
            expect(certificateRepository.findOne).toHaveBeenCalledWith({
                where: { id: certificateId, username },
            });
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.User,
                certificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            expect(result).toBe(expectedImagePath);
        });

        it('deve lançar erro quando o certificado não tem imagem', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 1;
            const certificateWithoutImage = {
                ...mockCertificate1,
                profileImage: null as any,
            };

            certificateRepository.findOne.mockResolvedValue(
                certificateWithoutImage as UserComponentCertificate,
            );

            // Act & Assert
            await expect(useCase.execute(username, certificateId)).rejects.toThrow(
                'Certificate has no profile image',
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('deve lançar ComponentNotFoundException quando o certificado não existe', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 999;

            certificateRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(username, certificateId)).rejects.toThrow(
                ComponentNotFoundException,
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('deve lançar ComponentNotFoundException quando o certificado pertence a outro usuário', async () => {
            // Arrange
            const username = 'user2'; // Tentando acessar certificado do user1
            const certificateId = 1;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );

            // Act & Assert
            await expect(useCase.execute(username, certificateId)).rejects.toThrow(
                ComponentNotFoundException,
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários buscando imagens', async () => {
            // Arrange
            const user1Username = 'user1';
            const user2Username = 'user2';
            const user1CertificateId = 1;
            const user2CertificateId = 2;
            const user1ImagePath = '/path/to/user1/users/1/certificates/certificate-1.jpg';
            const user2ImagePath = '/path/to/user2/users/2/certificates/certificate-2.jpg';

            certificateRepository.findOne
                .mockResolvedValueOnce(mockCertificate1 as UserComponentCertificate)
                .mockResolvedValueOnce(mockCertificate2 as UserComponentCertificate);

            imageStorageService.getImagePath
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1Username, user1CertificateId);
            const result2 = await useCase.execute(user2Username, user2CertificateId);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                1,
                ResourceType.User,
                user1CertificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                2,
                ResourceType.User,
                user2CertificateId,
                'certificate-2.jpg',
                'certificates',
                'user2',
            );
            expect(result1).toBe(user1ImagePath);
            expect(result2).toBe(user2ImagePath);
            expect(result1).not.toBe(result2);
        });

        it('deve garantir que usuário não pode acessar certificado de outro usuário', async () => {
            // Arrange
            const user1Username = 'user1';
            const user1CertificateId = 1;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );
            imageStorageService.getImagePath.mockResolvedValue(
                '/path/to/user1/users/1/certificates/certificate-1.jpg',
            );

            // Act
            const result = await useCase.execute(user1Username, user1CertificateId);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.User,
                user1CertificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            // Verifica que não foi chamado com os dados do user2
            expect(imageStorageService.getImagePath).not.toHaveBeenCalledWith(
                ResourceType.User,
                2,
                expect.any(String),
                'certificates',
                'user2',
            );
            expect(result).toContain('user1');
            expect(result).not.toContain('user2');
        });
    });
});

