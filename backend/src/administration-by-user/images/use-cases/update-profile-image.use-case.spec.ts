import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileImageUseCase } from './update-profile-image.use-case';
import { UploadProfileImageUseCase } from './upload-profile-image.use-case';
import { Application } from '../../applications/entities/application.entity';

describe('UpdateProfileImageUseCase', () => {
    let useCase: UpdateProfileImageUseCase;
    let uploadProfileImageUseCase: jest.Mocked<UploadProfileImageUseCase>;

    const mockFile: Express.Multer.File = {
        fieldname: 'profileImage',
        originalname: 'profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    const mockApplication: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        profileImage: 'updated-profile.jpg',
    };

    beforeEach(async () => {
        const mockUploadProfileImageUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateProfileImageUseCase,
                {
                    provide: UploadProfileImageUseCase,
                    useValue: mockUploadProfileImageUseCase,
                },
            ],
        }).compile();

        useCase = module.get<UpdateProfileImageUseCase>(UpdateProfileImageUseCase);
        uploadProfileImageUseCase = module.get(UploadProfileImageUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve chamar uploadProfileImageUseCase.execute com os parâmetros corretos', async () => {
            // Arrange
            const applicationId = 1;

            uploadProfileImageUseCase.execute.mockResolvedValue(mockApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(uploadProfileImageUseCase.execute).toHaveBeenCalledWith(
                applicationId,
                mockFile,
            );
            expect(result).toEqual(mockApplication);
        });

        it('deve propagar erros do uploadProfileImageUseCase', async () => {
            // Arrange
            const applicationId = 1;
            const error = new Error('Upload failed');

            uploadProfileImageUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(
                'Upload failed',
            );
        });

        it('deve garantir que update é essencialmente o mesmo que upload', async () => {
            // Arrange
            const applicationId = 1;

            uploadProfileImageUseCase.execute.mockResolvedValue(mockApplication as Application);

            // Act
            await useCase.execute(applicationId, mockFile);

            // Assert
            expect(uploadProfileImageUseCase.execute).toHaveBeenCalledTimes(1);
            expect(uploadProfileImageUseCase.execute).toHaveBeenCalledWith(
                applicationId,
                mockFile,
            );
        });
    });
});

