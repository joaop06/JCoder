'use client';

import { useTheme } from './ThemeContext';

interface GitHubIconProps {
    className?: string;
    alt?: string;
}

export default function GitHubIcon({ className = "w-6 h-6", alt = "GitHub" }: GitHubIconProps) {
    const { theme } = useTheme();

    // Aplica dark:invert apenas quando o tema é escuro
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
