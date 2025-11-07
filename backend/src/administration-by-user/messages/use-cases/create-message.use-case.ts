import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../../email/email.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class CreateMessageUseCase {
    constructor(
        private readonly emailService: EmailService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly messagesService: MessagesService,
    ) { }

    async execute(username: string, createMessageDto: CreateMessageDto): Promise<void> {
        // Criar a mensagem no banco de dados
        await this.messagesService.create(username, createMessageDto);

        // Buscar o usuário administrador para obter informações para o e-mail
        const user = await this.usersService.findOneBy({ username });

        // Enviar e-mail de notificação para o administrador
        if (user?.email) {
            try {
                const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL') || '';
                const portfolioUrl = frontendBaseUrl ? `${frontendBaseUrl}/${username}` : undefined;

                await this.emailService.sendMessageNotificationEmail({
                    portfolioUrl,
                    to: user.email,
                    message: createMessageDto.message,
                    senderName: createMessageDto.senderName,
                    senderEmail: createMessageDto.senderEmail,
                    adminName: user.fullName || user.firstName || user.username,
                });
            } catch (error) {
                // Log error but don't fail the message creation
                console.error('Erro ao enviar e-mail de notificação:', error);
                // A mensagem já foi criada, então não lançamos o erro
            }
        }
    }
};
