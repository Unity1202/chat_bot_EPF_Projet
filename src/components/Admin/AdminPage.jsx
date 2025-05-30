import React, { useState, useEffect } from 'react';
import AdminAuth from './AdminAuth';
import AdminDocumentManager from './AdminDocumentManager';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Vérifier si l'utilisateur est un administrateur au chargement
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
        setCheckingAuth(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16698C]"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Vérification des privilèges...</span>
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas administrateur, afficher le formulaire de connexion
  if (!isAdmin) {
    return <AdminAuth />;
  }
    return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Administration - Système RAG
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez les documents sources et les paramètres du système de génération augmentée par récupération.
          </p>
        </div>
        <a 
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#16698C] hover:bg-[#125879] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16698C]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </a>
      </div>
      
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'documents'
                ? 'border-[#16698C] text-[#16698C] dark:border-[#4FB3E8] dark:text-[#4FB3E8]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Documents
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`ml-8 py-3 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'settings'
                ? 'border-[#16698C] text-[#16698C] dark:border-[#4FB3E8] dark:text-[#4FB3E8]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Paramètres
          </button>
        </nav>
      </div>
      
      {activeTab === 'documents' && <AdminDocumentManager />}
      
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Paramètres du système RAG
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette fonctionnalité sera disponible prochainement.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
