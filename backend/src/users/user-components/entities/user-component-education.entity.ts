import {
    Column,
    Entity,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentCertificate } from './user-component-certificate.entity';

@Entity('users_components_educations')
export class UserComponentEducation {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    })
    @Column({ nullable: false })
    username: string;

    @ManyToOne(() => User, (user) => user.userComponentEducation, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'username' })
    user?: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'University of Technology',
        description: 'Educational institution name',
    })
    @Column({ nullable: false })
    institutionName: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Computer Science',
        description: 'Course/field of study name',
    })
    @Column({ nullable: false })
    courseName: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'Bachelor\'s Degree',
        description: 'Degree/qualification type',
    })
    @Column({ nullable: true })
    degree?: string;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Education start date',
    })
    @Column({ type: 'date', nullable: false })
    startDate: Date;

    @ApiPropertyOptional({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Education end date (or expected end date)',
    })
    @Column({ type: 'date', nullable: true })
    endDate?: Date;

    @ApiProperty({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if currently studying (if true, endDate should be null or future date)',
    })
    @Column({ default: false })
    isCurrentlyStudying: boolean;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => UserComponentCertificate,
        description: 'Related certificates (ManyToMany relationship)',
    })
    @ManyToMany(() => UserComponentCertificate, (certificate) => certificate.educations)
    certificates?: UserComponentCertificate[];
};
