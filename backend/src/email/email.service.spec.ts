import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

// Mock do nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(),
}));

// Mock do fs
jest.mock('fs', () => ({
    existsSync: jest.fn(),
}));

describe('EmailService', () => {
    let service: EmailService;
    let configService: ConfigService;
    let mockTransporter: any;

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock transporter
        mockTransporter = {
            sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
        };

        (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('deve criar transporter com configurações corretas', () => {
            // O constructor é chamado durante a criação do módulo no beforeEach
            // Verificamos que o transporter foi criado
            expect(nodemailer.createTransport).toHaveBeenCalled();
            expect(mockTransporter).toBeDefined();
        });
    });

    describe('sendEmail', () => {

        it('deve enviar email com sucesso', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';

            mockConfigService.get
                .mockReturnValueOnce('sender@example.com') // SMTP_FROM
                .mockReturnValueOnce('user@example.com'); // SMTP_USER (fallback)

            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await service.sendEmail(to, subject, htmlContent, textContent);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                to,
                subject,
                html: htmlContent,
                text: textContent,
                from: '"JCoder" <sender@example.com>',
                attachments: [],
            });
        });

        it('deve usar SMTP_USER como fallback quando SMTP_FROM não está definido', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';

            mockConfigService.get
                .mockReturnValueOnce(undefined) // SMTP_FROM (não definido)
                .mockReturnValueOnce('user@example.com'); // SMTP_USER (fallback)

            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await service.sendEmail(to, subject, htmlContent, textContent);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: '"JCoder" <user@example.com>',
                }),
            );
        });

        it('deve adicionar logo como anexo quando arquivo existe', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';

            mockConfigService.get
                .mockReturnValueOnce('sender@example.com') // SMTP_FROM
                .mockReturnValueOnce('user@example.com'); // SMTP_USER

            const logoPath = path.join(__dirname, 'assets', 'jcoder-logo.png');
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            await service.sendEmail(to, subject, htmlContent, textContent);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    attachments: [
                        {
                            filename: 'jcoder-logo.png',
                            path: logoPath,
                            cid: 'logo',
                        },
                    ],
                }),
            );
        });

        it('não deve adicionar logo quando arquivo não existe', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';

            mockConfigService.get
                .mockReturnValueOnce('sender@example.com') // SMTP_FROM
                .mockReturnValueOnce('user@example.com'); // SMTP_USER

            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await service.sendEmail(to, subject, htmlContent, textContent);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    attachments: [],
                }),
            );
        });

        it('deve lançar erro quando envio falhar', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';
            const error = new Error('SMTP Error');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            mockConfigService.get
                .mockReturnValueOnce('sender@example.com') // SMTP_FROM
                .mockReturnValueOnce('user@example.com'); // SMTP_USER

            (fs.existsSync as jest.Mock).mockReturnValue(false);
            mockTransporter.sendMail.mockRejectedValue(error);

            await expect(service.sendEmail(to, subject, htmlContent, textContent)).rejects.toThrow(
                error,
            );

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending email:', error);

            consoleErrorSpy.mockRestore();
        });

        it('deve formatar from corretamente com SMTP_FROM', async () => {
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<html><body>Test</body></html>';
            const textContent = 'Test';

            mockConfigService.get
                .mockReturnValueOnce('noreply@example.com') // SMTP_FROM
                .mockReturnValueOnce('user@example.com'); // SMTP_USER

            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await service.sendEmail(to, subject, htmlContent, textContent);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: '"JCoder" <noreply@example.com>',
                }),
            );
        });
    });
});

