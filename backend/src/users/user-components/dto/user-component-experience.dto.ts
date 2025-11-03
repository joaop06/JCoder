import {
    IsArray,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { User } from '../../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentExperiencePositionDto } from './user-component-experience-position.dto';

export class UserComponentExperienceDto {
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
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    })
    @IsNotEmpty()
    @IsString()
    username!: string;

    @ApiPropertyOptional({
        nullable: true,
        type: () => User,
        description: 'User',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    @Expose()
    user?: User;

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
