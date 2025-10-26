import { TechnologyCategoryEnum } from '../../enums/technology-category.enum';

export interface CreateTechnologyDto {
    name: string;
    description?: string;
    category: TechnologyCategoryEnum;
    displayOrder?: number;
    officialUrl?: string;
}

