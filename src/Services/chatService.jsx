/**
 * Service pour gérer les communications avec l'API de chat
 */

const API_URL = 'http://localhost:8000/api/chat/query';

/**
 * Envoie une requête au backend et récupère la réponse
 * @param {string} query - La question de l'utilisateur
 * @param {string} conversationId - L'ID de conversation optionnel pour continuer une conversation existante
 * @returns {Promise} - La promesse contenant la réponse du backend
 */
export const sendQuery = async (query, conversationId = null) => {
  try {
    const payload = { query };
    
    // Ajouter l'ID de conversation s'il existe
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la requête:', error);
    throw error;
  }
};