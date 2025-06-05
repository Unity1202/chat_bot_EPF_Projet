import React from 'react';
import { Shield } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

// Composant pour afficher le lien d'administration si l'utilisateur a des privilèges administrateur
const AdminLink = () => {
  const { isAdmin, loading } = useAuth();

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
