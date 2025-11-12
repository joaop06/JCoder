import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

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

