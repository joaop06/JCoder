"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if there is a saved theme in localStorage
        try {
            const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('jcoder-theme') as Theme : null;
            if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
                setTheme(savedTheme);
            } else if (typeof window !== 'undefined') {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(prefersDark ? 'dark' : 'light');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            setTheme('dark'); // Fallback to dark theme
        }
    }, []);

    useEffect(() => {
        if (mounted && typeof window !== 'undefined' && typeof document !== 'undefined') {
            try {
                // Apply theme to document
                document.documentElement.setAttribute('data-theme', theme);
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('jcoder-theme', theme);
            } catch (error) {
                console.error('Error applying theme:', error);
            }
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // Always render the provider, but with default theme during SSR
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
