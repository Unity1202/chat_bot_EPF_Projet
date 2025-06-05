import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from '../Services/authService';

const AuthContext = createContext();

// Créer un événement personnalisé pour la déconnexion
const LOGOUT_EVENT_NAME = 'juridica-user-logout';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifie l'état d'authentification via /auth/me
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include"
        });        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("Utilisateur authentifié trouvé:", userData.id);
          
          // Vérifier si l'utilisateur est administrateur
          try {
            const adminResponse = await fetch("http://localhost:8000/api/auth/check-admin", {
              credentials: "include"
            });
            
            if (adminResponse.ok) {
              const adminData = await adminResponse.json();
              setIsAdmin(adminData.is_admin === true);
              console.log("Statut administrateur:", adminData.is_admin === true ? "Oui" : "Non");
            } else {
              setIsAdmin(false);
            }
          } catch (adminError) {
            console.error("Erreur lors de la vérification des droits admin:", adminError);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
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
  };  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
      console.log("Utilisateur déconnecté");
      
      // Déclencher un événement de déconnexion global
      window.dispatchEvent(new Event(LOGOUT_EVENT_NAME));
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
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
