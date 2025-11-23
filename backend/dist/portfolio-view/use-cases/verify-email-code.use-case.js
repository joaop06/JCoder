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
exports.VerifyEmailCodeUseCase = void 0;
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const email_verification_entity_1 = require("../entities/email-verification.entity");
let VerifyEmailCodeUseCase = class VerifyEmailCodeUseCase {
    constructor(emailVerificationRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
    }
    async execute(dto) {
        const { email, code } = dto;
        await this.emailVerificationRepository.delete({
            expiresAt: (0, typeorm_1.LessThan)(new Date()),
        });
        const verification = await this.emailVerificationRepository.findOne({
            where: {
                email,
                code,
                verified: false,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        if (!verification) {
            throw new common_1.BadRequestException('Invalid or expired code');
        }
        if (verification.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Expired code. Request a new code.');
        }
        verification.verified = true;
        await this.emailVerificationRepository.save(verification);
        return {
            verified: true,
            message: 'Email verified successfully',
        };
    }
};
exports.VerifyEmailCodeUseCase = VerifyEmailCodeUseCase;
exports.VerifyEmailCodeUseCase = VerifyEmailCodeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(email_verification_entity_1.EmailVerification)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], VerifyEmailCodeUseCase);
//# sourceMappingURL=verify-email-code.use-case.js.map