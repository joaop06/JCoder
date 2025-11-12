import {
    IsEmail,
    IsString,
    MaxLength,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'João Silva',
        description: 'Message sender name',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    senderName: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'joao@example.com',
        description: 'Message sender email',
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    senderEmail: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        description: 'Message content',
        example: 'Hello! I would like to get in touch about a job opportunity...',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(5000)
    message: string;
};
