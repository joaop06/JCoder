import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserNotFoundException } from "./exceptions/user-not-found.exception";
import { RoleEnum } from "src/@common/enums/role.enum";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async findById(id: number, includeComponents: boolean = false): Promise<User> {
        const queryBuilder = this.repository.createQueryBuilder('user')
            .where('user.id = :id', { id });

        if (includeComponents) {
            queryBuilder
                .leftJoinAndSelect('user.userComponentAboutMe', 'aboutMe')
                .leftJoinAndSelect('aboutMe.highlights', 'highlights')
                .leftJoinAndSelect('user.userComponentEducation', 'education')
                .leftJoinAndSelect('education.certificates', 'certificates')
                .leftJoinAndSelect('user.userComponentExperience', 'experience')
                .leftJoinAndSelect('experience.positions', 'positions')
                .leftJoinAndSelect('user.userComponentCertificate', 'certificate')
                .leftJoinAndSelect('certificate.educations', 'certificateEducations');
        }

        const user = await queryBuilder.getOne();
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

    async findBasicProfile(id: number): Promise<Partial<User>> {
        const user = await this.repository.findOne({
            where: { id },
            select: ['id', 'username', 'firstName', 'fullName', 'email', 'githubUrl', 'linkedinUrl', 'role', 'createdAt', 'updatedAt']
        });
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async findProfileWithAboutMe(id: number): Promise<Partial<User>> {
        const user = await this.repository.findOne({
            where: { id },
            select: ['id', 'username', 'firstName', 'fullName', 'email', 'githubUrl', 'linkedinUrl', 'role', 'createdAt', 'updatedAt'],
            relations: {
                userComponentAboutMe: {
                    highlights: true
                }
            }
        });
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async findAdminUserId(): Promise<number | null> {
        const admin = await this.repository.findOne({
            where: { role: RoleEnum.Admin },
            select: ['id'],
        });
        return admin?.id || null;
    }
};
