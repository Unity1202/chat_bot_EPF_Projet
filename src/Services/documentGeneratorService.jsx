/**
 * Service pour la génération de documents à partir des conversations
 * Permet de créer des PDF et des documents Word à partir du contenu des conversations
 */

const API_URL = 'http://localhost:8000/api/document-generator';

/**
 * Génère un document à partir d'une conversation
 * @param {Object} options - Options pour la génération du document
 * @param {string} options.conversation_id - ID de la conversation
 * @param {string} options.format - Format du document (pdf ou docx)
 * @param {string} options.title - Titre personnalisé pour le document
 * @param {boolean} options.include_question_history - Inclure tout l'historique de la conversation
 * @param {boolean} options.include_sources - Inclure les sources dans le document
 * @param {number} options.question_id - ID spécifique d'une question (facultatif)
 * @returns {Promise<Object>} - Informations sur le document généré (filename, url)
 */
export const generateDocument = async (options) => {
  try {    const {
      conversation_id,
      format = 'pdf',
      title,
      custom_title,
      include_question_history = false,
      include_sources = true,
      question_id
    } = options;

    if (!conversation_id) {
      throw new Error("L'identifiant de conversation est requis");
    }

    if (!['pdf', 'docx'].includes(format)) {
      throw new Error("Le format doit être 'pdf' ou 'docx'");
    }    const requestBody = {
      conversation_id,
      format,
      include_question_history,
      include_sources
    };

    // Laisser le backend gérer le titre par défaut pour éviter les conflits de style
    // Uniquement si custom_title est explicitement défini, on l'envoie avec un nom différent
    if (custom_title) {
      requestBody.document_title = custom_title;
    }
    if (question_id) requestBody.question_id = question_id;

    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la génération du document:", error);
    throw error;
  }
};

/**
 * Récupère l'URL de téléchargement pour un document généré
 * @param {string} filename - Nom du fichier à télécharger
 * @returns {string} - URL de téléchargement complète
 */
export const getDocumentDownloadUrl = (filename) => {
  if (!filename) return null;
  return `${API_URL}/download/${filename}`;
};

/**
 * Télécharge directement un document généré
 * @param {string} filename - Nom du fichier à télécharger
 */
export const downloadDocument = (filename) => {
  if (!filename) return;
  
  const downloadUrl = getDocumentDownloadUrl(filename);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};