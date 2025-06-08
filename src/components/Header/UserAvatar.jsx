import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserLoginDialog from './UserLoginDialog';
import LogoutMenu from './LogoutMenu';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

const UserAvatar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Fonction de déconnexion avec redirection
  const handleLogout = async () => {
    await logout();
    // Redirection vers la page d'accueil après déconnexion
    navigate('/');
  };

  // État local pour forcer le rendu direct de l'avatar
  const [loginOpen, setLoginOpen] = React.useState(false);

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
        <Avatar 
          className="cursor-pointer h-10 w-10 min-w-[2.5rem] min-h-[2.5rem]"
          onClick={() => setLoginOpen(true)}
        >
          <AvatarFallback className="bg-[#FFFFFF] text-[#16698C] flex items-center justify-center">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      );
    }
    
    return (
      <Avatar className="cursor-pointer h-10 w-10 min-w-[2.5rem] min-h-[2.5rem]">
        {user?.avatar ? (
          <AvatarImage src={user.avatar} alt={user.username || 'avatar'} />
        ) : (
          <AvatarFallback className="bg-[#15ACCD] text-[#FFFFFF] flex items-center justify-center">
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  };
  // SOLUTION DIRECTE: toujours rendre l'avatar directement
  return (
    <div className="relative flex items-center z-50" style={{minWidth: '40px'}}>
      {isAuthenticated ? (
        <LogoutMenu onLogout={handleLogout} user={user}>
          {renderAvatar()}
        </LogoutMenu>
      ) : (
        <>
          {/* Avatar toujours visible directement */}
          {renderAvatar()}
          
          {/* Utilisation du dialog spécialisé pour l'avatar */}
          <UserLoginDialog isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
      )}
    </div>
  );
};

export default UserAvatar;
