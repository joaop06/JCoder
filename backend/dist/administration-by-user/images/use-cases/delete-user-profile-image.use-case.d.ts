import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ImageStorageService } from '../services/image-storage.service';
export declare class DeleteUserProfileImageUseCase {
    private readonly userRepository;
    private readonly imageStorageService;
    constructor(userRepository: Repository<User>, imageStorageService: ImageStorageService);
    execute(userId: number): Promise<User>;
}
