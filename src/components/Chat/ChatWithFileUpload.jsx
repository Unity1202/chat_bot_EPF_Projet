import React, { useState, useEffect, useCallback } from 'react';
import { Upload, MessageSquare, FileText, Send, Loader2, AlertCircle, X, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useDropzone } from 'react-dropzone';
import { queryWithFile, getConversationWithFiles, getConversationsWithFiles } from '../../Services/chatWithFileService';
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import './ChatWithFileUpload.css';

/**
 * Component for chatting with file upload capability
 * Allows users to upload files and ask questions about them in a single operation
 */
export default function ChatWithFileUpload() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showConversations, setShowConversations] = useState(false);

  // Load existing conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation history when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      loadConversationHistory();
    }
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      const response = await getConversationsWithFiles();
      setConversations(response || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationHistory = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const response = await getConversationWithFiles(conversationId);
      if (response && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setError('Erreur lors du chargement de l\'historique de conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // File drop configuration
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      setError(`Fichier rejeté: ${error.message}`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/rtf': ['.rtf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !conversationId) {
      setError('Veuillez sélectionner un fichier pour commencer une nouvelle conversation');
      return;
    }

    if (!question.trim()) {
      setError('Veuillez saisir une question');
      return;
    }

    console.log("Début de soumission du formulaire, activation de isLoading");
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    // Minuteur de sécurité pour garantir que isLoading revient à false après 15 secondes max
    const safetyTimer = setTimeout(() => {
      console.log("Force désactivation du chargement via minuteur de sécurité");
      setIsLoading(false);
    }, 15000);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await queryWithFile({
        file: selectedFile,
        question: question.trim(),
        conversation_id: conversationId
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response) {
        // Update conversation ID if it's a new conversation
        if (response.conversation_id && !conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add user message and AI response to messages
        const userMessage = {
          id: Date.now(),
          content: question,
          sender: 'user',
          timestamp: new Date().toISOString(),
          file: selectedFile ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type
          } : null
        };

        const aiMessage = {
          id: Date.now() + 1,
          content: response.answer,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, userMessage, aiMessage]);
        
        // Clear form
        setQuestion('');
        setSelectedFile(null);
        
        // Reload conversations list
        loadConversations();
      }    } catch (error) {
      console.error('Error submitting query:', error);
      setError(error.message || 'Erreur lors de l\'envoi de la question');
    } finally {
      clearTimeout(safetyTimer); // Nettoie le minuteur de sécurité
      console.log("Fin de soumission du formulaire, désactivation de isLoading");
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setSelectedFile(null);
    setQuestion('');
    setError(null);
    setShowConversations(false);
  };

  const selectConversation = (conv) => {
    setConversationId(conv.id);
    setShowConversations(false);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Chat avec Documents</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConversations(!showConversations)}
            >
              Conversations ({conversations.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewConversation}
            >
              Nouvelle conversation
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations sidebar */}
        {showConversations && (
          <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
            <h3 className="font-medium mb-3">Conversations avec fichiers</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    conversationId === conv.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectConversation(conv)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium truncate">
                      {conv.title || `Conversation ${conv.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {conv.file_count} fichier(s) • {conv.message_count} messages
                    </div>
                    {conv.last_message_date && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(conv.last_message_date).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {conversations.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune conversation avec fichiers</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {conversationId ? 'Conversation chargée' : 'Commencez une nouvelle conversation'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {conversationId 
                    ? 'Posez des questions sur les fichiers de cette conversation'
                    : 'Uploadez un document et posez des questions pour commencer'
                  }
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isUser={message.sender === 'user'}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Traitement en cours...</span>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t bg-white dark:bg-gray-800 p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* File upload area */}
            {!conversationId && (
              <div className="mb-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDragActive
                      ? 'Déposez le fichier ici...'
                      : 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOCX, TXT, MD, RTF (max 10MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload progress */}
            {isLoading && uploadProgress > 0 && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress < 90 ? 'Upload en cours...' : 'Traitement...'}
                </p>
              </div>
            )}

            {/* Question input */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={conversationId 
                  ? "Posez une question sur les fichiers de cette conversation..."
                  : "Posez une question sur votre document..."
                }
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || (!selectedFile && !conversationId) || !question.trim()}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            <div className="mt-2 text-xs text-gray-500 text-center">
              {conversationId 
                ? 'Continuez votre conversation avec les fichiers déjà uploadés'
                : 'Uploadez un fichier et posez une question pour commencer'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
