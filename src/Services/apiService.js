/**
 * Service centralisé pour tous les appels API
 * Permet de faciliter la maintenance et les mises à jour des endpoints
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ApiService = {
  // Authentification
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    return response.json();
  },
  
  checkAuth: async () => {
    const response = await fetch(`${API_URL}/api/auth/check-auth`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) return { authenticated: false };
    return response.json();
  },
  
  checkAdmin: async () => {
    const response = await fetch(`${API_URL}/api/auth/check-admin`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) return { is_admin: false };
    return response.json();
  },
  
  getUserProfile: async () => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de récupérer le profil utilisateur');
    return response.json();
  },
  
  adminLogin: async (username, password) => {
    const response = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    return response.json();
  },
  
  logout: async () => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },
  
  // Gestion des documents admin
  listDocuments: async () => {
    const response = await fetch(`${API_URL}/api/admin/list-sources`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de récupérer la liste des documents');
    return response.json();
  },
    uploadDocuments: (files, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      
      // Log pour déboguer
      console.log('Files to upload:', files);
      
      // Essayer avec le paramètre 'file' au singulier comme mentionné dans la doc API
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/admin/upload-source`, true);
      xhr.withCredentials = true;
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
        xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload success response:', response);
            resolve(response);
          } catch (e) {
            console.log('Upload success but could not parse response');
            resolve({ success: true });
          }
        } else {
          console.error('Upload failed with status:', xhr.status);
          console.error('Response text:', xhr.responseText);
          
          try {
            const response = JSON.parse(xhr.responseText);
            console.error('Parsed error response:', response);
            
            // Erreur plus détaillée pour aider au débogage
            let errorMessage = 'Erreur lors du téléchargement';
            if (response.detail) {
              errorMessage = `Erreur: ${response.detail}`;
            } else if (response.message) {
              errorMessage = `Erreur: ${response.message}`;
            } else if (typeof response === 'string') {
              errorMessage = `Erreur: ${response}`;
            }
            
            reject(new Error(errorMessage));
          } catch (e) {
            reject(new Error(`Erreur ${xhr.status} lors du téléchargement`));
          }
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Erreur de connexion lors du téléchargement'));
      };
      
      xhr.send(formData);
    });
  },
  
  deleteDocument: async (documentId) => {
    const response = await fetch(`${API_URL}/api/admin/delete-source/${documentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de supprimer le document');
    return response.json();
  },
  
  reindexDocuments: async () => {
    const response = await fetch(`${API_URL}/api/admin/reindex-sources`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de réindexer les documents');
    return response.json();
  },
  
  // Chat et conversations
  sendChatMessage: async (message, conversationId = null, metadata = {}) => {
    const url = `${API_URL}/api/chat/query`;
    const payload = {
      query: message,
      conversation_id: conversationId,
      metadata: metadata
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Erreur lors de l\'envoi du message');
    return response.json();
  },
  
  getConversationHistory: async (conversationId) => {
    const response = await fetch(`${API_URL}/api/chat/history/${conversationId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de récupérer l\'historique de la conversation');
    return response.json();
  },
  
  getAllConversations: async () => {
    const response = await fetch(`${API_URL}/api/chat/conversations`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de récupérer les conversations');
    return response.json();
  },
  
  deleteConversation: async (conversationId) => {
    const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Impossible de supprimer la conversation');
    return response.json();
  }
};

export default ApiService;
