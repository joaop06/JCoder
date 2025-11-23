export declare class PortfolioEngagementStatsDto {
    totalViews: number;
    uniqueVisitors: number;
    ownerViews: number;
    dailyStats: Array<{
        date: string;
        views: number;
        uniqueVisitors: number;
    }>;
    topCountries: Array<{
        country: string;
        count: number;
    }>;
    topReferers: Array<{
        referer: string;
        count: number;
    }>;
}
