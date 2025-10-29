import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import { UserImageService } from '../services/user-image.service';

@Injectable()
export class UploadUserProfileImageUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userImageService: UserImageService,
    ) { }

    async execute(userId: number, file: Express.Multer.File): Promise<User> {
        const user = await this.usersService.findById(userId);

        // Delete existing profile image if it exists
        if (user.profileImage) {
            await this.userImageService.deleteImage(userId, user.profileImage);
        }

        // Upload new profile image
        const profileImageFilename = await this.userImageService.uploadProfileImage(file, userId);

        // Update user with new profile image
        user.profileImage = profileImageFilename;
        return await this.usersService.update(user);
    }
};
