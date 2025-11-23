"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const nodemailer = __importStar(require("nodemailer"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        const smtpSecure = this.configService.get('SMTP_SECURE');
        const port = this.configService.get('SMTP_PORT') || 587;
        let isSecure;
        if (port === 465) {
            isSecure = true;
        }
        else if (port === 587) {
            isSecure = false;
        }
        else {
            isSecure = smtpSecure === 'true' || smtpSecure === '1';
        }
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
            port,
            secure: isSecure,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendEmail(to, subject, htmlContent, textContent) {
        try {
            const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER');
            const logoPath = path.join(__dirname, 'assets', 'jcoder-logo.png');
            const attachments = [];
            if (fs.existsSync(logoPath)) {
                attachments.push({
                    filename: 'jcoder-logo.png',
                    path: logoPath,
                    cid: 'logo',
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
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
;
//# sourceMappingURL=email.service.js.map