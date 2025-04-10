import React from 'react';
import Message from "./Message";
import { Trash2, BarChart } from "lucide-react";
import { deleteConversation } from "../../Services/chatService";

export default function ChatBox({ messages, isLoading, conversationId, onDeleteConversation }) {
  const showWelcomeMessage = messages.length === 0 && !isLoading;
  
  // Fonction pour supprimer la conversation courante
  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      try {
        const success = await deleteConversation(conversationId);
        if (success) {
          if (onDeleteConversation) {
            onDeleteConversation(conversationId);
          }
        } else {
          alert("Impossible de supprimer la conversation");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 relative">
      {/* Actions flottantes en haut à droite si une conversation est active */}
      {conversationId && messages.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-2">
          
        </div>
      )}
      
      {showWelcomeMessage && (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          <div className="w-16 h-16 bg-[#16698C] rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Bienvenue sur JuridicA</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Je suis votre assistant juridique spécialisé pour les Junior-Entreprises. 
            Comment puis-je vous aider aujourd'hui ?
          </p>
        </div>
      )}
      
      {messages.map((msg) => (
        <Message key={msg.id} text={msg.text} sender={msg.sender} sources={msg.sources} />
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
    </div>
  );
}