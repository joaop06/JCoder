import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { DeleteCertificateImageUseCase } from './delete-certificate-image.use-case';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';

describe('DeleteCertificateImageUseCase', () => {
    let useCase: DeleteCertificateImageUseCase;
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
        userId: 12,
        certificateName: 'Google Cloud Professional',
        profileImage: 'certificate-2.jpg',
    };

    const mockCertificate3: Partial<UserComponentCertificate> = {
        id: 3,
        userId: 123,
        certificateName: 'Microsoft Azure',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockCertificateRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteCertificateImageUseCase,
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

        useCase = module.get<DeleteCertificateImageUseCase>(DeleteCertificateImageUseCase);
        certificateRepository = module.get(getRepositoryToken(UserComponentCertificate));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete certificate image successfully', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 1;
            const updatedCertificate = {
                ...mockCertificate1,
                profileImage: null as any,
            };

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );
            imageStorageService.deleteImage.mockResolvedValue();
            certificateRepository.save.mockResolvedValue(
                updatedCertificate as UserComponentCertificate,
            );

            // Act
            const result = await useCase.execute(username, certificateId);

            // Assert
            expect(certificateRepository.findOne).toHaveBeenCalledWith({
                where: { id: certificateId, username },
            });
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                certificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            expect(certificateRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImage: null,
                }),
            );
            expect(result.profileImage).toBeNull();
        });

        it('should return certificate without changes when has no image', async () => {
            // Arrange
            const username = 'user3';
            const certificateId = 3;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate3 as UserComponentCertificate,
            );

            // Act
            const result = await useCase.execute(username, certificateId);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(certificateRepository.save).not.toHaveBeenCalled();
            expect(result).toEqual(mockCertificate3);
        });

        it('should throw ComponentNotFoundException when certificate does not exist', async () => {
            // Arrange
            const username = 'user1';
            const certificateId = 999;

            certificateRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(username, certificateId)).rejects.toThrow(
                ComponentNotFoundException,
            );
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('should throw ComponentNotFoundException when certificate belongs to another user', async () => {
            // Arrange
            const username = 'user2'; // Trying to access user1's certificate
            const certificateId = 1;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );

            // Act & Assert
            await expect(useCase.execute(username, certificateId)).rejects.toThrow(
                ComponentNotFoundException,
            );
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('should ensure user segmentation - multiple users deleting images simultaneously', async () => {
            // Arrange
            const user1Username = 'user1';
            const user2Username = 'user2';
            const user1CertificateId = 1;
            const user2CertificateId = 2;

            certificateRepository.findOne
                .mockResolvedValueOnce(mockCertificate1 as UserComponentCertificate)
                .mockResolvedValueOnce(mockCertificate2 as UserComponentCertificate);

            imageStorageService.deleteImage.mockResolvedValue();
            certificateRepository.save
                .mockResolvedValueOnce({
                    ...mockCertificate1,
                    profileImage: null,
                } as UserComponentCertificate)
                .mockResolvedValueOnce({
                    ...mockCertificate2,
                    profileImage: null,
                } as UserComponentCertificate);

            // Act
            await useCase.execute(user1Username, user1CertificateId);
            await useCase.execute(user2Username, user2CertificateId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                1,
                ResourceType.User,
                user1CertificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                2,
                ResourceType.User,
                user2CertificateId,
                'certificate-2.jpg',
                'certificates',
                'user2',
            );
        });

        it('should ensure that only the correct user\'s image is deleted', async () => {
            // Arrange
            const user1Username = 'user1';
            const user1CertificateId = 1;

            certificateRepository.findOne.mockResolvedValue(
                mockCertificate1 as UserComponentCertificate,
            );
            imageStorageService.deleteImage.mockResolvedValue();
            certificateRepository.save.mockResolvedValue({
                ...mockCertificate1,
                profileImage: null,
            } as UserComponentCertificate);

            // Act
            await useCase.execute(user1Username, user1CertificateId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                user1CertificateId,
                'certificate-1.jpg',
                'certificates',
                'user1',
            );
            // Verify that it was not called with user2's data
            expect(imageStorageService.deleteImage).not.toHaveBeenCalledWith(
                ResourceType.User,
                2,
                expect.any(String),
                'certificates',
                'user2',
            );
        });
    });
});

