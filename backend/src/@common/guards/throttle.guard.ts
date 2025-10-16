import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected override getTracker(req: Record<string, any>): Promise<string> {
        // Use IP address and user ID if available for more precise rate limiting
        const userId = req['user']?.userId;
        const ip = req['ip'] || req['connection']?.remoteAddress;

        return Promise.resolve(userId ? `${ip}-${userId}` : ip);
    }
}
