import { RoleEnum } from "../enums/role.enum";
import { Application } from "./application.entity";

export interface User {
    id: number;
    name?: string;
    email: string;
    role: RoleEnum;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
