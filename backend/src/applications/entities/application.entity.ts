import {
  Column,
  Entity,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
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
    example: 1,
    type: 'number',
    nullable: false,
  })
  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

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
    description: 'URL do Github para acessar o repositório',
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
