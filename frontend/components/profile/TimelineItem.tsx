'use client';

import { ReactNode } from 'react';

interface TimelineItemProps {
    title: string;
    subtitle?: string;
    period: string;
    description?: string;
    tags?: string[];
    isActive?: boolean;
    actions?: ReactNode;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
    title,
    subtitle,
    period,
    description,
    tags,
    isActive = false,
    actions,
}) => {
    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-jcoder"></div>

            {/* Timeline dot */}
            <div className={`absolute left-0 top-2 w-3 h-3 rounded-full -translate-x-1.5 ${isActive ? 'bg-jcoder-primary ring-4 ring-jcoder-primary ring-opacity-20' : 'bg-jcoder'}`}></div>

            <div className="bg-jcoder-secondary rounded-lg p-4 border border-jcoder hover:border-jcoder-primary transition-colors duration-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                        <h4 className="text-base md:text-lg font-semibold text-jcoder-foreground">
                            {title}
                        </h4>
                        {subtitle && (
                            <p className="text-sm md:text-base text-jcoder-muted mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex gap-2">
                            {actions}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-jcoder-muted">{period}</span>
                    {isActive && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-jcoder-primary bg-opacity-20 text-jcoder-primary rounded-full">
                            Current
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-sm text-jcoder-muted mt-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium bg-jcoder border border-jcoder rounded-md text-jcoder-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

