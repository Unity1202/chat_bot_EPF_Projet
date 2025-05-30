import React, { useState, useEffect } from 'react';
import { Shield } from "lucide-react";

// Composant pour vérifier si l'utilisateur a des privilèges administrateur
const AdminLink = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/check-admin', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des privilèges admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading || !isAdmin) {
    return null; // Ne rien afficher pendant le chargement ou si l'utilisateur n'est pas admin
  }

  return (
    <a 
      href="/admin"
      className="flex items-center px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Shield className="mr-2 h-4 w-4" />
      <span>Administration</span>
    </a>
  );
};

export default AdminLink;
