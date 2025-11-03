import {
    IsDate,
    IsEnum,
    IsNumber,
    IsString,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLocationTypeEnum } from '../../enums/work-location-type.enum';
import { UserComponentExperience } from '../entities/user-component-experience.entity';

export class UserComponentExperiencePositionDto {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked experience component ID',
    })
    @IsNotEmpty()
    @IsNumber()
    experienceId!: number;

    @ApiPropertyOptional({
        nullable: true,
        type: () => UserComponentExperience,
        description: 'UserComponentExperience',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => UserComponentExperience)
    @Expose()
    experience?: UserComponentExperience;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        description: 'Job position title',
        example: 'Senior Software Engineer',
    })
    @IsNotEmpty()
    @IsString()
    position!: string;

    @ApiProperty({
        required: true,
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Position start date',
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate!: Date;

    @ApiPropertyOptional({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Position end date (null if current position)',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiProperty({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if this is the current position',
    })
    @IsOptional()
    @IsBoolean()
    isCurrentPosition: boolean;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: 'São Paulo, Brazil',
        description: 'Job location',
    })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({
        nullable: true,
        enum: WorkLocationTypeEnum,
        description: 'Work location type',
        example: WorkLocationTypeEnum.REMOTE,
    })
    @IsOptional()
    @IsEnum(WorkLocationTypeEnum)
    locationType?: WorkLocationTypeEnum;
};
