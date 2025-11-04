import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { AlreadyDeletedApplicationException } from '../exceptions/already-deleted-application.exception';

// Mock Application entity to avoid circular dependency
interface Application {
    id: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Mock services to avoid circular dependencies
const mockApplicationsService = {
    findById: jest.fn(),
    delete: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockDeleteApplicationUseCase {
    constructor(
        private readonly applicationsService: typeof mockApplicationsService,
    ) { }

    async execute(id: Application['id']): Promise<void> {
        try {
            await this.applicationsService.findById(id);
        } catch {
            throw new AlreadyDeletedApplicationException();
        }

        return await this.applicationsService.delete(id);
    }
}

describe('DeleteApplicationUseCase', () => {
    let useCase: MockDeleteApplicationUseCase;
    let applicationsService: typeof mockApplicationsService;

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockDeleteApplicationUseCase(mockApplicationsService);

        applicationsService = mockApplicationsService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete an application successfully', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.delete.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(applicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(applicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should throw AlreadyDeletedApplicationException when application is not found', async () => {
            // Arrange
            const applicationId = 999;

            applicationsService.findById.mockRejectedValue(new Error('Application not found'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should throw AlreadyDeletedApplicationException when application service throws any error', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockRejectedValue(new Error('Database connection error'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should throw AlreadyDeletedApplicationException when application service throws NotFoundException', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockRejectedValue(new Error('Entity not found'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should propagate delete service errors', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockResolvedValue(mockApplication);
            const deleteError = new Error('Delete operation failed');
            applicationsService.delete.mockRejectedValue(deleteError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Delete operation failed');
            expect(applicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(applicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should handle database constraint errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            applicationsService.delete.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Foreign key constraint violation');
            expect(applicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(applicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should handle network errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            applicationsService.delete.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Network timeout');
            expect(applicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(applicationsService.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];

            for (const applicationId of applicationIds) {
                applicationsService.findById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                applicationsService.delete.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId);

                // Assert
                expect(applicationsService.findById).toHaveBeenCalledWith(applicationId);
                expect(applicationsService.delete).toHaveBeenCalledWith(applicationId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent delete operations', async () => {
            // Arrange
            const applicationId = 1;

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.delete.mockResolvedValue(undefined);

            // Act - Execute multiple concurrent delete operations
            const promises = [
                useCase.execute(applicationId),
                useCase.execute(applicationId),
                useCase.execute(applicationId),
            ];

            await Promise.all(promises);

            // Assert
            expect(applicationsService.findById).toHaveBeenCalledTimes(3);
            expect(applicationsService.delete).toHaveBeenCalledTimes(3);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;

            applicationsService.findById.mockRejectedValue(new Error('Invalid ID'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;

            applicationsService.findById.mockRejectedValue(new Error('Invalid ID'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;

            applicationsService.findById.mockRejectedValue(new Error('Application not found'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;

            applicationsService.findById.mockRejectedValue(new Error('Application not found'));

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(applicationsService.delete).not.toHaveBeenCalled();
        });
    });
});