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
        // Create the message in the database
        await this.messagesService.create(username, createMessageDto);

        // Find the administrator user to get information for the email
        const user = await this.usersService.findOneBy({ username });

        // Send notification email to the administrator
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
                console.error('Error sending notification email:', error);
                // Message has already been created, so we don't throw the error
            }
        }
    }
};
