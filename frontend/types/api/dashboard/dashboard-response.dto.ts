export interface ApplicationsStatsDto {
  active: number;
  inactive: number;
  total: number;
}

export interface TechnologiesStatsDto {
  active: number;
  inactive: number;
  total: number;
}

export interface UnreadMessagesDto {
  total: number;
  conversations: number;
}

export interface ProfileCompletenessFieldsDto {
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
}

export interface ProfileCompletenessDto {
  percentage: number;
  completedFields: number;
  totalFields: number;
  fields: ProfileCompletenessFieldsDto;
}

export interface DashboardResponseDto {
  applications: ApplicationsStatsDto;
  technologies: TechnologiesStatsDto;
  unreadMessages: UnreadMessagesDto;
  profileCompleteness: ProfileCompletenessDto;
}

