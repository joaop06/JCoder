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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionMiddleware = exports.SecurityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SecurityMiddleware = class SecurityMiddleware {
    constructor(configService) {
        this.configService = configService;
    }
    use(req, res, next) {
        const backendUrl = this.configService.get('BACKEND_BASE_URL') ||
            `http://localhost:${this.configService.get('BACKEND_PORT')}`;
        (0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:", backendUrl],
                    connectSrc: ["'self'", backendUrl],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" },
        })(req, res, next);
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityMiddleware);
let CompressionMiddleware = class CompressionMiddleware {
    use(req, res, next) {
        (0, compression_1.default)()(req, res, next);
    }
};
exports.CompressionMiddleware = CompressionMiddleware;
exports.CompressionMiddleware = CompressionMiddleware = __decorate([
    (0, common_1.Injectable)()
], CompressionMiddleware);
//# sourceMappingURL=security.middleware.js.map