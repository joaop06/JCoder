import { Test, TestingModule } from '@nestjs/testing';
import { DeleteApplicationUseCase } from './delete-application.use-case';
import { ApplicationsService } from '../applications.service';
import { Application } from '../entities/application.entity';
import { ApplicationNotFoundException } from '../exceptions/application-not-found.exception';
import { AlreadyDeletedApplicationException } from '../exceptions/already-deleted-application.exception';

describe('DeleteApplicationUseCase', () => {
    let useCase: DeleteApplicationUseCase;
    let applicationsService: ApplicationsService;

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: 'API' as any,
        userId: 1,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'admin' as any,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    };

    const mockApplicationsService = {
        findById: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteApplicationUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteApplicationUseCase>(DeleteApplicationUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should delete application successfully', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should delete application with images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithImages = {
                ...mockApplication,
                images: ['image1.jpg', 'image2.png', 'image3.webp'],
            };
            mockApplicationsService.findById.mockResolvedValue(applicationWithImages);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should delete application without images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImages = {
                ...mockApplication,
                images: [],
            };
            mockApplicationsService.findById.mockResolvedValue(applicationWithoutImages);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should delete application with null images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithNullImages = {
                ...mockApplication,
                images: null,
            };
            mockApplicationsService.findById.mockResolvedValue(applicationWithNullImages);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should throw AlreadyDeletedApplicationException when application is not found', async () => {
            // Arrange
            const applicationId = 999;
            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should throw AlreadyDeletedApplicationException when application is soft deleted', async () => {
            // Arrange
            const applicationId = 1;
            const softDeletedApplication = {
                ...mockApplication,
                deletedAt: new Date(),
            };
            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle database errors during application deletion', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Database error');
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should handle errors during application lookup', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockRejectedValue(new Error('Lookup error'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle any error during application lookup as AlreadyDeletedApplicationException', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockRejectedValue(new Error('Any error'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle network errors during application lookup', async () => {
            // Arrange
            const applicationId = 1;
            const networkError = new Error('Network timeout');
            mockApplicationsService.findById.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle permission errors during application lookup', async () => {
            // Arrange
            const applicationId = 1;
            const permissionError = new Error('Permission denied');
            mockApplicationsService.findById.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;
            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;
            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
        });

        it('should handle very large application ID', async () => {
            // Arrange
            const applicationId = Number.MAX_SAFE_INTEGER;
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should handle string application ID', async () => {
            // Arrange
            const applicationId = '1' as any;
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(applicationId);
        });
    });

    describe('Service Integration', () => {
        it('should call services in correct order', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(mockApplicationsService.findById).toHaveBeenCalledBefore(mockApplicationsService.delete as jest.Mock);
        });

        it('should not call delete service when findById fails', async () => {
            // Arrange
            const applicationId = 1;
            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
        });

        it('should propagate delete service errors', async () => {
            // Arrange
            const applicationId = 1;
            const deleteError = new Error('Delete failed');
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockRejectedValue(deleteError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Delete failed');
        });
    });
});
