import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserNotFoundException } from "./exceptions/user-not-found.exception";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async findById(id: number): Promise<User> {
        const user = await this.repository.findOneBy({ id });
        if (!user) throw new UserNotFoundException();

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.repository.findOneBy({ email });
        if (!user) throw new UserNotFoundException();

        return user;
    }
};
