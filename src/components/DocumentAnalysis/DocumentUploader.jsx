import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, AlertCircle, CheckCircle, FileText, File } from 'lucide-react';
import { Button } from '../ui/button';
import { uploadDocument, analyzeDocument } from '../../Services/documentAnalysisService';
import { Progress } from '../ui/progress';

/**
 * Composant pour l'upload de documents
 */
export default function DocumentUploader({ onDocumentUploaded, onError, setLoading, isLoading }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  
  // Accepte uniquement les types de fichiers supportés
  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
  };

  // Configuration de la zone de drop
  const onDrop = useCallback(acceptedFiles => {
    // On prend uniquement le premier fichier
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setUploadStatus(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop, 
    accept: acceptedFileTypes,
    maxFiles: 1,
    maxSize: 10485760 // 10MB
  });

  // Simule la progression de l'upload
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  // Gestion de l'upload du fichier
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setLoading(true);
    setUploadStatus(null);
    
    try {
      // Simule la progression de l'upload
      const progressInterval = simulateUploadProgress();
      
      // Upload le fichier
      const uploadResult = await uploadDocument(file);
      
      // Arrête la simulation et met à 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
        // Déclenche l'analyse du document
      const documentInfo = {
        id: uploadResult.document_id,
        filename: uploadResult.filename,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      setUploadStatus('success');
      
      // Notifie le parent que le document a été uploadé
      onDocumentUploaded(documentInfo);
      
    } catch (error) {
      setUploadStatus('error');
      onError(error);
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  // Supprimer le fichier
  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus(null);
  };

  // Afficher le bon icon selon le type de fichier
  const renderFileIcon = () => {
    if (file?.type.includes('pdf')) {
      return <FileText size={24} />;
    }
    return <File size={24} />;
  };

  // Afficher les erreurs de validation
  const renderRejections = () => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      let errorMessage = "Fichier non supporté";
      
      if (rejection.errors[0].code === 'file-too-large') {
        errorMessage = "Le fichier est trop volumineux (max 10MB)";
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        errorMessage = "Type de fichier non supporté (PDF, DOCX, PPTX, TXT uniquement)";
      }
      
      return (
        <div className="text-red-500 flex items-center mt-2">
          <AlertCircle size={16} className="mr-1" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Uploader un Document</h2>
      
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">
            {isDragActive
              ? "Déposez le fichier ici..."
              : "Glissez-déposez un fichier ici, ou cliquez pour sélectionner"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Formats supportés: PDF, DOCX, PPTX, TXT (max 10MB)
          </p>
          {renderRejections()}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {renderFileIcon()}
              <div className="ml-2">
                <div className="font-medium truncate max-w-xs">{file.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X size={18} />
            </Button>
          </div>
          
          {isUploading && (
            <div className="mb-4">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-right text-sm text-gray-500 mt-1">
                {uploadProgress}%
              </div>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="flex items-center text-green-500 mb-4">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Document uploadé avec succès!</span>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">Erreur lors de l'upload du document</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={isUploading || uploadStatus === 'success'}
            >
              {isUploading ? 'Uploading...' : 'Uploader et Analyser'}
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Instructions</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Choisissez un document à analyser (PDF, DOCX, PPTX, TXT)</li>
          <li>L'analyse détectera les erreurs orthographiques, grammaticales et problèmes légaux</li>
          <li>Vous pourrez poser des questions sur le contenu de votre document</li>
          <li>L'outil vous proposera des corrections automatiques</li>
        </ul>
      </div>
    </div>
  );
}
