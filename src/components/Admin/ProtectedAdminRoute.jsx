import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérifier le statut d'administrateur
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/check-admin', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut admin:', err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  // Pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16698C]"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Vérification des privilèges...</span>
      </div>
    );
  }
  
  // Rediriger si non administrateur
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  // Rendre les enfants si administrateur
  return children || <Outlet />;
};

export default ProtectedAdminRoute;
