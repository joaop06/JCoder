import {
    Column,
    Entity,
    ManyToOne,
    JoinTable,
    JoinColumn,
    ManyToMany,
    PrimaryColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentEducation } from './user-component-education.entity';

@Entity('users_components_certificates')
export class UserComponentCertificate {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked user ID',
    })
    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.userComponentCertificate, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        description: 'Certificate name',
        example: 'AWS Certified Solutions Architect',
    })
    @Column({ nullable: false })
    certificateName: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'AWS-1234567890',
        description: 'Certificate registration number',
    })
    @Column({ nullable: true })
    registrationNumber?: string;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        description: 'URL to verify certificate authenticity',
        example: 'https://verify.credential.com/certificate/123456',
    })
    @Column({ nullable: true })
    verificationUrl?: string;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        example: new Date('2023-01-15'),
        description: 'Certificate issuance date',
    })
    @Column({ type: 'date', nullable: false })
    issueDate: Date;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'John Doe',
        description: 'Name of the person the certificate was issued to',
    })
    @Column({ nullable: false })
    issuedTo: string;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        example: 'certificate-profile.png',
        description: 'Certificate profile image filename',
    })
    @Column({ nullable: true })
    profileImage?: string;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => UserComponentEducation,
        description: 'Related education records (ManyToMany relationship)',
    })
    @ManyToMany(() => UserComponentEducation, (education) => education.certificates, {
        nullable: true,
    })
    @JoinTable({
        name: 'users_certificates_educations',
        joinColumn: { name: 'certificateId', referencedColumnName: 'userId' },
        inverseJoinColumn: { name: 'educationId', referencedColumnName: 'userId' },
    })
    educations?: UserComponentEducation[];
};
