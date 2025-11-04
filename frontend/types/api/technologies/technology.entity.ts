import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import type { Application } from '../applications/application.entity';

export interface Technology {
    id: number;
    name: string;
    profileImage?: string;
    displayOrder: number;
    expertiseLevel: ExpertiseLevel;
    isActive: boolean;
    username: string;
    applications?: Application[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

