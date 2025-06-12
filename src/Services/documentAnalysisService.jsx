/**
 * Service pour gérer les communications avec l'API d'analyse de documents
 */

// URLs de base pour les différents endpoints de l'API
const BASE_URL = 'http://localhost:8000/api/file-analysis';

// Map pour suivre les requêtes d'analyse en cours pour éviter les duplications
const pendingAnalysisRequests = new Map();

// Fonction utilitaire qui gère le rafraîchissement du token d'authentification
const refreshAuthToken = async () => {
  try {
    const { triggerAuthRefresh } = await import('../contexts/AuthContext');
    if (typeof triggerAuthRefresh === 'function') {
      return await triggerAuthRefresh();
    } else {
      console.error("triggerAuthRefresh n'est pas une fonction");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de l'import de triggerAuthRefresh:", error);
    return false;
  }
};

/**
 * Traiter les erreurs d'API de manière cohérente
 * @param {Response} response - La réponse HTTP
 * @param {string} operation - Le nom de l'opération en cours (pour les logs)
 * @returns {Promise<void>} - Rejette avec une erreur appropriée
 */
const handleApiError = async (response, operation) => {
  try {
    const errorData = await response.json().catch(() => ({}));
    const statusText = response.statusText ? ` (${response.statusText})` : '';
    
    // Traitement spécifique selon le code HTTP
    if (response.status === 422) {
      throw new Error(
        errorData.detail 
          ? `Erreur de validation: ${errorData.detail}` 
          : `Erreur de validation des données${statusText}`
      );
    } else if (response.status === 404) {
      throw new Error(
        errorData.detail 
          ? `Ressource non trouvée: ${errorData.detail}` 
          : `Ressource non trouvée${statusText}`
      );    } else if (response.status === 401) {
      console.log("Erreur d'authentification détectée dans handleApiError");
      
      // Tentative de rafraîchir le token avant d'échouer
      try {
        const refreshResult = await refreshAuthToken();
        
        console.log("Résultat du refresh de token:", refreshResult);
        
        // Attendre un court instant pour laisser le refresh se produire complètement
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Vérifier si l'utilisateur a été réauthentifié
        const checkAuth = await fetch("http://localhost:8000/api/auth/check-auth", {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (checkAuth.ok) {
          console.log("Authentification rafraîchie avec succès");
          // Si l'authentification est réussie, renvoyer une erreur spéciale pour permettre une nouvelle tentative
          throw new Error("SESSION_REFRESH_REQUIRED");
        } else {
          console.error("Échec du refresh d'authentification - checkAuth non OK");
          // Si l'authentification a échoué même après la tentative de refresh
          throw new Error("Session expirée, veuillez vous reconnecter");
        }
      } catch (err) {
        if (err.message === "SESSION_REFRESH_REQUIRED") {
          console.log("Signalement pour réessayer après refresh de session");
          throw err;
        } else {
          console.error("Erreur lors du refresh d'authentification:", err);
          throw new Error("Session expirée, veuillez vous reconnecter");
        }
      }
    } else {
      throw new Error(
        errorData.detail 
          ? `Erreur: ${errorData.detail}` 
          : `Erreur API ${response.status}${statusText}`
      );
    }
  } catch (jsonError) {
    throw new Error(`Erreur lors de ${operation}: ${response.status}`);
  }
};

/**
 * Upload d'un document
 * @param {File} file - Le fichier à uploader
 * @returns {Promise<DocumentUploadResponse>} - La réponse du backend avec les informations du document
 * @typedef {Object} DocumentUploadResponse
 * @property {string} document_id - UUID unique du document
 * @property {string} filename - Nom original du fichier
 */
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      credentials: 'include', // Important pour envoyer les cookies
      body: formData
    });

    if (!response.ok) {
      await handleApiError(response, "l'upload du document");
    }

    const data = await response.json();
    console.log("Document uploadé:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de l'upload du document:", error);
    throw error;
  }
};

