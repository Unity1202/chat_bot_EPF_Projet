import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../../Services/apiService';
import { ApiServiceFetch } from '../../Services/apiServiceFetch';

const AdminDocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);  // Récupérer la liste des documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await ApiService.listDocuments();
      
      // Assurer que chaque document a un identifiant unique
      const processedData = data.map((doc, index) => {
        // Si l'API ne fournit pas d'ID, créer un ID basé sur le nom du fichier et l'index
        if (!doc.id) {
          doc.id = `doc-${index}-${doc.filename}`;
        }
        return doc;
      });
      
      setDocuments(processedData);
    } catch (err) {
      setError('Erreur lors du chargement des documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les documents au chargement du composant
  useEffect(() => {
    fetchDocuments();
  }, []);
  // Télécharger un document
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Starting file upload...');
      
      // Log les fichiers avant envoi
      for (let i = 0; i < files.length; i++) {
        console.log(`File ${i+1}:`, files[i].name, files[i].type, files[i].size);
      }
      
      let uploadSuccess = false;
      
      // Première tentative avec XMLHttpRequest
      try {
        console.log('Attempting upload with XMLHttpRequest...');
        await ApiService.uploadDocuments(files, (progress) => {
          console.log('Upload progress:', progress);
          setUploadProgress(progress);
        });
        uploadSuccess = true;
      } catch (firstError) {
        console.error('First upload method failed:', firstError);
        setError('Premier essai échoué, tentative avec méthode alternative...');
        
        // Deuxième tentative avec fetch
        try {
          console.log('Attempting upload with fetch API...');
          await ApiServiceFetch.uploadDocumentsWithFetch(files);
          uploadSuccess = true;
        } catch (secondError) {
          console.error('Second upload method failed:', secondError);
          
          // Troisième tentative avec une approche alternative
          try {
            console.log('Attempting upload with alternative method...');
            await ApiServiceFetch.uploadDocumentsAlternative(files);
            uploadSuccess = true;
          } catch (thirdError) {
            console.error('Third upload method failed:', thirdError);
            throw new Error('Toutes les méthodes d\'upload ont échoué. Vérifiez les logs pour plus de détails.');
          }
        }
      }
      
      if (uploadSuccess) {
        console.log('Upload completed successfully');
        setSuccessMessage('Documents téléchargés avec succès');
        fetchDocuments(); // Rafraîchir la liste des documents
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('All upload methods failed:', err);
      setError('Erreur lors du téléchargement: ' + err.message);
    } finally {
      setUploading(false);
    }
  };  // Supprimer un document
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }
    
    setError('');
    setSuccessMessage('');
    
    try {
      await ApiService.deleteDocument(documentId);
      setSuccessMessage('Document supprimé avec succès');
      fetchDocuments(); // Rafraîchir la liste des documents
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    }
  };
  // Réindexer les documents
  const handleReindexDocuments = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réindexer tous les documents ? Cette opération peut prendre du temps.')) {
      return;
    }
    
    setReindexing(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await ApiService.reindexDocuments();
      setSuccessMessage('Documents réindexés avec succès');
    } catch (err) {
      setError('Erreur lors de la réindexation: ' + err.message);
    } finally {
      setReindexing(false);
    }
  };

  // Formatter la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📄';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'txt':
        return '📝';
      case 'csv':
      case 'xls':
      case 'xlsx':
        return '📊';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Télécharger des documents</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <div className="mb-4">
          <label 
            htmlFor="file-upload" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Sélectionner des documents (PDF, DOCX, TXT)
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16698C] file:text-white hover:file:bg-[#0f516c]"
            disabled={uploading}
          />
        </div>
        
        {uploading && (
          <div className="mb-4">
            <div className="mb-1 text-sm font-medium flex justify-between">
              <span>Progression</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-[#16698C] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReindexDocuments}
            disabled={reindexing || uploading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#16698C] hover:bg-[#0f516c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16698C] disabled:opacity-50"
          >
            {reindexing ? 'Réindexation...' : 'Réindexer tous les documents'}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Documents disponibles</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16698C]"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Chargement des documents...</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taille</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date d'ajout</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc, index) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getFileIcon(doc.filename)}</span>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                          {doc.filename}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.upload_date ? new Date(doc.upload_date).toLocaleString() : 'N/A'}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDocument(doc.id || doc.filename)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Aucun document disponible. Téléchargez des documents pour commencer.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentManager;
