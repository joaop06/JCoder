'use client';

import { ReactNode } from 'react';

interface InfoFieldProps {
    label: string;
    value?: string | ReactNode;
    icon?: ReactNode;
    editable?: boolean;
    onEdit?: () => void;
}

export const InfoField: React.FC<InfoFieldProps> = ({
    label,
    value,
    icon,
    editable = false,
    onEdit,
}) => {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-jcoder-secondary transition-colors group">
            {icon && (
                <div className="text-jcoder-muted mt-1">
                    {icon}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-jcoder-muted mb-1">{label}</p>
                {typeof value === 'string' ? (
                    <p className="text-sm md:text-base text-jcoder-foreground break-words">
                        {value || '-'}
                    </p>
                ) : (
                    value || <span className="text-jcoder-muted">-</span>
                )}
            </div>
            {editable && onEdit && (
                <button
                    onClick={onEdit}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-jcoder rounded"
                >
                    <svg className="w-4 h-4 text-jcoder-muted hover:text-jcoder-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

