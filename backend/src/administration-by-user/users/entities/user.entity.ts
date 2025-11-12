import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Message } from '../../messages/entities/message.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Technology } from '../../technologies/entities/technology.entity';
import { Application } from '../../applications/entities/application.entity';
import { UserComponentAboutMe } from '../user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../user-components/entities/user-component-certificate.entity';
import { ApplicationComponentApi } from '../../applications/application-components/entities/application-component-api.entity';
import { ApplicationComponentMobile } from '../../applications/application-components/entities/application-component-mobile.entity';
import { ApplicationComponentLibrary } from '../../applications/application-components/entities/application-component-library.entity';
import { ApplicationComponentFrontend } from '../../applications/application-components/entities/application-component-frontend.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: 1,
    type: 'number',
    nullable: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: 'string',
    nullable: false,
    example: 'johndoe',
    description: 'Unique username used for login',
  })
  @Column({ unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'John',
    description: 'User first name',
  })
  @Column({ nullable: true })
  firstName?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'John Doe',
    description: 'User full name',
  })
  @Column({ nullable: true })
  fullName?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'your@email.com',
    description: 'User contact email',
  })
  @Column({ unique: true, nullable: true })
  email?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'GitHub profile URL',
    example: 'https://github.com/johndoe',
  })
  @Column({ nullable: true })
  githubUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
  })
  @Column({ nullable: true })
  linkedinUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'User profile image filename',
    example: 'profile-123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  @Column({ nullable: true })
  profileImage?: string;

  @ApiProperty({
    nullable: false,
    type: () => Date,
    example: new Date(),
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    nullable: false,
    type: () => Date,
    example: new Date(),
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
    type: () => Date,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  // =============== RELATIONS ==================

  @ApiPropertyOptional({
    nullable: true,
    type: () => UserComponentAboutMe,
    description: 'About Me component',
  })
  @OneToOne(() => UserComponentAboutMe, (aboutMe) => aboutMe.user)
  userComponentAboutMe?: UserComponentAboutMe;

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => UserComponentEducation,
    description: 'Education components',
  })
  @OneToMany(() => UserComponentEducation, (education) => education.user)
  userComponentEducation?: UserComponentEducation[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => UserComponentExperience,
    description: 'Experience components',
  })
  @OneToMany(() => UserComponentExperience, (experience) => experience.user)
  userComponentExperience?: UserComponentExperience[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => Array,
    description: 'Certificate components',
  })
  @OneToMany(() => UserComponentCertificate, (certificate) => certificate.user)
  userComponentCertificate?: UserComponentCertificate[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => Technology,
    description: 'Technologies',
  })
  @OneToMany(() => Technology, (technology) => technology.user)
  technologies?: Technology[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => Application,
    description: 'Applications',
  })
  @OneToMany(() => Application, (application) => application.user)
  applications?: Application[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => ApplicationComponentApi,
    description: 'Application components api',
  })
  @OneToMany(() => ApplicationComponentApi, (applicationComponentApi) => applicationComponentApi.user)
  applicationsComponentsApis?: ApplicationComponentApi[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => ApplicationComponentMobile,
    description: 'Application components mobile',
  })
  @OneToMany(() => ApplicationComponentMobile, (applicationComponentMobile) => applicationComponentMobile.user)
  applicationsComponentsMobiles?: ApplicationComponentMobile[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => ApplicationComponentLibrary,
    description: 'Application components library',
  })
  @OneToMany(() => ApplicationComponentLibrary, (applicationComponentLibrary) => applicationComponentLibrary.user)
  applicationsComponentsLibraries?: ApplicationComponentLibrary[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => ApplicationComponentFrontend,
    description: 'Application components frontend',
  })
  @OneToMany(() => ApplicationComponentFrontend, (applicationComponentFrontend) => applicationComponentFrontend.user)
  applicationsComponentsFrontends?: ApplicationComponentFrontend[];

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: () => Message,
    description: 'Messages received by the user',
  })
  @OneToMany(() => Message, (message) => message.user)
  messages?: Message[];
};
