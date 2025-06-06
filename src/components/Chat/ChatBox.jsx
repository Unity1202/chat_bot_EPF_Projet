import React, { useEffect, useRef } from 'react';
import { Trash2 } from "lucide-react";
import Message from './Message';

export default function ChatBox({ messages, isLoading, conversationId, onDeleteConversation }) {
  const messagesEndRef = useRef(null);
  const showWelcomeMessage = !messages.length && !isLoading;

  // Effet pour faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleDeleteConversation = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      try {
        await onDeleteConversation(conversationId);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 relative scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent h-full">
      {/* Actions flottantes en haut à droite si une conversation est active */}
      {conversationId && messages.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-2">
        
        </div>
      )}
        {showWelcomeMessage && (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center -mt-20">
          <div className="flex justify-center">
            <img src="/logo_juridica.png" alt="JuridicA" className="w-24 h-24" />
          </div>
          <h2 className="text-3xl text-[#16698C] font-bold mb-2">Bienvenue sur JuridicA</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
            Je suis votre assistant juridique spécialisé pour les Junior-Entreprises.
            <br />
            Comment puis-je vous aider aujourd'hui ?
          </p>
        </div>
      )}
        {messages.map((msg) => (
        <Message 
          key={msg.id} 
          text={msg.text} 
          sender={msg.sender} 
          sources={msg.sources} 
          citations={msg.citations} 
        />
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-2">
          <div className="p-3 rounded-lg bg-background text-flex-1">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Élément de référence pour le défilement automatique */}
      <div ref={messagesEndRef} />
    </div>
  );
}