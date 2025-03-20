import React from 'react';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

const LogoModeSombre = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center justify-center h-full mr-4">
            <div
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="cursor-pointer relative hover:scale-125 transition-transform duration-200"
            >
                <Sun className="h-[1.13rem] w-[1.13rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
                <Moon className="absolute top-0 left-0 h-[1.13rem] w-[1.13rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white" />
            </div>
        </div>
    );
};

export default LogoModeSombre;
