import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../Services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie l'état d'authentification via /auth/me
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/auth/me", {
          credentials: "include"
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("Utilisateur authentifié trouvé:", userData.id);
        } else {
          setUser(null);
          console.log("Utilisateur non authentifié");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData); // facultatif, selon l'usage dans le composant LoginDialog
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
      console.log("Utilisateur déconnecté");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
