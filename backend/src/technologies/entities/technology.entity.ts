import {
    Column,
    Entity,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TechnologyCategoryEnum } from '../enums/technology-category.enum';

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
        type: 'string',
        nullable: true,
        example: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        description: 'Detailed description of the technology',
    })
    @Column('text', { nullable: true })
    description?: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        enum: TechnologyCategoryEnum,
        example: TechnologyCategoryEnum.BACKEND,
        description: 'Technology category for organization and filtering',
    })
    @Column({
        type: 'enum',
        nullable: false,
        enum: TechnologyCategoryEnum,
    })
    category: TechnologyCategoryEnum;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        example: 'nodejs-logo.png',
        description: 'Profile image filename for the technology (logo, icon, etc.)',
    })
    @Column({ nullable: true })
    profileImage?: string;

    @ApiProperty({
        type: 'number',
        nullable: false,
        example: 1,
        default: 999,
        description: 'Display order for sorting technologies (lower numbers appear first)',
    })
    @Column({ default: 999 })
    displayOrder: number;

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
        type: 'string',
        example: 'https://nodejs.org',
        description: 'Official website URL of the technology',
    })
    @Column({ nullable: true })
    officialUrl?: string;

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
}

