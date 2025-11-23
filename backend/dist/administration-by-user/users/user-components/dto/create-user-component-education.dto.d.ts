import { CreateUserComponentCertificateDto } from './create-user-component-certificate.dto';
export declare class CreateUserComponentEducationDto {
    userId?: number;
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: Date;
    endDate?: Date;
    isCurrentlyStudying: boolean;
    certificates?: CreateUserComponentCertificateDto[];
}
