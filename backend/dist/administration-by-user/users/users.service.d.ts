import { User } from "./entities/user.entity";
import { FindOptionsWhere, Repository } from "typeorm";
export declare class UsersService {
    private readonly repository;
    constructor(repository: Repository<User>);
    existsBy(where: FindOptionsWhere<User>): Promise<boolean>;
    update(user: User): Promise<User>;
    findOneBy(where: FindOptionsWhere<User>, includeComponents?: boolean): Promise<User>;
}
