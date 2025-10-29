import {
    IsArray,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentExperiencePositionDto } from './user-component-experience-position.dto';

export class UserComponentExperienceDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    })
    @IsNotEmpty()
    @IsString()
    companyName!: string;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => UserComponentExperiencePositionDto,
        description: 'Positions held at this company',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserComponentExperiencePositionDto)
    positions?: UserComponentExperiencePositionDto[];
};
