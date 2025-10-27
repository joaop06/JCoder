import { ExpertiseLevel } from '../enums/expertise-level.enum';

export interface Technology {
    id: number;
    name: string;
    profileImage?: string;
    displayOrder: number;
    expertiseLevel: ExpertiseLevel;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

