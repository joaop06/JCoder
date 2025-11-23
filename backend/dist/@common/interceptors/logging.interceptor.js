"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, body, query, params, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const ip = request.ip || request.connection.remoteAddress;
        const startTime = Date.now();
        this.logger.log({
            ip,
            url,
            query,
            method,
            params,
            userAgent,
            message: 'Incoming request',
            body: this.sanitizeBody(body),
            userId: request.user?.userId,
        });
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.log({
                message: 'Request completed',
                method,
                url,
                statusCode: response.statusCode,
                duration: `${duration}ms`,
                responseSize: JSON.stringify(data).length,
            });
        }), (0, operators_1.catchError)((error) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.error({
                message: 'Request failed',
                method,
                url,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`,
                statusCode: error.status || 500,
            });
            throw error;
        }));
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map