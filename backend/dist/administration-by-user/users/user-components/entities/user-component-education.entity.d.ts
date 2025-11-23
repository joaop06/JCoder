import { User } from '../../entities/user.entity';
import { UserComponentCertificate } from './user-component-certificate.entity';
export declare class UserComponentEducation {
    id: number;
    userId: number;
    user?: User;
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: Date;
    endDate?: Date;
    isCurrentlyStudying: boolean;
    certificates?: UserComponentCertificate[];
}
