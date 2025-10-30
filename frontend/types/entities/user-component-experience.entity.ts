export interface UserComponentExperiencePosition {
    id: number;
    experienceUserId: number;
    positionName: string;
    description?: string;
    startDate: Date | string;
    endDate?: Date | string;
    isCurrentPosition: boolean;
}

export interface UserComponentExperience {
    userId: number;
    companyName: string;
    positions?: UserComponentExperiencePosition[];
}

