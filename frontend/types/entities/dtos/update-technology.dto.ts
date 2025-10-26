import { TechnologyCategoryEnum } from '../../enums/technology-category.enum';

export interface UpdateTechnologyDto {
    name?: string;
    description?: string;
    category?: TechnologyCategoryEnum;
    displayOrder?: number;
    isActive?: boolean;
    officialUrl?: string;
}

