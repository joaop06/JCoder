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

export interface DailyStatsDto {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface TopCountryDto {
  country: string;
  count: number;
}

export interface TopRefererDto {
  referer: string;
  count: number;
}

export interface PortfolioEngagementStatsDto {
  totalViews: number;
  uniqueVisitors: number;
  ownerViews: number;
  dailyStats: DailyStatsDto[];
  topCountries: TopCountryDto[];
  topReferers: TopRefererDto[];
}

export enum DateRangeType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

