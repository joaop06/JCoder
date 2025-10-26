import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { InvalidCurrentPasswordException } from "../exceptions/invalid-current-password.exception";
import { EmailAlreadyExistsException } from "../exceptions/email-already-exists.exception";

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async execute(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
        const user = await this.usersService.findById(userId);

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

        // Check if email is being changed and if it's already in use
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const emailExists = await this.usersService.emailExists(updateProfileDto.email);
            if (emailExists) {
                throw new EmailAlreadyExistsException();
            }
            user.email = updateProfileDto.email;
        }

        // Update other fields
        if (updateProfileDto.name !== undefined) {
            user.name = updateProfileDto.name;
        }

        return await this.usersService.update(user);
    }
};

