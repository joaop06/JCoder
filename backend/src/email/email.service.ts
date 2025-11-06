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

        // Determina se deve usar SSL direto baseado na porta e configuração
        // Porta 465 sempre usa SSL direto (secure: true)
        // Porta 587 sempre usa STARTTLS (secure: false)
        let isSecure: boolean;
        if (port === 465) {
            isSecure = true; // SSL direto
        } else if (port === 587) {
            isSecure = false; // STARTTLS
        } else {
            // Para outras portas, usa a configuração explícita
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
     * Envia e-mail de notificação quando um usuário comum envia uma mensagem para o administrador
     */
    async sendMessageNotificationEmail(
        params: SendMessageNotificationEmailParams,
    ): Promise<void> {
        const { to, adminName, senderName, senderEmail, message, portfolioUrl } = params;

        const subject = `Nova mensagem recebida no seu portfólio - ${senderName}`;

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
                <h2>Nova Mensagem Recebida</h2>
                </div>
                <div class="content">
                <p>Olá <strong>${adminName}</strong>,</p>
                <p>Você recebeu uma nova mensagem através do seu portfólio:</p>
                
                <div class="message-box">
                    <p><strong>De:</strong> ${senderName} (${senderEmail})</p>
                    <p><strong>Mensagem:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                ${portfolioUrl ? `
                    <p style="text-align: center;">
                    <a href="${portfolioUrl}" class="button">Ver Portfólio</a>
                    </p>
                ` : ''}
                </div>
                <div class="footer">
                <p>Esta é uma notificação automática do sistema JCoder.</p>
                <p>Por favor, não responda este e-mail diretamente.</p>
                </div>
            </body>
            </html>
        `;

        const textContent = `
            Olá ${adminName},

            Você recebeu uma nova mensagem através do seu portfólio:

            De: ${senderName} (${senderEmail})

            Mensagem:
            ${message}

            ${portfolioUrl ? `Acesse seu portfólio: ${portfolioUrl}` : ''}

            ---
            Esta é uma notificação automática do sistema JCoder.
            Por favor, não responda este e-mail diretamente.
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
            console.error('Erro ao enviar e-mail de notificação:', error);
            throw error;
        }
    }
};
