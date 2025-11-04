import {
    Logger,
    Injectable,
    CallHandler,
    NestInterceptor,
    ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const { method, url, body, query, params, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const ip = request.ip || request.connection.remoteAddress;

        const startTime = Date.now();

        // Log request
        this.logger.log({
            ip,
            url,
            query,
            method,
            params,
            userAgent,
            message: 'Incoming request',
            body: this.sanitizeBody(body),
            userId: (request as any).user?.userId,
        });

        return next.handle().pipe(
            tap((data) => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                // Log response
                this.logger.log({
                    message: 'Request completed',
                    method,
                    url,
                    statusCode: response.statusCode,
                    duration: `${duration}ms`,
                    responseSize: JSON.stringify(data).length,
                });
            }),
            catchError((error) => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                // Log error
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
            }),
        );
    }

    private sanitizeBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };

        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}
