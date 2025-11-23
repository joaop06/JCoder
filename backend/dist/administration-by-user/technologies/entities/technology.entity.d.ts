import { User } from '../../users/entities/user.entity';
import { ExpertiseLevel } from '../enums/expertise-level.enum';
import { Application } from '../../applications/entities/application.entity';
export declare class Technology {
    id: number;
    name: string;
    profileImage?: string;
    displayOrder: number;
    expertiseLevel: ExpertiseLevel;
    isActive: boolean;
    userId: number;
    user?: User;
    applications?: Application[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
