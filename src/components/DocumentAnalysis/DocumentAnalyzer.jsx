import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import DocumentUploader from './DocumentUploader';
import DocumentAnalysisResults from './DocumentAnalysisResults';
import DocumentChat from './DocumentChat';
import DocumentCorrector from './DocumentCorrector';
import { AlertCircle } from 'lucide-react';
import './DocumentAnalysisLayout.css';

/**
 * Composant principal pour l'analyse de documents
 * Gère les 4 onglets et l'état global du document en cours d'analyse
 */
export default function DocumentAnalyzer() {
  // État principal pour gérer le document et ses analyses
  const [documentState, setDocumentState] = useState({
    document: null,           // Info du document uploadé
    analysis: null,          // Résultats d'analyse
    chatHistory: [],         // Historique du chat
    chatConversationId: null, // ID de conversation pour le chat
    correctedDocument: null, // Document corrigé
    activeTab: "upload",     // Onglet actif
    loading: {
      upload: false,
      analysis: false,
      chat: false,
      correction: false
    },
    error: null
  });
  // Compteurs d'erreurs pour les badges
  const errorCounts = {
    spelling: documentState.analysis?.spelling_errors?.length || 0,
    grammar: documentState.analysis?.grammar_errors?.length || 0,
    legal: documentState.analysis?.legal_compliance_issues?.length || 0
  };

  // Gestionnaire pour le changement d'onglet
  const handleTabChange = (value) => {
    setDocumentState(prev => ({
      ...prev,
      activeTab: value
    }));
  };

  // Gestionnaire pour l'upload du document
  const handleDocumentUploaded = (documentData) => {
    setDocumentState(prev => ({
      ...prev,
      document: documentData,
      activeTab: "analysis" // Passer automatiquement à l'onglet analyse
    }));
  };

  // Gestionnaire pour les résultats d'analyse
  const handleAnalysisComplete = (analysisData) => {
    setDocumentState(prev => ({
      ...prev,
      analysis: analysisData
    }));
  };

  // Gestionnaire pour les messages du chat
  const handleNewChatMessage = (messageData) => {
    setDocumentState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, messageData],
      chatConversationId: messageData.conversation_id || prev.chatConversationId
    }));
  };

  // Gestionnaire pour le document corrigé
  const handleCorrectionComplete = (correctedData) => {
    setDocumentState(prev => ({
      ...prev,
      correctedDocument: correctedData
    }));
  };

  // Gestionnaire d'erreurs global
  const handleError = (error, section) => {
    console.error(`Erreur dans la section ${section}:`, error);
    
    setDocumentState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [section]: false
      },
      error: {
        message: error.message || "Une erreur est survenue",
        section: section
      }
    }));
    
    // Effacer l'erreur après 5 secondes
    setTimeout(() => {
      setDocumentState(prev => ({
        ...prev,
        error: null
      }));
    }, 5000);
  };

  // Gestionnaire pour le loading
  const setLoading = (section, isLoading) => {
    setDocumentState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [section]: isLoading
      }
    }));
  };
  return (
    <div className="flex flex-col w-full">
      {/* Message d'erreur */}
      {documentState.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>
            {documentState.error.message} 
            <span className="text-sm ml-2">({documentState.error.section})</span>
          </span>
        </div>
      )}

      {/* Onglets */}
      <Tabs
        value={documentState.activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="upload" disabled={documentState.loading.upload}>
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            disabled={!documentState.document || documentState.loading.analysis}
          >
            Analyse
            {errorCounts.spelling + errorCounts.grammar + errorCounts.legal > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {errorCounts.spelling + errorCounts.grammar + errorCounts.legal}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            disabled={!documentState.document || documentState.loading.chat}
          >
            Questions
            {documentState.chatHistory.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {documentState.chatHistory.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="correction" 
            disabled={!documentState.analysis || documentState.loading.correction}
          >
            Correction
            {documentState.correctedDocument && (
              <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                ✓
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="upload" className="mt-0">
          <DocumentUploader 
            onDocumentUploaded={handleDocumentUploaded} 
            onError={(error) => handleError(error, 'upload')} 
            setLoading={(isLoading) => setLoading('upload', isLoading)}
            isLoading={documentState.loading.upload}
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-0">
          <DocumentAnalysisResults 
            document={documentState.document}
            analysis={documentState.analysis}
            onAnalysisComplete={handleAnalysisComplete}
            onError={(error) => handleError(error, 'analysis')} 
            setLoading={(isLoading) => setLoading('analysis', isLoading)}
            isLoading={documentState.loading.analysis}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-0">
          <DocumentChat 
            document={documentState.document}
            conversationId={documentState.chatConversationId}
            chatHistory={documentState.chatHistory}
            onNewMessage={handleNewChatMessage}
            onError={(error) => handleError(error, 'chat')} 
            setLoading={(isLoading) => setLoading('chat', isLoading)}
            isLoading={documentState.loading.chat}
          />
        </TabsContent>
        
        <TabsContent value="correction" className="mt-0">
          <DocumentCorrector 
            document={documentState.document}
            analysis={documentState.analysis}
            correctedDocument={documentState.correctedDocument}
            onCorrectionComplete={handleCorrectionComplete}
            onError={(error) => handleError(error, 'correction')} 
            setLoading={(isLoading) => setLoading('correction', isLoading)}
            isLoading={documentState.loading.correction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
