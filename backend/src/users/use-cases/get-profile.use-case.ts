import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";

@Injectable()
export class GetProfileUseCase {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async execute(userId: number): Promise<User> {
        return await this.usersService.findById(userId);
    }
};

