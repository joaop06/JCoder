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

    async findById(id: number, includeComponents: boolean = false): Promise<User> {
        const user = await this.repository.findOne({
            where: { id },
            relations: includeComponents ? {
                userComponentAboutMe: {
                    highlights: true,
                },
                userComponentEducation: {
                    certificates: true,
                },
                userComponentExperience: {
                    positions: true,
                },
                userComponentCertificate: {
                    educations: true,
                },
            } : {},
        });
        if (!user) throw new UserNotFoundException();

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.repository.findOneBy({ email });
        if (!user) throw new UserNotFoundException();

        return user;
    }

    async findByUsername(username: string): Promise<User> {
        const user = await this.repository.findOneBy({ username });
        if (!user) throw new UserNotFoundException();

        return user;
    }

    async usernameExists(username: string): Promise<boolean> {
        const user = await this.repository.findOneBy({ username });
        return !!user;
    }

    async emailExists(email: string): Promise<boolean> {
        const user = await this.repository.findOneBy({ email });
        return !!user;
    }

    async update(user: User): Promise<User> {
        return await this.repository.save(user);
    }
};
