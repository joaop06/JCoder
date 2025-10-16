import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

export const loggerConfig: WinstonModuleOptions = {
    level: process.env['LOG_LEVEL'] || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint(),
    ),
    defaultMeta: {
        service: 'jcoder-backend',
        version: process.env['npm_package_version'] || '1.0.0',
    },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                    const contextStr = context ? `[${context}]` : '';
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
                }),
            ),
        }),

        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),

        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],

    // Exception handling
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
    ],

    // Rejection handling
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
    ],
};
