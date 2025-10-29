import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDate,
    IsBoolean,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLocationTypeEnum } from '../../enums/work-location-type.enum';

export class UserComponentExperiencePositionDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Senior Software Engineer',
        description: 'Job position title',
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
    isCurrentPosition?: boolean;

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
        enum: WorkLocationTypeEnum,
        nullable: true,
        example: WorkLocationTypeEnum.REMOTE,
        description: 'Work location type',
    })
    @IsOptional()
    @IsEnum(WorkLocationTypeEnum)
    locationType?: WorkLocationTypeEnum;
};

