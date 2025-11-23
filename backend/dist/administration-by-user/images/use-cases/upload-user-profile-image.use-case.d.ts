import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ImageStorageService } from '../services/image-storage.service';
export declare class UploadUserProfileImageUseCase {
    private readonly userRepository;
    private readonly imageStorageService;
    constructor(userRepository: Repository<User>, imageStorageService: ImageStorageService);
    execute(userId: number, file: Express.Multer.File): Promise<User>;
}
