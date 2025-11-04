import { Injectable } from '@nestjs/common';
import { Application } from '../../applications/entities/application.entity';
import { UploadProfileImageUseCase } from './upload-profile-image.use-case';

/**
 * Update profile image is essentially the same as upload since it replaces the existing one
 */
@Injectable()
export class UpdateProfileImageUseCase {
    constructor(
        private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        return await this.uploadProfileImageUseCase.execute(id, file);
    }
}
