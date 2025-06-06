import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { LogOut, Shield, Check } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

const LogoutMenu = ({ children, onLogout, user }) => {
    const { isAdmin } = useAuth();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                                {user?.firstName} {user?.lastName}
                            </p>
                            {isAdmin && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    <Check className="mr-1 h-3 w-3" />
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                    <DropdownMenuItem className="cursor-pointer">
                        <a href="/admin" className="flex w-full items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Administration</span>
                        </a>
                    </DropdownMenuItem>
                )}
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