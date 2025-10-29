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
import { RoleEnum } from '../../@common/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentAboutMe } from '../user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../user-components/entities/user-component-certificate.entity';

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
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    type: 'string',
    nullable: false,
    example: 'John',
    description: 'User first name',
  })
  @Column({ nullable: false })
  firstName: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'John Doe',
    description: 'User full name',
  })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'your@email.com',
    description: 'User contact email',
  })
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @Column({ nullable: true })
  githubUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @Column({ nullable: true })
  linkedinUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    example: 'profile-123e4567-e89b-12d3-a456-426614174000.jpg',
    description: 'User profile image filename',
  })
  @Column({ nullable: true })
  profileImage?: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    enum: RoleEnum,
    nullable: false,
    example: RoleEnum.Admin,
  })
  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: false,
    default: RoleEnum.User,
  })
  role: RoleEnum;

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
    nullable: true,
    type: () => Array,
    description: 'Certificate components',
  })
  @OneToMany(() => UserComponentCertificate, (certificate) => certificate.user)
  userComponentCertificate?: UserComponentCertificate[];

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
