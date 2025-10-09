import { RoleEnum } from "../enums/role.enum";
import { Application } from "./application.entity";

export interface User {
    id: number;
    email: string;
    role: RoleEnum;
    applications?: Application[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
