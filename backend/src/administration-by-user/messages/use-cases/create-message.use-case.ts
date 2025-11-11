import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../../email/email.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { EmailTemplate } from '../../../email/templates/email-template';

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

                await this.sendMessageNotificationEmail(
                    user.email,
                    user.fullName || user.firstName || user.username,
                    createMessageDto.senderName,
                    createMessageDto.senderEmail,
                    createMessageDto.message,
                    portfolioUrl,
                );
            } catch (error) {
                // Log error but don't fail the message creation
                console.error('Error sending notification email:', error);
                // Message has already been created, so we don't throw the error
            }
        }
    }

    /**
     * Sends notification email when a regular user sends a message to the administrator
     */
    private async sendMessageNotificationEmail(
        to: string,
        adminName: string,
        senderName: string,
        senderEmail: string,
        message: string,
        portfolioUrl?: string,
    ): Promise<void> {
        const subject = `New message received on your portfolio - ${senderName}`;

        // Create message box using the template
        const messageBox = EmailTemplate.createMessageBox(senderName, senderEmail, message);

        // Build content with optional button
        let content = `
            <p style="margin: 0 0 20px 0;">Hello <strong>${adminName}</strong>,</p>
            <p style="margin: 0 0 20px 0;">You have received a new message through your portfolio:</p>
            ${messageBox}
        `;

        // Add button if portfolio URL is available
        if (portfolioUrl) {
            content += EmailTemplate.createButton('View Portfolio', portfolioUrl);
        }

        const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL') || undefined;

        const htmlContent = EmailTemplate.generateHTML({
            title: 'New Message Received',
            content,
            frontendBaseUrl,
        });

        const textContent = EmailTemplate.generateText(
            `New message received on your portfolio - ${senderName}`,
            `Hello ${adminName},\n\nYou have received a new message through your portfolio:\n\nFrom: ${senderName} (${senderEmail})\n\nMessage:\n${message}\n\n${portfolioUrl ? `Access your portfolio: ${portfolioUrl}` : ''}`,
        );

        await this.emailService.sendEmail(to, subject, htmlContent, textContent);
    }
};
