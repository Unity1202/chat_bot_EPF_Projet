import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../Services/apiService';

const AdminDocumentManagerExample = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Récupérer la liste des documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await ApiService.listDocuments();
      setDocuments(data);
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
      await ApiService.uploadDocuments(files, (progress) => {
        setUploadProgress(progress);
      });
      
      setSuccessMessage('Documents téléchargés avec succès');
      fetchDocuments(); // Rafraîchir la liste des documents
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Erreur lors du téléchargement: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un document
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

  // Le reste du composant reste identique à votre implémentation actuelle
  // ...

  return (
    <div className="space-y-6">
      {/* Interface utilisateur identique à votre implémentation actuelle */}
    </div>
  );
};

export default AdminDocumentManagerExample;