/**
 * Analyser un document
 * @param {string} documentId - L'ID du document à analyser
 * @returns {Promise<DocumentAnalysisResponse>} - Les résultats de l'analyse
 * @typedef {Object} Position
 * @property {number} start - Position de début
 * @property {number} end - Position de fin
 * 
 * @typedef {Object} SpellingError
 * @property {string} word - Mot mal orthographié
 * @property {Position} position - Position dans le texte
 * @property {string[]} suggestions - Suggestions de correction
 * 
 * @typedef {Object} GrammarError
 * @property {string} text - Texte contenant l'erreur grammaticale
 * @property {Position} position - Position dans le texte
 * @property {string} message - Description de l'erreur
 * @property {string[]} suggestions - Suggestions de correction
 * 
 * @typedef {Object} LegalComplianceIssue
 * @property {string} text - Segment de texte concerné (peut être vide)
 * @property {Position} position - Position dans le texte
 * @property {string} issue_type - Type de problème légal
 * @property {string} description - Description du problème
 * @property {string} recommendation - Recommandation pour résolution
 * 
 * @typedef {Object} DocumentAnalysisResponse
 * @property {string} document_id - ID du document analysé
 * @property {string} filename - Nom du fichier
 * @property {SpellingError[]} spelling_errors - Erreurs d'orthographe
 * @property {GrammarError[]} grammar_errors - Erreurs grammaticales
 * @property {LegalComplianceIssue[]} legal_compliance_issues - Problèmes de conformité légale
 * @property {number} overall_compliance_score - Score global (0.0 à 1.0)
 * @property {string[]} suggestions - Suggestions d'amélioration
 */
export const analyzeDocument = async (documentId) => {
  try {
    // Validate document ID
    if (!documentId) {
      throw new Error("ID du document non défini");
    }
    
    // Créer une clé unique qui combine l'ID du document et l'ID de session
    // Cela évite les problèmes après un rechargement de page
    const sessionId = sessionStorage.getItem('documentAnalysisSessionId') || 'default-session';
    const requestKey = `${documentId}-${sessionId}`;
    
    // Vérifier si une requête est déjà en cours pour ce document dans cette session
    if (pendingAnalysisRequests.has(requestKey)) {
      console.log(`Requête d'analyse déjà en cours pour le document ${documentId} dans la session ${sessionId}, attente...`);
      return await pendingAnalysisRequests.get(requestKey);
    }
    
    // Créer une nouvelle promesse et l'enregistrer dans la map
    const analysisPromise = (async () => {
      try {
        console.log(`Envoi de la requête d'analyse pour le document ${documentId} (session: ${sessionId})`);
        
        // Ajouter un timestamp pour éviter les problèmes de cache
        const timestamp = new Date().getTime();
        const url = `${BASE_URL}/analyze?_t=${timestamp}`;
        
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({ document_id: documentId.toString() })
        });
  
        if (!response.ok) {
          await handleApiError(response, "l'analyse du document");
        }
  
        const data = await response.json();
        console.log("Résultats de l'analyse:", data);
        return data;
      } catch (error) {
        // Si l'erreur est liée à l'authentification qui vient d'être rafraîchie
        if (error.message === "SESSION_REFRESH_REQUIRED") {
          console.log("Réessai de l'analyse après rafraîchissement de session");
          // Court délai pour s'assurer que la session est bien rafraîchie
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Nouvelle requête avec credentials frais
          const newResponse = await fetch(`${BASE_URL}/analyze`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ document_id: documentId.toString() })
          });
          
          if (!newResponse.ok) {
            throw new Error(`Échec de la nouvelle tentative après refresh: ${newResponse.status}`);
          }
          
          const newData = await newResponse.json();
          console.log("Résultats de l'analyse après réessai:", newData);
          return newData;
        }
        
        // Pour les autres erreurs, on les propage
        throw error;
      } finally {
        // Supprimer la promesse de la map une fois terminée (réussie ou échouée)
        // Attendre un peu avant de supprimer pour éviter des requêtes multiples rapprochées
        setTimeout(() => {
          pendingAnalysisRequests.delete(requestKey);
          console.log(`Requête d'analyse supprimée de la map pour ${requestKey}`);
        }, 1000);
      }
    })();
    
    // Enregistrer la promesse dans la map
    pendingAnalysisRequests.set(requestKey, analysisPromise);
    
    // Attendre et retourner le résultat
    return await analysisPromise;
  } catch (error) {
    console.error("Erreur lors de l'analyse du document:", error);
    throw error;
  }
};

/**
 * Poser une question sur le document
 * @param {string} documentId - L'ID du document
 * @param {string} question - La question à poser
 * @param {string} conversationId - L'ID de la conversation (optionnel)
 * @returns {Promise<ChatResponse>} - La réponse à la question
 * @typedef {Object} ChatSource
 * @property {any} [key] - Propriétés dynamiques des sources
 * 
 * @typedef {Object} ChatResponse
 * @property {string} conversation_id - ID de la conversation
 * @property {string} response - Réponse à la question
 * @property {ChatSource[]} [sources] - Sources de la réponse (optionnel)
 */
