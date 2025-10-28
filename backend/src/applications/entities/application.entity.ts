import {
  Column,
  Entity,
  OneToOne,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { Technology } from '../../technologies/entities/technology.entity';
import { ApplicationComponentApi } from '../application-components/entities/application-component-api.entity';
import { ApplicationComponentMobile } from '../application-components/entities/application-component-mobile.entity';
import { ApplicationComponentLibrary } from '../application-components/entities/application-component-library.entity';
import { ApplicationComponentFrontend } from '../application-components/entities/application-component-frontend.entity';

@Entity('applications')
export class Application {
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
    example: 'Any Name',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    type: 'string',
    nullable: false,
    example: 'This is the first application',
  })
  @Column('text', { nullable: false })
  description: string;

  @ApiProperty({
    type: 'string',
    nullable: false,
    enum: ApplicationTypeEnum,
    example: ApplicationTypeEnum.API,
    description: 'Application type (involves defining components)',
  })
  @Column({
    type: 'enum',
    nullable: false,
    enum: ApplicationTypeEnum,
  })
  applicationType: ApplicationTypeEnum;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: 'https://github.com/user/your-application',
    description: 'GitHub URL to access the repository',
  })
  @Column({ nullable: true })
  githubUrl?: string;

  @ApiProperty({
    default: true,
    example: true,
    nullable: false,
    type: 'boolean',
    description: 'Indicates whether the application is active',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    nullable: true,
    type: 'array',
    items: { type: 'string' },
    example: ['image1.jpg', 'image2.png'],
    description: 'Array of image filenames associated with the application',
  })
  @Column('json', { nullable: true })
  images?: string[];

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: 'profile-logo.png',
    description: 'Profile image filename for the application (logo, icon, etc.)',
  })
  @Column({ nullable: true })
  profileImage?: string;

  @ApiProperty({
    example: 1,
    type: 'number',
    nullable: false,
    description: 'Display order for sorting applications (lower numbers appear first)',
  })
  @Column({ nullable: false, default: 1 })
  displayOrder: number;

  @ApiPropertyOptional({
    nullable: true,
    type: () => ApplicationComponentApi,
    description: 'API application component',
  })
  @OneToOne(() => ApplicationComponentApi, (applicationComponentApi) => applicationComponentApi.application)
  applicationComponentApi?: ApplicationComponentApi;

  @ApiPropertyOptional({
    nullable: true,
    type: () => ApplicationComponentMobile,
    description: 'API application component',
  })
  @OneToOne(() => ApplicationComponentMobile, (applicationComponentMobile) => applicationComponentMobile.application)
  applicationComponentMobile?: ApplicationComponentMobile;

  @ApiPropertyOptional({
    nullable: true,
    type: () => ApplicationComponentLibrary,
    description: 'API application component',
  })
  @OneToOne(() => ApplicationComponentLibrary, (applicationComponentLibrary) => applicationComponentLibrary.application)
  applicationComponentLibrary?: ApplicationComponentLibrary;

  @ApiPropertyOptional({
    nullable: true,
    type: () => ApplicationComponentFrontend,
    description: 'API application component',
  })
  @OneToOne(() => ApplicationComponentFrontend, (applicationComponentFrontend) => applicationComponentFrontend.application)
  applicationComponentFrontend?: ApplicationComponentFrontend;

  @ApiPropertyOptional({
    nullable: true,
    type: () => [Technology],
    description: 'Technologies associated with this application',
  })
  @ManyToMany(() => Technology, (technology) => technology.applications, { eager: false })
  @JoinTable({
    name: 'applications_technologies',
    joinColumn: { name: 'applicationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'technologyId', referencedColumnName: 'id' },
  })
  technologies?: Technology[];

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
};
