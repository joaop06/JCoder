import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { EmailAlreadyExistsException } from "../exceptions/email-already-exists.exception";
import { UsernameAlreadyExistsException } from "../exceptions/username-already-exists.exception";
import { InvalidCurrentPasswordException } from "../exceptions/invalid-current-password.exception";

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async execute(username: string, updateProfileDto: UpdateProfileDto): Promise<User> {
        const user = await this.usersService.findOneBy({ username });

        // Check if trying to change password
        if (updateProfileDto.newPassword) {
            if (!updateProfileDto.currentPassword) {
                throw new InvalidCurrentPasswordException();
            }

            const isValidPassword = await bcrypt.compare(updateProfileDto.currentPassword, user.password);
            if (!isValidPassword) {
                throw new InvalidCurrentPasswordException();
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(updateProfileDto.newPassword, 10);
            user.password = hashedPassword;
        }

        // Check if username is being changed and if it's already in use
        if (updateProfileDto.username && updateProfileDto.username !== user.username) {
            const usernameExists = await this.usersService.existsBy({ username: updateProfileDto.username });
            if (usernameExists) {
                throw new UsernameAlreadyExistsException();
            }
            user.username = updateProfileDto.username;
        }

        // Check if email is being changed and if it's already in use
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const emailExists = await this.usersService.existsBy({ email: updateProfileDto.email });
            if (emailExists) {
                throw new EmailAlreadyExistsException();
            }
            user.email = updateProfileDto.email;
        }

        // Update other fields
        if (updateProfileDto.firstName !== undefined) {
            user.firstName = updateProfileDto.firstName;
        }

        if (updateProfileDto.fullName !== undefined) {
            user.fullName = updateProfileDto.fullName;
        }

        if (updateProfileDto.githubUrl !== undefined) {
            user.githubUrl = updateProfileDto.githubUrl;
        }

        if (updateProfileDto.linkedinUrl !== undefined) {
            user.linkedinUrl = updateProfileDto.linkedinUrl;
        }

        if (updateProfileDto.profileImage !== undefined) {
            user.profileImage = updateProfileDto.profileImage;
        }

        return await this.usersService.update(user);
    }
};
