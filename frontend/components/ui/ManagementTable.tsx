import React, { ReactNode } from 'react';
import { Pagination } from '@/components/pagination/Pagination';
import { TableSkeleton } from '@/components/ui';

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
            <div className="p-6 border-b border-jcoder">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-jcoder-foreground mb-1">{title}</h2>
                        <p className="text-sm text-jcoder-muted">{subtitle}</p>
                    </div>
                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            {actionButton.icon}
                            {actionButton.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-6">
                    <TableSkeleton />
                </div>
            ) : error ? (
                <div className="text-center p-12">
                    <p className="text-red-400 mb-4">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            ) : data.length === 0 ? (
                <div className="text-center p-12">
                    {emptyState?.icon && <div className="text-6xl mb-4">{emptyState.icon}</div>}
                    <p className="text-jcoder-muted text-lg mb-4">
                        {emptyState?.message || 'No data found.'}
                    </p>
                    {emptyState?.actionButton && (
                        <button
                            onClick={emptyState.actionButton.onClick}
                            className="px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
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
                            <thead className="bg-jcoder-secondary border-b border-jcoder">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th
                                            key={index}
                                            className={column.className || 'px-4 py-4 text-left text-sm font-semibold text-jcoder-foreground'}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jcoder">
                                {data.map((item, index) => renderDesktopRow(item, index))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-jcoder">
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

