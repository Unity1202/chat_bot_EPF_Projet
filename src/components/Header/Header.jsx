import React from 'react';
import LogoClient from './LogoClient';
import LogoJuridica from './LogoJuridica';
import LogoModeSombre from './LogoModeSombre';
import UserAvatar from './UserAvatar';
import { cn } from "../../lib/utils";

const Header = ({ className }) => {
    return (
        <header className={cn(
            "sticky top-0 z-50 flex h-16 items-center justify-between bg-[#16698C]",
            "md:ml-[calc(16rem+0.5rem)] md:mr-2 md:mt-2 md:w-[calc(100%-16.5rem-0.5rem)] md:rounded-2xl",
            className
        )}>
            <div className="flex items-center">
                <LogoJuridica />
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <LogoClient />
            </div>
            <div className="flex items-center gap-2 mr-4">
                <LogoModeSombre />
                <UserAvatar />
            </div>
        </header>
    );
};

export default Header;