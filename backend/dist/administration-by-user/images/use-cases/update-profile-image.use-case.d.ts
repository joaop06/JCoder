import { Application } from '../../applications/entities/application.entity';
import { UploadProfileImageUseCase } from './upload-profile-image.use-case';
export declare class UpdateProfileImageUseCase {
    private readonly uploadProfileImageUseCase;
    constructor(uploadProfileImageUseCase: UploadProfileImageUseCase);
    execute(id: number, file: Express.Multer.File): Promise<Application>;
}
