// Enums
export enum RoleEnum {
  User = 'user',
  Admin = 'admin',
}

export enum ApplicationTypeEnum {
  Fullstack = 'fullstack',
  Api = 'api',
  Frontend = 'frontend',
  Mobile = 'mobile',
  Library = 'library',
}

export enum MobilePlatformEnum {
  Android = 'android',
  iOS = 'ios',
  Both = 'both',
}

// User
export interface User {
  id: number;
  email: string;
  role: RoleEnum;
  applications?: Application[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Application Components
export interface ApplicationComponentApi {
  applicationId: number;
  domain: string;
  apiUrl: string;
  documentationUrl: string;
  healthCheckEndpoint?: string;
}

export interface ApplicationComponentFrontend {
  applicationId: number;
  frontendUrl: string;
  screenshotUrl?: string;
  associatedApiId?: number;
  associatedApi?: Application;
}

export interface ApplicationComponentMobile {
  applicationId: number;
  platform: MobilePlatformEnum;
  downloadUrl?: string;
  associatedApiId?: number;
  associatedApi?: Application;
}

export interface ApplicationComponentLibrary {
  applicationId: number;
  packageManagerUrl: string;
  readmeContent?: string;
}

// Application
export interface Application {
  id: number;
  userId: number;
  user?: User;
  name: string;
  description: string;
  applicationType: ApplicationTypeEnum;
  githubUrl?: string;
  isActive: boolean;
  applicationComponentApi?: ApplicationComponentApi;
  applicationComponentMobile?: ApplicationComponentMobile;
  applicationComponentLibrary?: ApplicationComponentLibrary;
  applicationComponentFrontend?: ApplicationComponentFrontend;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
