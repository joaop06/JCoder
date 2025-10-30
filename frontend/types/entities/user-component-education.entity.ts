export interface UserComponentEducation {
    userId: number;
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: Date | string;
    endDate?: Date | string;
    isCurrentlyStudying: boolean;
}

