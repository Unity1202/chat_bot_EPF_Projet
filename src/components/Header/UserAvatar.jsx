import React from 'react';
import LoginDialog from './LoginDialog';
import LogoutMenu from './LogoutMenu';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

const UserAvatar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const getInitials = () => {
    if (!user) return 'U';

    if (user.username) {
      return user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'U';
  };

  const renderAvatar = () => {
    if (!isAuthenticated) {
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
        {user?.avatar ? (
          <AvatarImage src={user.avatar} alt={user.username || 'avatar'} />
        ) : (
          <AvatarFallback className="bg-[#15ACCD] text-[#FFFFFF]">
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  };

  return isAuthenticated ? (
    <LogoutMenu onLogout={logout} user={user}>
      {renderAvatar()}
    </LogoutMenu>
  ) : (
    <LoginDialog>
      {renderAvatar()}
    </LoginDialog>
  );
};

export default UserAvatar;
