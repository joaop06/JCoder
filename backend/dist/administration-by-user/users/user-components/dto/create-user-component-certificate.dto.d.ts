import { CreateUserComponentEducationDto } from './create-user-component-education.dto';
export declare class CreateUserComponentCertificateDto {
    userId?: number;
    certificateName: string;
    registrationNumber?: string;
    verificationUrl?: string;
    issueDate: Date;
    issuedTo: string;
    profileImage?: string;
    educations?: CreateUserComponentEducationDto[];
    educationIds?: number[];
}
