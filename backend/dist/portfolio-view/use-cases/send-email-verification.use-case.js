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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailVerificationUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const email_service_1 = require("../../email/email.service");
const email_verification_entity_1 = require("../entities/email-verification.entity");
const users_service_1 = require("../../administration-by-user/users/users.service");
const email_already_exists_exception_1 = require("../../administration-by-user/users/exceptions/email-already-exists.exception");
const email_template_1 = require("../../email/templates/email-template");
let SendEmailVerificationUseCase = class SendEmailVerificationUseCase {
    constructor(emailVerificationRepository, emailService, usersService) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
        this.usersService = usersService;
    }
    async execute(dto) {
        const { email } = dto;
        const emailExists = await this.usersService.existsBy({ email });
        if (emailExists) {
            throw new email_already_exists_exception_1.EmailAlreadyExistsException();
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        await this.emailVerificationRepository.delete({
            email,
            verified: false,
        });
        const verification = this.emailVerificationRepository.create({
            email,
            code,
            verified: false,
            expiresAt,
        });
        await this.emailVerificationRepository.save(verification);
        const codeBox = email_template_1.EmailTemplate.createCodeBox(code);
        const content = `
      <p style="margin: 0 0 20px 0;">Hello,</p>
      <p style="margin: 0 0 20px 0;">Use the code below to verify your email:</p>
      ${codeBox}
      <p style="margin: 20px 0 0 0;">This code expires in <strong>15 minutes</strong>.</p>
      <p style="margin: 15px 0 0 0; color: #a0a0a0;">If you did not request this code, please ignore this email.</p>
    `;
        const htmlContent = email_template_1.EmailTemplate.generateHTML({
            title: 'Email Verification',
            content,
        });
        const textContent = email_template_1.EmailTemplate.generateText('Email Verification - JCoder', `Hello,\n\nUse the code below to verify your email:\n\n${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this code, please ignore this email.`);
        try {
            await this.emailService.sendEmail(email, 'Email Verification - JCoder', htmlContent, textContent);
        }
        catch (error) {
            await this.emailVerificationRepository.delete({ id: verification.id });
            throw error;
        }
        return { message: 'Verification code sent successfully' };
    }
};
exports.SendEmailVerificationUseCase = SendEmailVerificationUseCase;
exports.SendEmailVerificationUseCase = SendEmailVerificationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(email_verification_entity_1.EmailVerification)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        email_service_1.EmailService,
        users_service_1.UsersService])
], SendEmailVerificationUseCase);
//# sourceMappingURL=send-email-verification.use-case.js.map