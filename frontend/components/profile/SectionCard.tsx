'use client';

import { ReactNode, useState } from 'react';

interface SectionCardProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    action?: ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    emptyMessage?: string;
    isEmpty?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    icon,
    children,
    action,
    collapsible = false,
    defaultExpanded = true,
    emptyMessage = 'No data available',
    isEmpty = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-jcoder">
                <div
                    className={`flex items-center gap-3 ${collapsible ? 'cursor-pointer flex-1' : ''}`}
                    onClick={() => collapsible && setIsExpanded(!isExpanded)}
                >
                    {icon && (
                        <div className="text-jcoder-primary">
                            {icon}
                        </div>
                    )}
                    <h3 className="text-lg md:text-xl font-semibold text-jcoder-foreground">
                        {title}
                    </h3>
                    {collapsible && (
                        <svg
                            className={`w-5 h-5 text-jcoder-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
                {action && (
                    <div className="ml-4">
                        {action}
                    </div>
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 md:p-6">
                    {isEmpty ? (
                        <div className="text-center py-8">
                            <p className="text-jcoder-muted">{emptyMessage}</p>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            )}
        </div>
    );
};

