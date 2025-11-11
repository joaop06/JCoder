import React, { ReactNode } from 'react';
import { TableSkeleton } from '@/components/ui';
import { Pagination } from '@/components/pagination/Pagination';

interface ManagementTableProps<T> {
    // Header Props
    title: string;
    subtitle: string;
    actionButton?: {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
    };

    // Table Props
    columns: {
        label: string;
        className?: string;
    }[];
    data: T[];
    loading: boolean;
    error?: string | null;

    // Row Renderers
    renderDesktopRow: (item: T, index: number) => ReactNode;
    renderMobileCard: (item: T, index: number) => ReactNode;

    // Empty State
    emptyState?: {
        icon?: string;
        message: string;
        actionButton?: {
            label: string;
            onClick: () => void;
        };
    };

    // Pagination Props
    paginationMeta?: any;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;

    // Error State
    onRetry?: () => void;
}

export function ManagementTable<T>({
    title,
    subtitle,
    actionButton,
    columns,
    data,
    loading,
    error,
    renderDesktopRow,
    renderMobileCard,
    emptyState,
    paginationMeta,
    onPageChange,
    onLimitChange,
    onRetry,
}: ManagementTableProps<T>) {
    return (
        <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-jcoder">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-jcoder-foreground mb-1">{title}</h2>
                        <p className="text-xs sm:text-sm text-jcoder-muted">{subtitle}</p>
                    </div>
                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 font-semibold text-sm sm:text-base transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group w-full sm:w-auto"
                        >
                            <span className="group-hover:rotate-90 transition-transform">
                                {actionButton.icon}
                            </span>
                            {actionButton.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-4 sm:p-6">
                    <TableSkeleton />
                </div>
            ) : error ? (
                <div className="text-center p-8 sm:p-12">
                    <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            ) : data.length === 0 ? (
                <div className="text-center p-8 sm:p-12">
                    {emptyState?.icon && <div className="text-4xl sm:text-6xl mb-4">{emptyState.icon}</div>}
                    <p className="text-jcoder-muted text-base sm:text-lg mb-4">
                        {emptyState?.message || 'No data found.'}
                    </p>
                    {emptyState?.actionButton && (
                        <button
                            onClick={emptyState.actionButton.onClick}
                            className="px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium text-sm sm:text-base"
                        >
                            {emptyState.actionButton.label}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-jcoder-secondary via-jcoder-secondary/80 to-jcoder-secondary border-b-2 border-jcoder-primary/30">
                                    {columns.map((column, index) => (
                                        <th
                                            key={index}
                                            className={`${column.className || 'px-4 py-4 text-left text-sm font-semibold text-jcoder-foreground'} relative`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
                                                    {column.label}
                                                </span>
                                            </div>
                                            {index < columns.length - 1 && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-jcoder/30" />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jcoder/50">
                                {data.map((item, index) => renderDesktopRow(item, index))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 p-3 sm:p-4">
                        {data.map((item, index) => renderMobileCard(item, index))}
                    </div>

                    {/* Pagination */}
                    {paginationMeta && onPageChange && onLimitChange && (
                        <div className="border-t border-jcoder">
                            <Pagination
                                meta={paginationMeta}
                                onPageChange={onPageChange}
                                onLimitChange={onLimitChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

