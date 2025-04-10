import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import { sendQuery, getConversationById } from "../../Services/chatService";

export default function AppChat({ conversationId = null, onConversationDeleted }) {
  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Charger une conversation spécifique quand conversationId change
useEffect(() => {
  const loadConversation = async () => {
    if (!conversationId) {
      // Si aucune conversation n'est sélectionnée, réinitialiser les messages
      setMessages([]);
      setCurrentConversationId(null);
      return;
    }
    
    // Mettre à jour l'ID de la conversation actuelle
    setCurrentConversationId(conversationId);
    console.log("ID de conversation mis à jour:", conversationId);
    
    // Pour une nouvelle conversation, ne pas essayer de charger l'historique
    // On pourrait ajouter une vérification ici si nécessaire
    // (par exemple, une prop isNewConversation)
    
    setIsLoadingConversation(true);
    
    try {
      const conversation = await getConversationById(conversationId);
      
      if (conversation && conversation.messages) {
        setMessages(conversation.messages);
      } else {
        // Important : garder l'ID de conversation même si l'historique est vide
        setMessages([]);
        // NE PAS réinitialiser currentConversationId ici !
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation :", error);
      // Important : NE PAS réinitialiser currentConversationId en cas d'erreur !
    } finally {
      setIsLoadingConversation(false);
    }
  };
  
  loadConversation();
}, [conversationId]);

  const sendMessage = async (text) => {
    const newMessage = { id: Date.now(), text, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    setIsLoading(true);
    
    try {
      console.log("Envoi de message avec ID de conversation:", currentConversationId);

      const response = await sendQuery(text, currentConversationId);

      if (response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
      }

      const botReply = {
        id: Date.now() + 1,
        text: response.answer,
        sender: "bot",
        sources: response.sources || [],
      };

      setMessages([...updatedMessages, botReply]);
    } catch (error) {
      console.error("Erreur de communication avec le backend :", error);

      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.",
        sender: "bot",
        isError: true,
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    const newMessages = [...messages];

    Array.from(files).forEach((file, index) => {
      const newMessage = {
        id: Date.now() + index,
        text: `Pièce jointe : ${file.name}`,
        sender: "user",
      };
      newMessages.push(newMessage);
    });

    setMessages(newMessages);
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleDeleteConversation = (deletedConversationId) => {
    if (deletedConversationId === currentConversationId) {
      startNewConversation();
    }

    if (onConversationDeleted) {
      onConversationDeleted(deletedConversationId);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-[calc(100%-16rem)] h-screen flex flex-col overflow-hidden">
      <div className="h-16 shrink-0 bg-background border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {isLoadingConversation ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-[#16698C] rounded-full"></span>
              Chargement...
            </span>
          ) : currentConversationId ? (
            `Conversation #${currentConversationId.substring(0, 8)}...`
          ) : (
            "Nouvelle conversation"
          )}
        </h2>
        <button
          onClick={startNewConversation}
          className="px-3 py-1 bg-[#16698C] text-white rounded-md hover:bg-[#15ACCD] text-sm"
        >
          Nouvelle conversation
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4">
          <ChatBox
            messages={messages}
            isLoading={isLoading || isLoadingConversation}
            conversationId={currentConversationId}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      </div>

      <div className="h-16 shrink-0 bg-background border-t p-4">
        <InputBox
          sendMessage={sendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          disabled={isLoadingConversation}
        />
      </div>
    </div>
  );
}