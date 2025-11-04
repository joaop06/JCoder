import { UserComponentEducation } from './user-component-education.entity';

export interface UserComponentCertificate {
    id: number;
    username: string;
    certificateName: string;
    registrationNumber?: string;
    verificationUrl?: string;
    issueDate: Date;
    issuedTo: string;
    profileImage?: string;
    educations?: UserComponentEducation[];
};
