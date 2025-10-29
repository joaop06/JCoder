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
    type: () => Object,
    description: 'About Me component',
  })
  @OneToOne(() => UserComponentAboutMe, (aboutMe: any) => aboutMe.user)
  userComponentAboutMe?: any;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Array,
    description: 'Education components',
  })
  @OneToMany(() => UserComponentEducation, (education: any) => education.user)
  userComponentEducation?: any[];

  @ApiPropertyOptional({
    nullable: true,
    type: () => Array,
    description: 'Experience components',
  })
  @OneToMany(() => UserComponentExperience, (experience: any) => experience.user)
  userComponentExperience?: any[];

  @ApiPropertyOptional({
    nullable: true,
    type: () => Array,
    description: 'Certificate components',
  })
  @OneToMany(() => UserComponentCertificate, (certificate: any) => certificate.user)
  userComponentCertificate?: any[];

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
