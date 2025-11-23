import { Request, Response, NextFunction } from 'express';
import { NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SecurityMiddleware implements NestMiddleware {
    private readonly configService;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class CompressionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
