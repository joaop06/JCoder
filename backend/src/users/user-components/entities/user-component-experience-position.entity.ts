import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLocationTypeEnum } from '../../enums/work-location-type.enum';
import { UserComponentExperience } from './user-component-experience.entity';

@Entity('users_components_experiences_positions')
export class UserComponentExperiencePosition {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked experience component ID',
    })
    @Column()
    experienceId: number;

    @ManyToOne(() => UserComponentExperience, (experience) => experience.positions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'experienceId', referencedColumnName: 'userId' })
    experience: UserComponentExperience;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Senior Software Engineer',
        description: 'Job position title',
    })
    @Column({ nullable: false })
    position: string;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Position start date',
    })
    @Column({ type: 'date', nullable: false })
    startDate: Date;

    @ApiPropertyOptional({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Position end date (null if current position)',
    })
    @Column({ type: 'date', nullable: true })
    endDate?: Date;

    @ApiProperty({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if this is the current position',
    })
    @Column({ default: false })
    isCurrentPosition: boolean;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'São Paulo, Brazil',
        description: 'Job location',
    })
    @Column({ nullable: true })
    location?: string;

    @ApiProperty({
        nullable: true,
        enum: WorkLocationTypeEnum,
        description: 'Work location type',
        example: WorkLocationTypeEnum.REMOTE,
    })
    @Column({
        type: 'enum',
        enum: WorkLocationTypeEnum,
        nullable: true,
    })
    locationType?: WorkLocationTypeEnum;
};
