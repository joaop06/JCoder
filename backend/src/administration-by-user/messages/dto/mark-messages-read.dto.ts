import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MarkMessagesReadDto {
    @ApiProperty({
        type: 'number',
        isArray: true,
        required: true,
        example: [1, 2, 3],
        description: 'Array of message IDs to mark as read. Must be a non-empty array.',
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    messageIds: number[];
}
