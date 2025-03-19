import React from 'react';
import LogoClient from './LogoClient';
import LogoJuridica from './LogoJuridica';
import LogoModeSombre from './LogoModeSombre';
import { cn } from "../../lib/utils";

const Header = ({ className }) => {
    return (
        <header className={cn(
            "sticky top-0 z-50 flex h-16 w-screen shrink-0 items-center justify-between bg-[#16698C]",
            className
        )}>
            <div className="flex items-center">
                <LogoJuridica />
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <LogoClient />
            </div>
            <LogoModeSombre />
        </header>
    );
};

export default Header;