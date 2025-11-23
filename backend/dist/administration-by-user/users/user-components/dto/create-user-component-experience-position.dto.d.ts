import { WorkLocationTypeEnum } from '../../enums/work-location-type.enum';
export declare class CreateUserComponentExperiencePositionDto {
    experienceId?: number;
    position: string;
    startDate: Date;
    endDate?: Date;
    isCurrentPosition: boolean;
    location?: string;
    locationType?: WorkLocationTypeEnum;
}
