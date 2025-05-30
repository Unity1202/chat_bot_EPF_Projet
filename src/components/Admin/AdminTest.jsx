import React from 'react';

const AdminTest = () => {  const checkAdminStatus = async () => {
    try {
      // Test de la connexion admin
      const response = await fetch('http://localhost:8000/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      // Afficher le résultat
      alert(`Statut administrateur: ${data.is_admin ? 'OUI' : 'NON'}`);
      
      // Si admin, proposer d'aller à la page admin
      if (data.is_admin) {
        const goToAdmin = window.confirm('Voulez-vous accéder à la page d\'administration ?');
        if (goToAdmin) {
          window.location.href = '/admin';
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert(`Erreur lors de la vérification: ${err.message}`);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Test des privilèges administrateur
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Utilisez ce bouton pour vérifier si vous avez des privilèges d'administrateur
      </p>
      <button
        onClick={checkAdminStatus}
        className="px-4 py-2 bg-[#16698C] text-white rounded hover:bg-[#0f516c]"
      >
        Vérifier les privilèges
      </button>
    </div>
  );
};

export default AdminTest;
