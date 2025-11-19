export interface PaginationMeta {
    page: number;

    limit: number;

    total: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
};

export interface PaginationDto {
    page?: number;

    limit?: number;

    sortBy?: string;

    sortOrder?: 'ASC' | 'DESC';

    isActive?: boolean;
};

export interface PaginatedResponseDto<T> {
    data: T[];

    meta?: PaginationMeta;
};
