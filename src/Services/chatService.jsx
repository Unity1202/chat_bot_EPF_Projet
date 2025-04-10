/**
 * Service pour gérer les communications avec l'API de chat
 */

// URLs de base pour les différents endpoints de l'API
const API_URL = 'http://localhost:8000/api/chat';

/**
 * Envoie une requête au backend et récupère la réponse
 * @param {string} query - La question de l'utilisateur
 * @param {string} conversationId - L'ID de conversation optionnel pour continuer une conversation existante
 * @returns {Promise} - La promesse contenant la réponse du backend
 */
export const sendQuery = async (query, conversationId = null) => {
  try {
    const payload = { query };
    
    // Préparer les en-têtes standard pour toutes les requêtes
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    let url;
    // Si nous avons un ID de conversation, utiliser l'endpoint "continue"
    if (conversationId) {
      url = `${API_URL}/continue/${conversationId}`;
    } else {
      // Sinon, utiliser l'endpoint de base pour une nouvelle conversation
      url = `${API_URL}/query`;
    }
    
    console.log(`Envoi de requête à ${url}:`, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include', // Important pour envoyer les cookies
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Réponse du serveur:", data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la requête:', error);
    throw error;
  }
};

/**
 * Vérifie si l'utilisateur est actuellement connecté
 * @returns {Promise<boolean>} - true si l'utilisateur est connecté
 */
export const checkAuthentication = async () => {
  try {
    const response = await fetch('http://localhost:8000/auth/check-auth', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    console.log("Réponse de check-auth :", data);
    return data.authenticated === true;
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error);
    return false;
  }
};

/**
 * Récupère l'historique des conversations de l'utilisateur connecté
 * @returns {Promise} - La promesse contenant l'historique des conversations
 */
export const getConversationHistory = async () => {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      console.log("Utilisateur non authentifié");
      return []; // Retourner un tableau vide si non authentifié
    }
    
    // Utiliser l'endpoint my-conversations qui récupère les conversations de l'utilisateur connecté
    const response = await fetch(`${API_URL}/my-conversations`, {
      method: 'GET',
      credentials: 'include', // Important pour envoyer les cookies
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Erreur API (${response.status}):`, await response.text());
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    // Transformer les données pour correspondre à notre structure d'affichage
    const conversations = await response.json();
    console.log("Conversations récupérées:", conversations);
    
    return conversations.map(conv => ({
      id: conv.uuid || conv.id,
      title: conv.title || `Conversation #${(conv.uuid || conv.id).substring(0, 8)}...`,
      preview: conv.last_message || "Aucun message",
      date: conv.created_at || new Date().toISOString(),
      category: assignCategory(conv.category || 'other')
    }));
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

/**
 * Attribue une catégorie selon notre système de classification
 * @param {string} apiCategory - La catégorie retournée par l'API
 * @returns {string} - La catégorie normalisée pour notre interface
 */
const assignCategory = (apiCategory) => {
  if (!apiCategory) return 'other';
  
  // Mapper les catégories de l'API vers nos catégories d'affichage
  const categoryMap = {
    'treasury': 'treasury',
    'financial': 'treasury',
    'finance': 'treasury',
    'organizational': 'organisational',
    'organisation': 'organisational',
    'structure': 'organisational',
    'management': 'organisational',
    'other': 'other',
    'general': 'other',
    'legal': 'other',
    'juridique': 'other'
  };
  
  return categoryMap[apiCategory.toLowerCase()] || 'other';
};

/**
 * Récupère une conversation spécifique avec tous ses messages
 * @param {string} conversationId - L'ID de la conversation à récupérer
 * @returns {Promise} - La promesse contenant les détails de la conversation
 */
export const getConversationById = async (conversationId) => {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      console.log("Utilisateur non authentifié");
      return null;
    }
    
    // Utiliser l'endpoint d'historique de conversation avec l'ID spécifique
    const response = await fetch(`${API_URL}/history/${conversationId}`, {
      method: 'GET',
      credentials: 'include', // Important pour envoyer les cookies
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Erreur API (${response.status}):`, await response.text());
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Historique de conversation récupéré:", data);
    
    // Transformer les données pour correspondre à notre structure d'affichage
    // Récupérer d'abord les informations générales de la conversation
    const conversationInfo = await getConversationMetadata(conversationId);
    
    // Transformer l'historique en format attendu par notre application
    return {
      id: conversationId,
      title: conversationInfo?.title || `Conversation #${conversationId.substring(0, 8)}...`,
      category: assignCategory(conversationInfo?.category || 'other'),
      messages: (data.history || []).map((msg, index) => ({
        id: msg.id || index,
        text: msg.content || msg.message, // Accepter les deux formats possibles
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp || new Date().toISOString(),
        sources: msg.sources || []
      })),
      conversationId: conversationId
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    return null;
  }
};

/**
 * Récupère les métadonnées d'une conversation (titre, catégorie, etc.)
 * @param {string} conversationId - L'ID de la conversation
 * @returns {Promise} - Les métadonnées de la conversation
 */
async function getConversationMetadata(conversationId) {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      return null;
    }
    
    // Récupérer la liste des conversations et filtrer celle qui nous intéresse
    const allConversations = await getConversationHistory();
    const targetConversation = allConversations.find(conv => conv.id === conversationId);
    
    return targetConversation || {
      title: `Conversation #${conversationId.substring(0, 8)}...`,
      category: 'other'
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: `Conversation #${conversationId.substring(0, 8)}...`,
      category: 'other'
    };
  }
}

/**
 * Supprime une conversation
 * @param {string} conversationId - L'ID de la conversation à supprimer
 * @returns {Promise<boolean>} - true si la suppression a réussi
 */
export const deleteConversation = async (conversationId) => {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      return false;
    }
    
    // Utiliser l'endpoint de suppression d'historique
    const response = await fetch(`${API_URL}/history/${conversationId}`, {
      method: 'DELETE',
      credentials: 'include', // Important pour envoyer les cookies
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Erreur API (${response.status}):`, await response.text());
    }
    
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    return false;
  }
};

/**
 * Récupère les statistiques de l'utilisateur
 * @returns {Promise} - Les statistiques de l'utilisateur
 */
export const getUserStatistics = async () => {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      return null;
    }
    
    const response = await fetch(`${API_URL}/my-statistics`, {
      method: 'GET',
      credentials: 'include', // Important pour envoyer les cookies
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

/**
 * Crée une nouvelle conversation pour l'utilisateur connecté
 * @returns {Promise<Object>} - Les informations de la nouvelle conversation
 */
export const createNewConversation = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/chat/new-conversation', {
      method: 'POST',
      credentials: 'include', // Inclure les cookies pour l'authentification
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Nouvelle conversation créée :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création d'une nouvelle conversation :", error);
    throw error;
  }
};