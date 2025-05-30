import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield } from "lucide-react";
import { Link } from 'react-router-dom';

const LogoutMenu = ({ children, onLogout, user }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                console.log("Vérification des droits admin...");
                const response = await fetch('http://localhost:8000/api/auth/check-admin', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Réponse admin:", data);
                    setIsAdmin(data.is_admin === true);
                } else {
                    console.log("Réponse non OK pour check-admin:", response.status);
                }
            } catch (error) {
                console.error("Erreur lors de la vérification des privilèges admin:", error);
            }
        };

        checkAdmin();
    }, []);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                </DropdownMenuItem>                <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                </DropdownMenuItem>
                
                {isAdmin && (
                    <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link to="/admin" className="flex w-full items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Administration</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-500" 
                    onClick={onLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LogoutMenu;