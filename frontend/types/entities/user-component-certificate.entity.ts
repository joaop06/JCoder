import { UserComponentEducation } from './user-component-education.entity';

export interface UserComponentCertificate {
    id?: number;
    userId: number;
    certificateName: string;
    registrationNumber?: string;
    verificationUrl?: string;
    issueDate: Date | string;
    issuedTo: string;
    profileImage?: string;
    educations?: UserComponentEducation[];
}

