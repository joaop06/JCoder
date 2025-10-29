'use client';

import { memo } from 'react';

/**
 * TableSkeleton Component - Generic Skeleton Loader for Tables
 * 
 * Features:
 * - Responsive design with separate desktop and mobile views
 * - Customizable number of rows
 * - Customizable columns configuration
 * - Animated pulse effect
 * 
 * @example
 * ```tsx
 * <TableSkeleton
 *   rows={5}
 *   columns={[
 *     { width: 'w-16', align: 'center' },
 *     { width: 'w-32', align: 'left' },
 *     { width: 'w-24', align: 'center' }
 *   ]}
 *   mobileRows={3}
 * />
 * ```
 */

export interface TableSkeletonColumn {
    /** Width class for the skeleton element */
    width: string;
    /** Alignment of the column */
    align?: 'left' | 'center' | 'right';
    /** Custom height class (optional) */
    height?: string;
    /** Whether to show a circular skeleton (useful for avatars) */
    circular?: boolean;
}

export interface TableSkeletonProps {
    /** Number of skeleton rows to display on desktop */
    rows?: number;
    /** Number of skeleton rows to display on mobile */
    mobileRows?: number;
    /** Configuration for each column */
    columns?: TableSkeletonColumn[];
    /** Custom header columns (if different from body) */
    headerColumns?: string[];
    /** Whether to show the table header */
    showHeader?: boolean;
    /** Custom container class */
    containerClass?: string;
}

export const TableSkeleton = memo(({
    rows = 5,
    mobileRows,
    columns = [
        { width: 'w-16', align: 'center' },
        { width: 'w-20', align: 'center' },
        { width: 'w-32', align: 'left' },
        { width: 'w-24', align: 'center' },
        { width: 'w-20', align: 'center' },
    ],
    headerColumns,
    showHeader = true,
    containerClass = '',
}: TableSkeletonProps) => {
    const desktopRows = Array.from({ length: rows }, (_, i) => i);
    const mobileRowsArray = Array.from({ length: mobileRows || rows }, (_, i) => i);

    const getAlignmentClass = (align?: string) => {
        switch (align) {
            case 'center':
                return 'justify-center';
            case 'right':
                return 'justify-end';
            default:
                return 'justify-start';
        }
    };

    return (
        <>
            {/* Desktop Skeleton */}
            <div className={`hidden md:block overflow-x-auto ${containerClass}`}>
                <table className="w-full">
                    {showHeader && (
                        <thead className="bg-jcoder-secondary border-b border-jcoder">
                            <tr>
                                {(headerColumns || columns).map((col, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground"
                                    >
                                        {typeof col === 'string' ? col : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody className="divide-y divide-jcoder">
                        {desktopRows.map((rowIndex) => (
                            <tr key={rowIndex} className="animate-pulse">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className={`flex items-center ${getAlignmentClass(col.align)}`}>
                                            <div
                                                className={`
                                                    ${col.circular ? 'rounded-full' : 'rounded'}
                                                    ${col.width} 
                                                    ${col.height || 'h-5'} 
                                                    bg-jcoder-secondary
                                                `}
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Skeleton */}
            <div className="md:hidden divide-y divide-jcoder">
                {mobileRowsArray.map((i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            {/* Drag handle placeholder */}
                            <div className="w-5 h-5 bg-jcoder-secondary rounded mt-2" />

                            {/* Content area */}
                            <div className="flex items-center gap-3 flex-1">
                                {/* Avatar/Image placeholder */}
                                <div className="w-12 h-12 bg-jcoder-secondary rounded-lg flex-shrink-0" />

                                {/* Text content */}
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-jcoder-secondary rounded w-3/4" />
                                    <div className="h-4 bg-jcoder-secondary rounded-full w-20" />
                                </div>
                            </div>

                            {/* Action buttons placeholder */}
                            <div className="flex gap-1">
                                <div className="w-9 h-9 bg-jcoder-secondary rounded-lg" />
                                <div className="w-9 h-9 bg-jcoder-secondary rounded-lg" />
                            </div>
                        </div>

                        {/* Additional content (like status toggle) */}
                        <div className="ml-10 mt-3">
                            <div className="h-7 bg-jcoder-secondary rounded-full w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
});

TableSkeleton.displayName = 'TableSkeleton';

export default TableSkeleton;

