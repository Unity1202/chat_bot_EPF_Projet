import React from 'react';
import LogoClient from './LogoClient';
import LogoJuridica from './LogoJuridica';
import LogoModeSombre from './LogoModeSombre';
import UserAvatar from './UserAvatar';
import { cn } from "../../lib/utils";
import { Shield, FileText } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ className }) => {
    const { isAdmin } = useAuth();
    
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
            </div>            <div className="flex items-center gap-4 mr-4">
                <a 
                  href="/document-analyzer"
                  className="flex items-center px-3 py-1 text-white bg-[#0C3B5E] rounded hover:bg-[#0A304D]"
                >
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8h-9.5m7.5 4h-7.5m5.5 4h-5.5M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 2v6h6M18 2l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium">Analyser un Document</span>
                </a>
                {isAdmin && (
                  <a 
                    href="/admin"
                    className="flex items-center px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Admin</span>
                  </a>
                )}
                <LogoModeSombre />
                <UserAvatar />
            </div>
        </header>
    );
};

export default Header;