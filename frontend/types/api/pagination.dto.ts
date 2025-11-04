export interface PaginationDto {
    page?: number;

    limit?: number;

    sortBy?: string;

    sortOrder?: 'ASC' | 'DESC';
};

export interface PaginatedResponseDto<T> {
    data: T[];

    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};
