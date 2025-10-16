import {
    Catch,
    Logger,
    HttpStatus,
    ArgumentsHost,
    HttpException,
    ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            } else {
                message = (exceptionResponse as any).message || exception.message;
                error = (exceptionResponse as any).error || exception.name;
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
        };

        // Log the error
        this.logger.error({
            message: 'Exception caught',
            statusCode: status,
            timestamp: errorResponse.timestamp,
            path: errorResponse.path,
            method: errorResponse.method,
            error: errorResponse.error,
            stack: exception instanceof Error ? exception.stack : undefined,
            userId: (request as any).user?.userId,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        });

        response.status(status).json(errorResponse);
    }
}
