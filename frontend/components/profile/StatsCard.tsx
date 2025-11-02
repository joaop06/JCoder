'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    color?: 'purple' | 'blue' | 'green' | 'orange';
}

export const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    label,
    value,
    color = 'purple',
}) => {
    const colorClasses = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-red-500',
    };

    return (
        <div className="bg-jcoder-card border border-jcoder rounded-lg p-4 hover:border-jcoder-primary transition-all duration-200">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-xs md:text-sm text-jcoder-muted mb-1">{label}</p>
                    <p className="text-xl md:text-2xl font-bold text-jcoder-foreground">{value}</p>
                </div>
            </div>
        </div>
    );
};

