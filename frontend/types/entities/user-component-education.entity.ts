export interface UserComponentEducation {
    id?: number;
    userId: number;
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: Date | string;
    endDate?: Date | string;
    isCurrentlyStudying: boolean;
}

