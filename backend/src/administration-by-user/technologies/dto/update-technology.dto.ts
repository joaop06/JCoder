import { PartialType } from '@nestjs/swagger';
import { CreateTechnologyDto } from './create-technology.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTechnologyDto extends PartialType(CreateTechnologyDto) {
    @ApiPropertyOptional({
        type: 'boolean',
        required: false,
        nullable: false,
        example: true,
        description: 'Indicates whether the technology is active',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        type: 'string',
        required: false,
        nullable: true,
        example: 'profile-image.jpg',
        description: 'Profile image filename',
    })
    @IsOptional()
    @IsString()
    profileImage?: string | null;
}

