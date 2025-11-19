import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderApplicationDto {
    @ApiProperty({
        type: 'integer',
        required: true,
        nullable: false,
        minimum: 0,
        example: 3,
        description: 'New display order position for the application',
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    displayOrder!: number;
}

