import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";

@Injectable()
export class GetProfileUseCase {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async execute(userId: number, includeComponents: boolean = true): Promise<User> {
        return await this.usersService.findById(userId, includeComponents);
    }
};
