import { ExpertiseLevel } from '../../enums/expertise-level.enum';

export interface UpdateTechnologyDto {
    name?: string;
    expertiseLevel?: ExpertiseLevel;
    isActive?: boolean;
};
