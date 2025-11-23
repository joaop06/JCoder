export declare enum DateRangeType {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year",
    CUSTOM = "custom"
}
export declare class GetPortfolioEngagementQueryDto {
    rangeType?: DateRangeType;
    startDate?: string;
    endDate?: string;
}
