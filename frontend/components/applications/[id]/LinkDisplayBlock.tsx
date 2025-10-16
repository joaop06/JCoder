'use client';
import React from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';

interface LinkDisplayBlockProps {
    label: string;
    url: string;
    icon?: React.ReactNode;
    showActionButton?: boolean;
    actionLabel?: string;
    actionIcon?: React.ReactNode;
    className?: string;
}

const LinkDisplayBlock: React.FC<LinkDisplayBlockProps> = ({
    label,
    url,
    icon,
    showActionButton = true,
    actionLabel = 'Access',
    actionIcon,
    className = '',
}) => {
    return (
        <div className={`bg-jcoder-card border border-jcoder rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon container similar to the image */}
                    <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                        {icon || (
                            <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-jcoder-muted mb-1">{label}</p>
                        <p className="text-white break-all text-sm">{url}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <CopyToClipboardButton
                        textToCopy={url}
                        className="!px-3 !py-1.5 !text-sm !text-gray-300 !border-gray-400 !text-gray-300 hover:!text-white hover:!border-white"
                        label="Copy"
                    />

                    {showActionButton && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-jcoder-primary text-jcoder-primary rounded-md text-sm font-medium hover:bg-jcoder-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-jcoder-primary transition-colors"
                        >
                            {actionIcon || (
                                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            )}
                            {actionLabel}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkDisplayBlock;
