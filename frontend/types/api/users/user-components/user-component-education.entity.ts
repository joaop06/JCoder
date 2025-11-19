import { UserComponentCertificate } from './user-component-certificate.entity';

export interface UserComponentEducation {
    id: number;
    username: string;
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: Date;
    endDate?: Date;
    isCurrentlyStudying: boolean;
    certificates?: UserComponentCertificate[];
};
