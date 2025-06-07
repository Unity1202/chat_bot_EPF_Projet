import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Book, FileQuestion } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { queryDocument } from '../../Services/documentAnalysisService';
import { Card } from '../ui/card';

/**
 * Composant pour poser des questions sur un document
 */
export default function DocumentChat({
  document,
  conversationId,
  chatHistory,
  onNewMessage,
  onError,
  setLoading,
  isLoading
}) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);
  
  // Liste des questions suggérées
  const suggestedQuestions = [
    "Résume ce document en quelques phrases",
    "Quels sont les points clés de ce document?",
    "Y a-t-il des problèmes juridiques dans ce document?",
    "Comment pourrais-je améliorer ce document?"
  ];

  // Faire défiler vers le bas quand il y a de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Envoyer une question
  const handleSendQuestion = async (questionText = question) => {
    if (!questionText || !document) return;

    // Ajouter la question à l'historique immédiatement
    const userMessage = {
      id: `user-${Date.now()}`,
      text: questionText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    onNewMessage(userMessage);
    
    setQuestion('');
    setLoading(true);
      try {
      const response = await queryDocument(
        document.id, 
        questionText, 
        conversationId
      );
        // Ajouter la réponse à l'historique
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sources: response.sources || [],
        conversation_id: response.conversation_id
      };
      
      onNewMessage(botMessage);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  // Si pas de document, afficher un message
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Aucun document sélectionné</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Veuillez uploader un document dans l'onglet précédent
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center">
          <Book className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold">Questions sur le Document</h2>
        </div>
        <div className="text-sm text-gray-500">
          {document.name}
        </div>
      </div>

      {chatHistory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <FileQuestion className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Posez des questions sur votre document</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Vous pouvez interroger le document sur son contenu. 
            L'IA analysera le document et vous fournira des réponses précises.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {suggestedQuestions.map((q, index) => (
              <Button 
                key={index} 
                variant="outline" 
                onClick={() => handleSendQuestion(q)}
                className="text-left justify-start h-auto py-3"
              >
                <span className="truncate">{q}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`p-3 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-[#16698C] text-white'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                
                {/* Afficher les références au document s'il y en a */}
                {message.references && message.references.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-sm">
                    <div className="font-medium mb-1">Références:</div>
                    <ul className="space-y-1">
                      {message.references.map((ref, index) => (
                        <li key={index} className="italic text-gray-600 dark:text-gray-300">
                          "{ref.text}" - {ref.page ? `p. ${ref.page}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="flex items-center mt-auto pt-4 border-t">
        <Input
          type="text"
          placeholder="Posez une question sur votre document..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
          className="flex-1 mr-2"
        />
        <Button
          onClick={() => handleSendQuestion()}
          disabled={!question || isLoading}
        >
          <Send className="h-4 w-4" />
          <span className="ml-2">Envoyer</span>
        </Button>
      </div>
    </div>
  );
}
