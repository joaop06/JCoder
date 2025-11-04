'use client';

import React from 'react';
import { PaginationMeta } from '@/types/api/pagination.dto';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    meta,
    onPageChange,
    onLimitChange
}) => {
    const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = meta;

    const handlePrevious = () => {
        if (hasPreviousPage) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage) {
            onPageChange(page + 1);
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onLimitChange) {
            onLimitChange(parseInt(e.target.value));
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination-container flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-jcoder-card border-t border-jcoder">
            {/* Results info */}
            <div className="pagination-info text-sm text-jcoder-muted">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Items per page */}
                {onLimitChange && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="limit" className="pagination-label text-sm text-jcoder-muted">
                            Show:
                        </label>
                        <select
                            id="limit"
                            value={limit}
                            onChange={handleLimitChange}
                            className="pagination-select px-2 py-1 border border-jcoder rounded text-sm bg-jcoder-secondary text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                )}

                {/* Previous button */}
                <button
                    onClick={handlePrevious}
                    disabled={!hasPreviousPage}
                    className="pagination-button px-3 py-1 text-sm border border-jcoder rounded bg-jcoder-secondary text-jcoder-foreground hover:bg-jcoder-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`pagination-button px-3 py-1 text-sm border rounded transition-colors ${pageNum === page
                                ? 'pagination-button-active bg-jcoder-primary text-black border-jcoder-primary'
                                : 'border-jcoder bg-jcoder-secondary text-jcoder-foreground hover:bg-jcoder-secondary/80'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={handleNext}
                    disabled={!hasNextPage}
                    className="pagination-button px-3 py-1 text-sm border border-jcoder rounded bg-jcoder-secondary text-jcoder-foreground hover:bg-jcoder-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