export const queryDocument = async (documentId, question, conversationId = null) => {
  try {
    // Validate inputs
    if (!documentId) {
      throw new Error("ID du document non défini");
    }
    if (!question) {
      throw new Error("Question non définie");
    }
    const requestData = { 
      document_id: documentId, 
      query: question 
    };
    
    // Ajouter l'ID de conversation s'il est fourni
    if (conversationId) {
      requestData.conversation_id = conversationId;
    }

    const response = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      await handleApiError(response, "la requête sur le document");
    }

    const data = await response.json();
    console.log("Réponse à la question:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête sur le document:", error);
    throw error;
  }
};

/**
 * Corriger le document
 * @param {string} documentId - L'ID du document à corriger
 * @returns {Promise<DocumentCorrectionResponse>} - Les informations du document corrigé
 * @typedef {Object} DocumentCorrectionResponse
 * @property {string} original_document_id - ID du document original
 * @property {string} corrected_document_id - ID du document corrigé
 * @property {string} filename - Nom du fichier corrigé pour téléchargement
 * @property {number} corrections_applied - Nombre de corrections effectuées
 * @property {string[]} corrections_details - Détails des corrections
 * @property {string[]} legal_recommendations - Recommandations légales
 * @property {string} status - Status de la correction (ex: "corrected")
 */
export const correctDocument = async (documentId) => {
  try {
    // Validate document ID
    if (!documentId) {
      throw new Error("ID du document non défini");
    }
    
    // Log what is being sent to the API
    console.log("Sending correction request for document ID:", documentId);
    
    const response = await fetch(`${BASE_URL}/correct`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        document_id: documentId.toString(),
        apply_corrections: true
      })
    });
    
    if (!response.ok) {
      await handleApiError(response, "la correction du document");
    }    const data = await response.json();
    console.log("Document corrigé:", data);
    
    // Add additional validation of the response
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.warn("La réponse de l'API de correction est vide");
      throw new Error("Réponse vide reçue de l'API");
    }
    
    // Validate required fields according to API documentation
    if (!data.corrected_document_id) {
      console.warn("ID du document corrigé manquant dans la réponse:", data);
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la correction du document:", error);
    // Make sure we're always throwing a proper Error object with a readable message
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object') {
      throw new Error(error?.detail || JSON.stringify(error) || "Erreur inconnue");
    } else {
      throw new Error(String(error) || "Erreur inconnue");
    }
  }
};

/**
 * Récupère l'historique des analyses de documents
 * @returns {Promise<Array>} - La liste des documents analysés
 */
export const getDocumentHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      await handleApiError(response, "la récupération de l'historique des documents");
    }

    const data = await response.json();
    console.log("Historique des documents:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des documents:", error);
    throw error;
  }
};

/**
 * Télécharge un document (original ou corrigé)
 * @param {string} filename - Le nom du fichier à télécharger
 * @returns {Promise<Blob>} - Le contenu du document
 */
export const downloadDocument = async (filename) => {
  try {
    if (!filename) {
      throw new Error("Nom de fichier non défini pour le téléchargement");
    }
    
    // Assurez-vous que le nom de fichier est encodé correctement pour l'URL
    const encodedFilename = encodeURIComponent(filename);
    const url = `${BASE_URL}/download/${encodedFilename}`;
    
    console.log(`Tentative de téléchargement du fichier: ${filename}`);
    console.log(`URL de téléchargement: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });    if (!response.ok) {
      await handleApiError(response, "le téléchargement du fichier");
    }

    // Ensure the response has content
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Le fichier téléchargé est vide");
    }

    return blob;
  } catch (error) {
    console.error("Erreur lors du téléchargement du document:", error);
    throw error;
  }
};

/**
 * Génère un lien de téléchargement pour un document
 * @param {string} filename - Le nom du fichier à télécharger
 * @returns {string} - L'URL de téléchargement
 */
export const getDocumentDownloadUrl = (filename) => {
  if (!filename) {
    console.error("Tentative de génération d'URL avec un nom de fichier non défini");
    return null;
  }
  return `${BASE_URL}/download/${encodeURIComponent(filename)}`;
};
