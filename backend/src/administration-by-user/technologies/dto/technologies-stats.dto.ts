import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class TechnologiesStatsDto {
    @ApiProperty({
        type: 'number',
        example: 10,
        description: 'Total number of applications',
    })
    @IsNotEmpty()
    @IsNumber()
    total: number;

    @ApiProperty({
        type: 'number',
        example: 10,
        description: 'Number of active applications',
    })
    @IsNotEmpty()
    @IsNumber()
    active: number;

    @ApiProperty({
        type: 'number',
        example: 10,
        description: 'Number of inactive applications',
    })
    @IsNotEmpty()
    @IsNumber()
    inactive: number;
};
