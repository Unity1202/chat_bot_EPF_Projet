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
    
    return (        <header className={cn(
            "sticky top-0 z-50 flex h-16 items-center justify-between bg-[#16698C]",
            "md:ml-[calc(16rem+0.5rem)] md:mr-2 md:mt-2 md:w-[calc(100%-16.5rem-0.5rem)] md:rounded-2xl",
            "px-4", // Ajout de padding pour éviter que le contenu touche les bords
            className
        )}>
            <div className="flex items-center">
                <LogoJuridica />
            </div>
            
            {/* Position absolue du logo au milieu pour éviter qu'il n'interfère avec les autres éléments */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <LogoClient />
            </div>
            
            {/* Augmentation du z-index et amélioration des marges pour la partie droite du header */}
            <div className="flex items-center gap-4 z-[100] mr-4 shrink-0">
                
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
                <div className="relative ml-2">
                  <UserAvatar />
                </div>
            </div>
        </header>
    );
};

export default Header;