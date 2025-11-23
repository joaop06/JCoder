"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessageUseCase = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const messages_service_1 = require("../messages.service");
const users_service_1 = require("../../users/users.service");
const email_service_1 = require("../../../email/email.service");
const email_template_1 = require("../../../email/templates/email-template");
let CreateMessageUseCase = class CreateMessageUseCase {
    constructor(emailService, usersService, configService, messagesService) {
        this.emailService = emailService;
        this.usersService = usersService;
        this.configService = configService;
        this.messagesService = messagesService;
    }
    async execute(username, createMessageDto) {
        await this.messagesService.create(username, createMessageDto);
        const user = await this.usersService.findOneBy({ username });
        if (user?.email) {
            try {
                const frontendBaseUrl = this.configService.get('FRONTEND_BASE_URL') || '';
                const portfolioUrl = frontendBaseUrl ? `${frontendBaseUrl}/${username}` : undefined;
                await this.sendMessageNotificationEmail(user.email, user.fullName || user.firstName || user.username, createMessageDto.senderName, createMessageDto.senderEmail, createMessageDto.message, portfolioUrl);
            }
            catch (error) {
                console.error('Error sending notification email:', error);
            }
        }
    }
    async sendMessageNotificationEmail(to, adminName, senderName, senderEmail, message, portfolioUrl) {
        const subject = `New message received on your portfolio - ${senderName}`;
        const messageBox = email_template_1.EmailTemplate.createMessageBox(senderName, senderEmail, message);
        let content = `
            <p style="margin: 0 0 20px 0;">Hello <strong>${adminName}</strong>,</p>
            <p style="margin: 0 0 20px 0;">You have received a new message through your portfolio:</p>
            ${messageBox}
        `;
        if (portfolioUrl) {
            content += email_template_1.EmailTemplate.createButton('View Portfolio', portfolioUrl);
        }
        const frontendBaseUrl = this.configService.get('FRONTEND_BASE_URL') || undefined;
        const htmlContent = email_template_1.EmailTemplate.generateHTML({
            title: 'New Message Received',
            content,
            frontendBaseUrl,
        });
        const textContent = email_template_1.EmailTemplate.generateText(`New message received on your portfolio - ${senderName}`, `Hello ${adminName},\n\nYou have received a new message through your portfolio:\n\nFrom: ${senderName} (${senderEmail})\n\nMessage:\n${message}\n\n${portfolioUrl ? `Access your portfolio: ${portfolioUrl}` : ''}`);
        await this.emailService.sendEmail(to, subject, htmlContent, textContent);
    }
};
exports.CreateMessageUseCase = CreateMessageUseCase;
exports.CreateMessageUseCase = CreateMessageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        users_service_1.UsersService,
        config_1.ConfigService,
        messages_service_1.MessagesService])
], CreateMessageUseCase);
;
//# sourceMappingURL=create-message.use-case.js.map