import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { UserNotFoundException } from "./exceptions/user-not-found.exception";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async existsBy(where: FindOptionsWhere<User>): Promise<boolean> {
        const user = await this.repository.findOneBy(where);
        return !!user;
    }

    async update(user: User): Promise<User> {
        return await this.repository.save(user);
    }

    async findOneBy(
        where: FindOptionsWhere<User>,
        includeComponents: boolean = false
    ): Promise<User> {
        // Se não precisa de relacionamentos, usar findOneBy do repository (mais eficiente)
        if (!includeComponents) {
            const user = await this.repository.findOneBy(where);
            if (!user) throw new UserNotFoundException();
            return user;
        }

        // Caso contrário, usar QueryBuilder para incluir relacionamentos
        const queryBuilder = this.repository.createQueryBuilder('user');

        // Construir condições WHERE dinamicamente
        const whereKeys = Object.keys(where) as Array<keyof FindOptionsWhere<User>>;
        whereKeys.forEach((key, index) => {
            const paramKey = `param${index}`;
            const value = (where as any)[key];
            if (index === 0) {
                queryBuilder.where(`user.${String(key)} = :${paramKey}`, { [paramKey]: value });
            } else {
                queryBuilder.andWhere(`user.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
        });

        // Adicionar relacionamentos
        queryBuilder
            .leftJoinAndSelect('user.userComponentAboutMe', 'aboutMe')
            .leftJoinAndSelect('aboutMe.highlights', 'highlights')
            .leftJoinAndSelect('user.userComponentEducation', 'education')
            .leftJoinAndSelect('education.certificates', 'certificates')
            .leftJoinAndSelect('user.userComponentExperience', 'experience')
            .leftJoinAndSelect('experience.positions', 'positions')
            .leftJoinAndSelect('user.userComponentCertificate', 'certificate')
            .leftJoinAndSelect('certificate.educations', 'certificateEducations');

        const user = await queryBuilder.getOne();
        if (!user) throw new UserNotFoundException();

        return user;
    }
};
