import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

@Injectable()
export class DeleteUserProfileImageUseCase {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UserNotFoundException();
        }

        if (!user.profileImage) {
            return user;
        }

        // Delete the profile image file with username segmentation
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            userId,
            user.profileImage,
            undefined,
            user.username,
        );

        // Remove profile image from user
        user.profileImage = null;
        return await this.userRepository.save(user);
    }
}

