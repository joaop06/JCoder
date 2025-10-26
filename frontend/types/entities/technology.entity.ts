import { TechnologyCategoryEnum } from '../enums/technology-category.enum';

export interface Technology {
    id: number;
    name: string;
    description?: string;
    category: TechnologyCategoryEnum;
    profileImage?: string;
    displayOrder: number;
    isActive: boolean;
    officialUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

