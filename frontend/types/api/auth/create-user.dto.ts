export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  fullName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  occupation?: string;
  description?: string;
}

