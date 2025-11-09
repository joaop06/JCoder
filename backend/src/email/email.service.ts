import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMessageNotificationEmailParams } from './interfaces/send-message-notification-email-params.interface';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        const smtpSecure = this.configService.get<string>('SMTP_SECURE');
        const port = this.configService.get<number>('SMTP_PORT') || 587;

        // Determines whether to use direct SSL based on port and configuration
        // Port 465 always uses direct SSL (secure: true)
        // Port 587 always uses STARTTLS (secure: false)
        let isSecure: boolean;
        if (port === 465) {
            isSecure = true; // Direct SSL
        } else if (port === 587) {
            isSecure = false; // STARTTLS
        } else {
            // For other ports, use explicit configuration
            isSecure = smtpSecure === 'true' || smtpSecure === '1';
        }

        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
            port,
            secure: isSecure,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    /**
     * Sends notification email when a regular user sends a message to the administrator
     */
    async sendMessageNotificationEmail(
        params: SendMessageNotificationEmailParams,
    ): Promise<void> {
        const { to, adminName, senderName, senderEmail, message, portfolioUrl } = params;

        const subject = `New message received on your portfolio - ${senderName}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #4a90e2;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-top: none;
                }
                .message-box {
                    background-color: white;
                    padding: 15px;
                    border-left: 4px solid #4a90e2;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 12px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4a90e2;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 15px;
                }
                </style>
            </head>
            <body>
                <div class="header">
                <h2>New Message Received</h2>
                </div>
                <div class="content">
                <p>Hello <strong>${adminName}</strong>,</p>
                <p>You have received a new message through your portfolio:</p>
                
                <div class="message-box">
                    <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                ${portfolioUrl ? `
                    <p style="text-align: center;">
                    <a href="${portfolioUrl}" class="button">View Portfolio</a>
                    </p>
                ` : ''}
                </div>
                <div class="footer">
                <p>This is an automatic notification from the JCoder system.</p>
                <p>Please do not reply to this email directly.</p>
                </div>
            </body>
            </html>
        `;

        const textContent = `
            Hello ${adminName},

            You have received a new message through your portfolio:

            From: ${senderName} (${senderEmail})

            Message:
            ${message}

            ${portfolioUrl ? `Access your portfolio: ${portfolioUrl}` : ''}

            ---
            This is an automatic notification from the JCoder system.
            Please do not reply to this email directly.
        `;

        try {
            const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

            await this.transporter.sendMail({
                to,
                subject,
                html: htmlContent,
                text: textContent,
                from: `"JCoder" <${from}>`,
            });
        } catch (error) {
            // Log error but don't throw to avoid breaking the message creation flow
            console.error('Error sending notification email:', error);
            throw error;
        }
    }

    /**
     * Generic method to send emails
     */
    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        textContent: string,
    ): Promise<void> {
        try {
            const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

            await this.transporter.sendMail({
                to,
                subject,
                html: htmlContent,
                text: textContent,
                from: `"JCoder" <${from}>`,
            });
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
};
