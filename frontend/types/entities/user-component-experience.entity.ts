export enum WorkLocationTypeEnum {
    HYBRID = 'hybrid',
    REMOTE = 'remote',
    IN_PERSON = 'in person',
}

export interface UserComponentExperiencePosition {
    id?: number;
    experienceId?: number;
    experienceUserId?: number;
    position: string; // Backend uses 'position', but may also come as 'positionName' from API
    positionName?: string; // For backward compatibility
    description?: string;
    startDate: Date | string;
    endDate?: Date | string;
    isCurrentPosition: boolean;
    location?: string;
    locationType?: WorkLocationTypeEnum;
}

export interface UserComponentExperience {
    userId: number;
    companyName: string;
    positions?: UserComponentExperiencePosition[];
}

