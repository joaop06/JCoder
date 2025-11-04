import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

@Injectable()
export class GetUserProfileImageUseCase {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(userId: number): Promise<string> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UserNotFoundException();
        }

        if (!user.profileImage) {
            throw new Error('User has no profile image');
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.User,
            userId,
            user.profileImage,
            undefined,
            user.username,
        );
    }
}

