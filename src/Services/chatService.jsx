/**
 * Service pour gérer les communications avec l'API de chat
 */

// Import des utilitaires de debug
import { diagnoseRAGData, traceDataTransformation, validateAPIResponse } from '../utils/debugRAG.js';

// URLs de base pour les différents endpoints de l'API
const API_URL = 'http://localhost:8000/api/chat';

/**
 * Fonction utilitaire pour logger les données de debugging
 * @param {string} context - Le contexte du log
 * @param {Object} data - Les données à logger
 */
const debugLog = (context, data) => {
  console.group(`🔍 DEBUG: ${context}`);
  console.log('Data:', JSON.stringify(data, null, 2));
  if (data && typeof data === 'object') {
    console.log('Available keys:', Object.keys(data));
    if (data.excerpts) console.log('Excerpts found:', data.excerpts);
    if (data.citations) console.log('Citations found:', data.citations);
    if (data.context_excerpts) console.log('Context excerpts found:', data.context_excerpts);
    if (data.rag_excerpts) console.log('RAG excerpts found:', data.rag_excerpts);
  }
  console.groupEnd();
};

/**
 * Envoie une requête au backend et récupère la réponse
 * @param {string} query - La question de l'utilisateur
 * @param {string|null} conversationId - L'ID de conversation pour continuer une conversation existante
 * @param {Object} options - Options pour la requête (use_rag, max_sources, files)
 * @returns {Promise<Object>} - La réponse du backend
 */
