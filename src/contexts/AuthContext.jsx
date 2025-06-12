import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logout as apiLogout, refreshToken } from '../Services/authService';

const AuthContext = createContext();

// Créer un événement personnalisé pour la déconnexion
const LOGOUT_EVENT_NAME = 'juridica-user-logout';
// Créer un événement pour la réauthentification
const AUTH_REFRESH_EVENT_NAME = 'juridica-auth-refresh';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);
  const REFRESH_COOLDOWN = 30000; // 30 secondes minimum entre les tentatives de refresh
  
  // Fonction pour tenter de rafraîchir le token d'authentification
  const attemptTokenRefresh = useCallback(async () => {
    const now = Date.now();
    
    // Éviter les tentatives de refresh trop fréquentes
    if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
      console.log("Tentative de refresh trop récente, cooldown en cours");
      return false;
    }
    
    setLastRefreshAttempt(now);
    
    try {
      console.log("Tentative de rafraîchissement du token...");
      const success = await refreshToken();
      
      if (success) {
        console.log("Token rafraîchi avec succès");
        // Rafraîchir les informations utilisateur
        const meRes = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include"
        });
        
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
          setAuthError(null);
          return true;
        }
      } else {
        console.log("Échec du rafraîchissement du token");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return false;
    }
    
    return false;
  }, [lastRefreshAttempt]);
  // Vérifie l'état d'authentification via /auth/me
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Essayez de récupérer les informations d'authentification en cache
        const cachedAuth = sessionStorage.getItem('auth_data');
        if (cachedAuth) {
          try {
            const parsedData = JSON.parse(cachedAuth);
            if (parsedData && parsedData.id) {
              // Utiliser les données en cache pendant que nous vérifions avec le serveur
              setUser(parsedData);
              console.log("Données d'authentification récupérées du cache:", parsedData.id);
            }
          } catch (cacheError) {
            console.error("Erreur lors de la lecture des données d'authentification en cache:", cacheError);
          }
        }
        
        const response = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("Utilisateur authentifié trouvé:", userData.id);
          
          // Sauvegarder les données d'authentification pour utilisation future
          sessionStorage.setItem('auth_data', JSON.stringify(userData));
          
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
        } else if (response.status === 401) {
          // Tenter de rafraîchir l'authentification
          const refreshResult = await attemptTokenRefresh();
          if (!refreshResult) {
            setUser(null);
            setIsAdmin(false);
            sessionStorage.removeItem('auth_data');
            console.log("Utilisateur non authentifié après tentative de refresh");
          } else {
            // Réessayer de récupérer les informations utilisateur
            fetchAuthStatus();
            return; // Sortir pour éviter de mettre loading à false trop tôt
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          sessionStorage.removeItem('auth_data');
          console.log("Utilisateur non authentifié");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };    fetchAuthStatus();
    
    // Écouter les événements de refresh d'authentification
    const handleAuthRefresh = () => {
      console.log("Événement de refresh d'authentification détecté");
      fetchAuthStatus();
    };
    
    window.addEventListener(AUTH_REFRESH_EVENT_NAME, handleAuthRefresh);
    
    return () => {
      window.removeEventListener(AUTH_REFRESH_EVENT_NAME, handleAuthRefresh);
    };  }, [attemptTokenRefresh]);

  const login = async (userData) => {
    setUser(userData);
    
    // Vérifier si l'utilisateur est administrateur après la connexion
    try {
      const adminResponse = await fetch("http://localhost:8000/api/auth/check-admin", {
        credentials: "include"
      });
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setIsAdmin(adminData.is_admin === true);
        console.log("Statut administrateur après connexion:", adminData.is_admin === true ? "Oui" : "Non");
      } else {
        setIsAdmin(false);
      }
    } catch (adminError) {
      console.error("Erreur lors de la vérification des droits admin après connexion:", adminError);
      setIsAdmin(false);
    }
  };
  
  const handleLogout = async () => {
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
        authError,
        attemptTokenRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Fonction utilitaire pour déclencher un refresh d'authentification global
export const triggerAuthRefresh = () => {
  window.dispatchEvent(new Event(AUTH_REFRESH_EVENT_NAME));
};
