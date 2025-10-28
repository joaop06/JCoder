import { ExpertiseLevel } from '../../enums/expertise-level.enum';

export interface CreateTechnologyDto {
    name: string;
    expertiseLevel?: ExpertiseLevel;
};
