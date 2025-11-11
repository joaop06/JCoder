import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

            // Path to the logo file
            const logoPath = path.join(__dirname, 'assets', 'jcoder-logo.png');

            // Prepare attachments with inline logo
            const attachments: nodemailer.SendMailOptions['attachments'] = [];

            // Add logo as inline attachment if file exists
            if (fs.existsSync(logoPath)) {
                attachments.push({
                    filename: 'jcoder-logo.png',
                    path: logoPath,
                    cid: 'logo', // Content-ID to reference in HTML
                });
            }

            await this.transporter.sendMail({
                to,
                subject,
                html: htmlContent,
                text: textContent,
                from: `"JCoder" <${from}>`,
                attachments,
            });
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
};
