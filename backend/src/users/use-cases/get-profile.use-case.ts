import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";

@Injectable()
export class GetProfileUseCase {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async execute(username: string, includeComponents: boolean = true): Promise<User> {
        return await this.usersService.findByUsernameWithComponents(username, includeComponents);
    }
};
