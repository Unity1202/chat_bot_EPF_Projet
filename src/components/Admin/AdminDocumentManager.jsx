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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Gestion des documents sources
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ajoutez, supprimez ou réindexez les documents sources pour le système RAG.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            id="file-upload"
          />          <label
            htmlFor="file-upload"
            className="flex-grow md:flex-grow-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md cursor-pointer text-center transition duration-150 ease-in-out"
          >
            {uploading ? 'Téléchargement...' : 'Ajouter des documents'}
          </label>
          
          <button
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition duration-150 ease-in-out"
            onClick={handleReindexDocuments}
            disabled={reindexing || documents.length === 0}
          >
            {reindexing ? 'Réindexation...' : 'Réindexer les documents'}
          </button>
        </div>
      </div>
      
      {/* Message de succès avec animation */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 animate-fadeIn">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Message d'erreur avec animation */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 animate-fadeIn">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Barre de progression d'upload avec animation */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-right">{uploadProgress}% téléchargé</p>
        </div>
      )}
      
      {/* Tableau des documents */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
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
    </div>
  );
};

export default AdminDocumentManager;
