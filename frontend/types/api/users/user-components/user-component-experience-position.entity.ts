import { WorkLocationTypeEnum } from "@/types/enums";

export interface UserComponentExperiencePosition {
    id: number;
    experienceId: number;
    position: string;
    startDate: Date;
    endDate?: Date;
    isCurrentPosition: boolean;
    location?: string;
    locationType?: WorkLocationTypeEnum;
};
