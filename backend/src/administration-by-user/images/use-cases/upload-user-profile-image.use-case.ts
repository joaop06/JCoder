import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class UploadUserProfileImageUseCase {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(userId: number, file: Express.Multer.File): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UserNotFoundException();
        }

        // Delete existing profile image if it exists
        if (user.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.User,
                userId,
                user.profileImage,
                undefined,
                user.username,
            );
        }

        // Upload new profile image with username segmentation
        const profileImageFilename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.User,
            userId,
            ImageType.Profile,
            undefined,
            user.username,
        );

        // Update user with new profile image
        user.profileImage = profileImageFilename;
        return await this.userRepository.save(user);
    }
}

