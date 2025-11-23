import { ApplicationsStatsDto } from '../../applications/dto/applications-stats.dto';
import { TechnologiesStatsDto } from '../../technologies/dto/technologies-stats.dto';
export declare class ProfileCompletenessDto {
    percentage: number;
    completedFields: number;
    totalFields: number;
    fields: {
        profileImage: boolean;
        fullName: boolean;
        email: boolean;
        phone: boolean;
        address: boolean;
        githubUrl: boolean;
        linkedinUrl: boolean;
        aboutMe: boolean;
        education: boolean;
        experience: boolean;
        certificates: boolean;
        references: boolean;
    };
}
export declare class UnreadMessagesDto {
    total: number;
    conversations: number;
}
export declare class DashboardResponseDto {
    applications: ApplicationsStatsDto;
    technologies: TechnologiesStatsDto;
    unreadMessages: UnreadMessagesDto;
    profileCompleteness: ProfileCompletenessDto;
}
