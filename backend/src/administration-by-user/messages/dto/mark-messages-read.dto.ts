import { IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MarkMessagesReadDto {
    @ApiProperty({
        type: 'number',
        isArray: true,
        required: false,
        example: [1, 2, 3],
        description: 'Array of message IDs to mark as read. If not provided, all messages in the conversation will be marked as read.',
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    messageIds?: number[];
}

