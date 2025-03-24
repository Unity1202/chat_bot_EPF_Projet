import React, { useState } from 'react';
import LoginDialog from './LoginDialog';
import LogoutMenu from './LogoutMenu';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { User } from "lucide-react";

const UserAvatar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = (email, password) => {
        console.log('Tentative de connexion avec:', email, password);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const renderAvatar = () => {
        if (!isLoggedIn) {
            return (
                <Avatar className="cursor-pointer">
                    <AvatarFallback className="bg-[#FFFFFF] text-[#16698C]">
                        <User className="h-6 w-6" />
                    </AvatarFallback>
                </Avatar>
            );
        }

        return (
            <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        );
    };

    if (!isLoggedIn) {
        return (
            <LoginDialog onLogin={handleLogin}>
                {renderAvatar()}
            </LoginDialog>
        );
    }

    return (
        <LogoutMenu onLogout={handleLogout}>
            {renderAvatar()}
        </LogoutMenu>
    );
};

export default UserAvatar; 