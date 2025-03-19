"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Appliquer la classe dark au body quand nécessaire
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme) => {
            setTheme(newTheme);
        },
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 