// Fichier pour déboguer les problèmes d'authentification admin

// Récupère les cookies actuels
function getCookies() {
  return document.cookie.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    cookies[name] = value;
    return cookies;
  }, {});
}

// Vérifie le statut admin
async function checkAdminStatus() {
  console.log('Vérification du statut admin...');
  
  try {
    // 1. Récupérer les cookies actuels
    const cookies = getCookies();
    console.log('Cookies actuels:', cookies);
      // 2. Vérifier le statut d'authentification général
    const authResponse = await fetch('http://localhost:8000/api/auth/me', {
      credentials: 'include'
    });
    
    if (!authResponse.ok) {
      console.error('Erreur de récupération du profil utilisateur:', authResponse.status);
      return { authenticated: false, admin: false };
    }
    
    const authData = await authResponse.json();
    console.log('Profil utilisateur:', authData);
    
    // 3. Vérifier le statut administrateur
    const adminResponse = await fetch('http://localhost:8000/api/auth/check-admin', {
      credentials: 'include'
    });
    
    if (!adminResponse.ok) {
      console.error('Erreur de vérification du statut admin:', adminResponse.status);
      return { authenticated: true, admin: false };
    }
    
    const adminData = await adminResponse.json();
    console.log('Statut admin:', adminData);
    
    return { 
      authenticated: true, 
      admin: adminData.is_admin === true, 
      user: authData 
    };
  } catch (error) {
    console.error('Erreur lors du débogage:', error);
    return { error: error.message };
  }
}

// Ouvre la page d'administration si autorisé
function accessAdminPage() {
  checkAdminStatus().then(status => {
    if (status.admin) {
      console.log('Redirection vers la page admin...');
      window.location.href = '/admin';
    } else {
      console.error('Accès refusé - Vous n\'êtes pas administrateur.');
      alert('Vous n\'avez pas les privilèges administrateur nécessaires.');
    }
  });
}

// Affiche les résultats et fournit des suggestions
function debugAdminAccess() {
  checkAdminStatus().then(status => {
    console.log('==== RÉSULTAT DU DÉBOGAGE ====');
    if (status.authenticated) {
      console.log('✅ Vous êtes authentifié en tant que:', status.user.username || status.user.email);
      
      if (status.admin) {
        console.log('✅ Vous avez des privilèges administrateur!');
        console.log('Pour accéder à l\'admin, utilisez: window.location.href = "/admin"');
      } else {
        console.log('❌ Vous n\'avez PAS de privilèges administrateur.');
        console.log('Solutions possibles:');
        console.log('1. Vérifiez que votre compte a bien les droits administrateur dans la base de données.');
        console.log('2. Essayez de vous déconnecter et de vous reconnecter.');
        console.log('3. Vérifiez les cookies de session (ils peuvent être expirés ou invalides).');
      }
    } else {
      console.log('❌ Vous n\'êtes PAS authentifié!');
      console.log('Connectez-vous d\'abord pour accéder à l\'interface d\'administration.');
    }
  });
}

// Exportation des fonctions pour utilisation
export default {
  check: checkAdminStatus,
  debug: debugAdminAccess,
  access: accessAdminPage
};
