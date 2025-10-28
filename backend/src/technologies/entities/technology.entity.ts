import {
    Column,
    Entity,
    ManyToMany,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpertiseLevel } from '../enums/expertise-level.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Application } from '../../applications/entities/application.entity';

@Entity('technologies')
export class Technology {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Technology unique identifier',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Node.js',
        description: 'Technology name',
    })
    @Column({ unique: true })
    name: string;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        example: 'nodejs-logo.png',
        description: 'Profile image filename for the technology (logo, icon, etc.)',
    })
    @Column({ nullable: true })
    profileImage?: string;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Display order for sorting technologies (lower numbers appear first)',
    })
    @Column({ nullable: false, default: 1 })
    displayOrder: number;

    @ApiProperty({
        enum: ExpertiseLevel,
        example: ExpertiseLevel.INTERMEDIATE,
        nullable: false,
        description: 'Expertise level in the technology',
    })
    @Column({
        type: 'enum',
        enum: ExpertiseLevel,
        default: ExpertiseLevel.INTERMEDIATE,
    })
    expertiseLevel: ExpertiseLevel;

    @ApiProperty({
        default: true,
        example: true,
        nullable: false,
        type: 'boolean',
        description: 'Indicates whether the technology is active and visible',
    })
    @Column({ default: true })
    isActive: boolean;

    @ApiPropertyOptional({
        nullable: true,
        type: () => [Application],
        description: 'Applications that use this technology',
    })
    @ManyToMany(() => Application, (application) => application.technologies)
    applications?: Application[];

    @ApiProperty({
        nullable: false,
        type: () => Date,
        example: new Date(),
        description: 'Date when the technology was created',
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        example: new Date(),
        description: 'Date when the technology was last updated',
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @ApiProperty({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
        description: 'Date when the technology was soft deleted',
    })
    @DeleteDateColumn()
    deletedAt?: Date;
};
