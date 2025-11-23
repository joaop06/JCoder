import { User } from '../../administration-by-user/users/entities/user.entity';
export declare class PortfolioView {
    id: number;
    userId: number;
    user?: User;
    ipAddress?: string;
    fingerprint?: string;
    userAgent?: string;
    referer?: string;
    isOwner: boolean;
    country?: string;
    city?: string;
    createdAt: Date;
}
