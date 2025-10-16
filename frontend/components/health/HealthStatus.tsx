'use client';

import React, { useState, useEffect } from 'react';
import { HealthService, HealthStatus } from '@/services/health.service';

interface HealthStatusProps {
    showDetails?: boolean;
    className?: string;
}

export const HealthStatusComponent: React.FC<HealthStatusProps> = ({
    showDetails = false,
    className = ''
}) => {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                setLoading(true);
                setError(null);
                const healthData = await HealthService.checkHealth();
                setHealth(healthData);
            } catch (err) {
                setError('Failed to check health status');
                console.error('Health check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkHealth();

        // Check health every 30 seconds
        const interval = setInterval(checkHealth, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Checking...</span>
            </div>
        );
    }

    if (error || !health) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-500">Offline</span>
            </div>
        );
    }

    const isHealthy = health.status === 'ok';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${isHealthy ? 'text-green-500' : 'text-red-500'}`}>
                {isHealthy ? 'Online' : 'Issues'}
            </span>

            {showDetails && (
                <div className="ml-4 text-xs text-gray-500">
                    {Object.entries(health.details || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                            <span>{key}:</span>
                            <span className={value?.status === 'up' ? 'text-green-500' : 'text-red-500'}>
                                {value?.status || 'unknown'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
