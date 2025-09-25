import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const DesktopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { name: 'light', icon: <SunIcon /> },
        { name: 'dark', icon: <MoonIcon /> },
        { name: 'system', icon: <DesktopIcon /> },
    ];

    return (
        <div className="flex items-center justify-center space-x-1 rounded-lg bg-background p-1 border border-border">
            {themes.map((t) => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name as 'light' | 'dark' | 'system')}
                    className={`flex-1 flex justify-center items-center p-2 rounded-md transition-colors duration-200 text-sm capitalize ${
                        theme === t.name
                            ? 'bg-surface shadow-sm text-primary'
                            : 'text-text-secondary hover:bg-surface/50'
                    }`}
                    aria-label={`Switch to ${t.name} theme`}
                >
                    {t.icon}
                </button>
            ))}
        </div>
    );
};
