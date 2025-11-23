import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, htmlContent: string, textContent: string): Promise<void>;
}
