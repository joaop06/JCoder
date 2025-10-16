"use client";

import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({
    className = '',
    showLabel = false,
    size = 'md'
}: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`
        ${sizeClasses[size]}
        relative rounded-lg border border-jcoder 
        bg-jcoder-card hover:bg-jcoder-secondary 
        text-jcoder-muted hover:text-jcoder-primary
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:ring-offset-2
        focus:ring-offset-background
        ${className}
      `}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
            {/* Sun icon for light theme */}
            <svg
                className={`
          ${iconSizes[size]} absolute inset-0 m-auto transition-all duration-300
          ${theme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 rotate-90 scale-75'
                    }
        `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Moon icon for dark theme */}
            <svg
                className={`
          ${iconSizes[size]} absolute inset-0 m-auto transition-all duration-300
          ${theme === 'light'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-75'
                    }
        `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>

            {/* Label if requested */}
            {showLabel && (
                <span className="sr-only">
                    {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                </span>
            )}
        </button>
    );
}
