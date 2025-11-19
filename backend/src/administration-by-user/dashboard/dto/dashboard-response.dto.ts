import { ApiProperty } from '@nestjs/swagger';
import { ApplicationsStatsDto } from '../../applications/dto/applications-stats.dto';
import { TechnologiesStatsDto } from '../../technologies/dto/technologies-stats.dto';

export class ProfileCompletenessDto {
    @ApiProperty({
        type: 'number',
        example: 75,
        description: 'Profile completeness percentage (0-100)',
    })
    percentage: number;

    @ApiProperty({
        type: 'number',
        example: 6,
        description: 'Number of completed fields',
    })
    completedFields: number;

    @ApiProperty({
        type: 'number',
        example: 8,
        description: 'Total number of fields',
    })
    totalFields: number;

    @ApiProperty({
        type: () => Object,
        description: 'Details of each field completion status',
        example: {
            profileImage: true,
            fullName: true,
            email: true,
            phone: false,
            address: false,
            githubUrl: true,
            linkedinUrl: true,
            aboutMe: true,
            education: false,
            experience: true,
            certificates: false,
            references: false,
        },
    })
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

export class UnreadMessagesDto {
    @ApiProperty({
        type: 'number',
        example: 5,
        description: 'Total number of unread messages',
    })
    total: number;

    @ApiProperty({
        type: 'number',
        example: 3,
        description: 'Number of conversations with unread messages',
    })
    conversations: number;
}

export class DashboardResponseDto {
    @ApiProperty({
        type: () => ApplicationsStatsDto,
        description: 'Applications statistics',
    })
    applications: ApplicationsStatsDto;

    @ApiProperty({
        type: () => TechnologiesStatsDto,
        description: 'Technologies statistics',
    })
    technologies: TechnologiesStatsDto;

    @ApiProperty({
        type: () => UnreadMessagesDto,
        description: 'Unread messages statistics',
    })
    unreadMessages: UnreadMessagesDto;

    @ApiProperty({
        type: () => ProfileCompletenessDto,
        description: 'Profile completeness information',
    })
    profileCompleteness: ProfileCompletenessDto;
}
