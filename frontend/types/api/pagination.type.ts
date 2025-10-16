export interface PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    timestamp: string;
    path: string;
}
