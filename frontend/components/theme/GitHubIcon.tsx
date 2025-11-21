'use client';

import { useTheme } from './ThemeContext';

interface GitHubIconProps {
    className?: string;
    alt?: string;
}

export default function GitHubIcon({ className = "w-6 h-6", alt = "GitHub" }: GitHubIconProps) {
    const { theme } = useTheme();

    // Applies dark:invert only when theme is dark
    const iconClassName = theme === 'dark'
        ? `${className} invert`
        : className;

    return (
        <img
            src="/images/icons/github.png"
            alt={alt}
            className={iconClassName}
        />
    );
}