export const sendQuery = async (query, conversationId = null, options = {}) => {
  try {
    // Options par défaut pour le RAG
    const defaultOptions = {
      use_rag: true,
      max_sources: 5,
    };
    
    // Fusionner les options par défaut avec les options fournies
    const mergedOptions = { ...defaultOptions, ...options };
    
    let url;
    let headers = {};
    let body;
    
    // Si un ID de conversation est fourni, utiliser l'endpoint pour continuer la conversation
    if (conversationId) {
      url = `${API_URL}/continue/${conversationId}`;
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      body = JSON.stringify({ 
        query,
        use_rag: mergedOptions.use_rag,
        max_sources: mergedOptions.max_sources
      });
    } else {
      // Déterminer l'endpoint selon la présence de fichiers
      if (mergedOptions.files && mergedOptions.files.length > 0) {
        // Utiliser l'endpoint file-chat pour les requêtes avec fichiers
        url = 'http://localhost:8000/api/file-chat/query';
        
        // Préparer FormData pour multipart/form-data
        const formData = new FormData();
        formData.append('query', query);
        formData.append('use_rag', mergedOptions.use_rag.toString());
        formData.append('max_sources', mergedOptions.max_sources.toString());
        
        // Ajouter les fichiers
        mergedOptions.files.forEach(file => {
          formData.append('files', file);
        });
        
        body = formData;
        // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
      } else {
        // Utiliser l'endpoint standard pour les requêtes texte uniquement
        url = `${API_URL}/query`;
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        body = JSON.stringify({ 
          query,
          use_rag: mergedOptions.use_rag,
          max_sources: mergedOptions.max_sources
        });
      }
    }

    console.log(`Envoi de requête à ${url}:`, mergedOptions.files ? 'FormData avec fichiers' : JSON.parse(body));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include', // Important pour envoyer les cookies
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur API: ${response.status}`);
    }    const data = await response.json();
    debugLog("Response from sendQuery", data);
    diagnoseRAGData(data, "sendQuery Response");
    validateAPIResponse(data, "sendQuery");
    
    // Normaliser la réponse pour correspondre au format attendu par le frontend
    // Backend renvoie: answer, sources, excerpts, conversation_id
    // Frontend attend: answer, sources, citations
    const normalizedData = {
      answer: data.answer,
      sources: data.sources || [],
      citations: data.excerpts || data.citations || data.context_excerpts || data.rag_excerpts || [], // Mapper toutes les variantes
      conversation_id: data.conversation_id
    };
    
    debugLog("Normalized data for frontend", normalizedData);
    traceDataTransformation(data, normalizedData, "sendQuery Normalization");
    
    return normalizedData;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la requête:", error);
    throw error;
  }
};

/**
 * Vérifie si l'utilisateur est actuellement connecté
 * @returns {Promise<boolean>} - true si l'utilisateur est connecté
 */
export const checkAuthentication = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/check-auth', {
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
    
    debugLog("Starting getConversationById", { conversationId });
    
    // 1. Essayer d'abord de récupérer l'historique complet avec citations depuis le backend
    try {
      const fullHistory = await getFullConversationHistory(conversationId);
      if (fullHistory && fullHistory.messages) {
        debugLog("Using full conversation history from backend", fullHistory);
        
        // Récupérer les métadonnées de la conversation
        const conversationInfo = await getConversationMetadata(conversationId);
        
        const transformedConversation = {
          id: conversationId,
          title: conversationInfo?.title || fullHistory.title || `Conversation #${conversationId.substring(0, 8)}...`,
          category: assignCategory(conversationInfo?.category || fullHistory.category || 'other'),
          messages: fullHistory.messages.map((msg, index) => {
            debugLog(`Processing message ${index} from full history`, msg);
            
            const transformedMessage = {
              id: msg.id || `msg-${index}-${Date.now()}`,
              text: msg.content || msg.message || msg.text,
              sender: msg.role === 'user' ? 'user' : 'bot',
              timestamp: msg.timestamp || new Date().toISOString(),
              sources: msg.sources || [],
              // Récupérer les citations directement du backend (toutes les variantes)
              citations: msg.citations || msg.excerpts || msg.context_excerpts || msg.rag_excerpts || []
            };
            
            if (msg.role !== 'user') {
              traceDataTransformation(msg, transformedMessage, `Full History Message ${index}`);
              validateAPIResponse(transformedMessage, "message");
            }
            
            return transformedMessage;
          }),
          conversationId: conversationId
        };
        
        debugLog("Successfully transformed full history conversation", transformedConversation);
        return transformedConversation;
      }
    } catch (error) {
      console.warn("Full history not available, falling back to standard history:", error);
    }
    
    // 2. Fallback : utiliser l'endpoint d'historique standard et enrichir avec les citations
    try {
      const response = await fetch(`${API_URL}/history/${conversationId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Pour une nouvelle conversation, l'historique peut ne pas exister encore
      if (response.status === 404) {
        console.log(`Conversation ${conversationId} n'a pas encore d'historique.`);
        
        const conversationInfo = await getConversationMetadata(conversationId);
        
        return {
          id: conversationId,
          title: conversationInfo?.title || `Conversation #${conversationId.substring(0, 8)}...`,
          category: assignCategory(conversationInfo?.category || 'other'),
          messages: [],
          conversationId: conversationId
        };
      }
      
      if (!response.ok) {
        console.error(`Erreur API (${response.status}):`, await response.text());
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      debugLog("Standard conversation history response", data);
      diagnoseRAGData(data, "getConversationById Standard Response");
      validateAPIResponse(data, "getConversationById");
      
      // Récupérer les métadonnées de la conversation
      const conversationInfo = await getConversationMetadata(conversationId);
      
      // Transformer l'historique et enrichir chaque message avec ses citations du backend
      const transformedMessages = await Promise.all(
        (data.history || []).map(async (msg, index) => {
          debugLog(`Processing message ${index} from standard history`, msg);
          
          let citations = msg.citations || msg.excerpts || msg.context_excerpts || msg.rag_excerpts || [];
          
          // Si le message n'a pas de citations et que c'est un message bot, essayer de les récupérer du backend
          if (citations.length === 0 && msg.role !== 'user' && msg.id) {
            try {
              const backendCitations = await getMessageCitations(conversationId, msg.id);
              if (backendCitations && backendCitations.length > 0) {
                citations = backendCitations;
                debugLog(`Enriched message ${msg.id} with ${citations.length} citations from backend`, citations);
              }
            } catch (error) {
              console.warn(`Could not enrich message ${msg.id} with citations:`, error);
            }
          }
          
          const transformedMessage = {
            id: msg.id || `msg-${index}-${Date.now()}`,
            text: msg.content || msg.message,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: msg.timestamp || new Date().toISOString(),
            sources: msg.sources || [],
            citations: citations
          };
          
          if (msg.role !== 'user') {
            traceDataTransformation(msg, transformedMessage, `Standard History Message ${index}`);
            validateAPIResponse(transformedMessage, "message");
          }
          
          return transformedMessage;
        })
      );
      
      const transformedConversation = {
        id: conversationId,
        title: conversationInfo?.title || `Conversation #${conversationId.substring(0, 8)}...`,
        category: assignCategory(conversationInfo?.category || 'other'),
        messages: transformedMessages,
        conversationId: conversationId
      };
      
      traceDataTransformation(data, transformedConversation, "Standard Conversation Transformation");
      debugLog("Successfully transformed standard history conversation", transformedConversation);
      
      return transformedConversation;
      
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`Conversation ${conversationId} n'a pas encore d'historique.`);
        
        const conversationInfo = await getConversationMetadata(conversationId);
        
        return {
          id: conversationId,
          title: conversationInfo?.title || `Conversation #${conversationId.substring(0, 8)}...`,
          category: assignCategory(conversationInfo?.category || 'other'),
          messages: [],
          conversationId: conversationId
        };
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    
    // Même en cas d'erreur, retourner un objet valide avec l'ID de conversation
    return {
      id: conversationId,
      title: `Conversation #${conversationId.substring(0, 8)}...`,
      category: 'other',
      messages: [],
      conversationId: conversationId
    };
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
    const response = await fetch(`${API_URL}/delete/${conversationId}`, {
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
 * @param {string} query - La question initiale pour déterminer la catégorie et le titre
 * @returns {Promise<Object>} - Les informations de la nouvelle conversation
 */
export const createNewConversation = async (query = "Nouvelle conversation") => {
  try {
    const response = await fetch(`${API_URL}/new-conversation`, {
      method: 'POST',
      credentials: 'include', // Inclure les cookies pour l'authentification
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Nouvelle conversation créée :", data);
    
    // S'assurer que l'ID de conversation est disponible
    if (!data.conversation_id) {
      throw new Error("ID de conversation non trouvé dans la réponse");
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la création d'une nouvelle conversation :", error);
    throw error;
  }
};

/**
 * Récupère les citations pour un message spécifique depuis le backend
 * @param {string} conversationId - L'ID de la conversation
 * @param {string} messageId - L'ID du message
 * @returns {Promise<Array>} - Les citations du message
 */
export const getMessageCitations = async (conversationId, messageId) => {
  try {
    const response = await fetch(`${API_URL}/message/${conversationId}/${messageId}/citations`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      debugLog(`Citations for message ${messageId}`, data);
      return data.citations || data.excerpts || [];
    } else {
      console.warn(`No citations endpoint available for message ${messageId}`);
      return [];
    }
  } catch (error) {
    console.warn(`Could not fetch citations for message ${messageId}:`, error);
    return [];
  }
};

/**
 * Récupère l'historique complet avec citations depuis le backend
 * @param {string} conversationId - L'ID de la conversation
 * @returns {Promise<Object>} - L'historique complet avec citations
 */
export const getFullConversationHistory = async (conversationId) => {
  try {
    const response = await fetch(`${API_URL}/history/${conversationId}/full`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      debugLog("Full conversation history with citations", data);
      return data;
    } else {
      console.warn('Full history endpoint not available, falling back to standard history');
      return null;
    }
  } catch (error) {
    console.warn('Could not fetch full history:', error);
    return null;
  }
};