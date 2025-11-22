import { EmailTemplate, EmailTemplateOptions } from './email-template';

describe('EmailTemplate', () => {
    describe('generateHTML', () => {
        it('deve gerar HTML com título e conteúdo', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('Test Title');
            expect(html).toContain('<p>Test content</p>');
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
        });

        it('deve usar footer padrão quando não fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain(
                'This is an automatic notification from the JCoder system. Please do not reply to this email directly.',
            );
        });

        it('deve usar footer customizado quando fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
                footerText: 'Custom footer text',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('Custom footer text');
        });

        it('deve usar logo inline quando logoUrl não fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('cid:logo');
            expect(html).toContain('alt="JCoder"');
        });

        it('deve usar logoUrl quando fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
                logoUrl: 'https://example.com/logo.png',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('https://example.com/logo.png');
            expect(html).not.toContain('cid:logo');
        });

        it('deve incluir link para frontend quando frontendBaseUrl fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
                frontendBaseUrl: 'https://example.com',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('https://example.com');
            expect(html).toContain('Visit JCoder');
        });

        it('não deve incluir link para frontend quando frontendBaseUrl não fornecido', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).not.toContain('Visit JCoder');
        });

        it('deve incluir meta tags corretas', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('<meta charset="utf-8">');
            expect(html).toContain('<meta name="viewport"');
            expect(html).toContain('<title>Test Title</title>');
        });

        it('deve usar cores da marca corretamente', () => {
            const options: EmailTemplateOptions = {
                title: 'Test Title',
                content: '<p>Test content</p>',
            };

            const html = EmailTemplate.generateHTML(options);

            expect(html).toContain('#00c8ff'); // cyan
            expect(html).toContain('#0050a0'); // blue
            expect(html).toContain('#000000'); // black
            expect(html).toContain('#0a0a0a'); // card
        });
    });

    describe('generateText', () => {
        it('deve gerar texto simples com título e conteúdo', () => {
            const title = 'Test Title';
            const content = 'Test content';

            const text = EmailTemplate.generateText(title, content);

            expect(text).toContain('Test Title');
            expect(text).toContain('Test content');
        });

        it('deve usar footer padrão quando não fornecido', () => {
            const title = 'Test Title';
            const content = 'Test content';

            const text = EmailTemplate.generateText(title, content);

            expect(text).toContain(
                'This is an automatic notification from the JCoder system. Please do not reply to this email directly.',
            );
        });

        it('deve usar footer customizado quando fornecido', () => {
            const title = 'Test Title';
            const content = 'Test content';
            const footerText = 'Custom footer';

            const text = EmailTemplate.generateText(title, content, footerText);

            expect(text).toContain('Custom footer');
        });

        it('deve incluir separador', () => {
            const title = 'Test Title';
            const content = 'Test content';

            const text = EmailTemplate.generateText(title, content);

            expect(text).toContain('---');
        });
    });

    describe('createCodeBox', () => {
        it('deve criar caixa de código com código fornecido', () => {
            const code = '123456';

            const codeBox = EmailTemplate.createCodeBox(code);

            expect(codeBox).toContain('123456');
            expect(codeBox).toContain('<table');
            expect(codeBox).toContain('font-family: \'JetBrains Mono\'');
        });

        it('deve usar cor cyan para o código', () => {
            const code = '123456';

            const codeBox = EmailTemplate.createCodeBox(code);

            expect(codeBox).toContain('#00c8ff');
        });

        it('deve ter espaçamento de letras para o código', () => {
            const code = '123456';

            const codeBox = EmailTemplate.createCodeBox(code);

            expect(codeBox).toContain('letter-spacing: 8px');
        });
    });

    describe('createMessageBox', () => {
        it('deve criar caixa de mensagem com informações do remetente', () => {
            const senderName = 'John Doe';
            const senderEmail = 'john@example.com';
            const message = 'Test message';

            const messageBox = EmailTemplate.createMessageBox(senderName, senderEmail, message);

            expect(messageBox).toContain('John Doe');
            expect(messageBox).toContain('john@example.com');
            expect(messageBox).toContain('Test message');
        });

        it('deve converter quebras de linha em <br>', () => {
            const senderName = 'John Doe';
            const senderEmail = 'john@example.com';
            const message = 'Line 1\nLine 2\nLine 3';

            const messageBox = EmailTemplate.createMessageBox(senderName, senderEmail, message);

            expect(messageBox).toContain('Line 1<br>');
            expect(messageBox).toContain('Line 2<br>');
            expect(messageBox).toContain('Line 3');
        });

        it('deve usar cor cyan para a borda', () => {
            const senderName = 'John Doe';
            const senderEmail = 'john@example.com';
            const message = 'Test message';

            const messageBox = EmailTemplate.createMessageBox(senderName, senderEmail, message);

            expect(messageBox).toContain('#00c8ff');
        });
    });

    describe('createButton', () => {
        it('deve criar botão com texto e URL', () => {
            const text = 'Click Here';
            const url = 'https://example.com';

            const button = EmailTemplate.createButton(text, url);

            expect(button).toContain('Click Here');
            expect(button).toContain('https://example.com');
            expect(button).toContain('<a href');
        });

        it('deve usar gradiente cyan para o botão', () => {
            const text = 'Click Here';
            const url = 'https://example.com';

            const button = EmailTemplate.createButton(text, url);

            expect(button).toContain('#00c8ff');
            expect(button).toContain('#0050a0');
        });

        it('deve ter estilo de botão correto', () => {
            const text = 'Click Here';
            const url = 'https://example.com';

            const button = EmailTemplate.createButton(text, url);

            expect(button).toContain('border-radius: 8px');
            expect(button).toContain('font-weight: 600');
        });
    });
});

