import { WorkLocationTypeEnum } from '../../enums/work-location-type.enum';
import { UserComponentExperience } from './user-component-experience.entity';
export declare class UserComponentExperiencePosition {
    id: number;
    experienceId: number;
    experience?: UserComponentExperience;
    position: string;
    startDate: Date;
    endDate?: Date;
    isCurrentPosition: boolean;
    location?: string;
    locationType?: WorkLocationTypeEnum;
}
