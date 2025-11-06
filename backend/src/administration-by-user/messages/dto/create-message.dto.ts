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
        description: 'Nome do remetente da mensagem',
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
        description: 'E-mail do remetente da mensagem',
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    senderEmail: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        description: 'Conteúdo da mensagem',
        example: 'Olá! Gostaria de entrar em contato sobre uma oportunidade de trabalho...',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(5000)
    message: string;
};
