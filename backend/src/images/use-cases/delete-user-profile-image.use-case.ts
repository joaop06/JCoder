import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

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

        // Delete the profile image file
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            userId,
            user.profileImage,
        );

        // Remove profile image from user
        user.profileImage = null;
        return await this.userRepository.save(user);
    }
}

