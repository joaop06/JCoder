import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderTechnologyDto {
    @ApiProperty({
        type: 'integer',
        required: true,
        nullable: false,
        minimum: 0,
        example: 3,
        description: 'New display order position for the technology',
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    displayOrder!: number;
}

