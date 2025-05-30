/**
 * Version alternative du service API utilisant fetch au lieu de XMLHttpRequest
 * pour résoudre les problèmes d'upload
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ApiServiceFetch = {
  // Upload de documents avec fetch
  uploadDocumentsWithFetch: async (files, onProgress = () => {}) => {
    try {
      // FormData pour les fichiers
      const formData = new FormData();
      
      console.log('Trying upload with different parameter names...');
      
      // Essayer différents noms de paramètres
      // 1. Essai avec 'file' (singulier)
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      
      // Log du contenu de formData (pour debug)
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]); 
      }
      
      // Faire la requête avec fetch
      const response = await fetch(`${API_URL}/api/admin/upload-source`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      // Analyser la réponse
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ detail: `Error ${response.status}` }));
        console.error('Upload failed:', errorData);
        throw new Error(errorData.detail || `Erreur ${response.status} lors du téléchargement`);
      }
      
      const result = await response.json().catch(() => ({ success: true }));
      return result;
    } catch (err) {
      console.error('Upload exception:', err);
      throw err;
    }
  },
  
  // Version adaptée si le premier essai échoue
  uploadDocumentsAlternative: async (files) => {
    try {
      // Essai avec un autre format - un fichier à la fois
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('source', files[i]);
        
        const response = await fetch(`${API_URL}/api/admin/upload-source`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(e => ({ detail: `Error ${response.status}` }));
          throw new Error(errorData.detail || `Erreur ${response.status} lors du téléchargement`);
        }
        
        const result = await response.json().catch(() => ({ success: true }));
        results.push(result);
      }
      
      return { success: true, results };
    } catch (err) {
      console.error('Alternative upload failed:', err);
      throw err;
    }
  }
};

export default ApiServiceFetch;
