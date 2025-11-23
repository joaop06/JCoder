import { User } from '../../entities/user.entity';
import { UserComponentEducation } from './user-component-education.entity';
export declare class UserComponentCertificate {
    id: number;
    userId: number;
    user?: User;
    certificateName: string;
    registrationNumber?: string;
    verificationUrl?: string;
    issueDate: Date;
    issuedTo: string;
    profileImage?: string;
    educations?: UserComponentEducation[];
}
