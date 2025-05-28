import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import { sendQuery, getConversationById, deleteConversation } from "../../Services/chatService";

export default function AppChat({ conversationId = null, onConversationDeleted }) {  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

// Dans useEffect qui charge la conversation
useEffect(() => {
  const loadConversation = async () => {    if (!conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
      setCurrentConversationTitle(null);
      return;
    }
    
    setCurrentConversationId(conversationId);
    console.log("ID de conversation mis à jour:", conversationId);
    
    setIsLoadingConversation(true);
    
    try {
      const conversation = await getConversationById(conversationId);
        if (conversation) {
        // Mettre à jour le titre de la conversation
        setCurrentConversationTitle(conversation.title || null);
        
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages);
        } else {
          // Pour une nouvelle conversation, ajouter un message d'accueil du bot
          setMessages([{
            id: `welcome-${Date.now()}`,
            text: "Bonjour, comment puis-je vous aider aujourd'hui ?",
            sender: "bot",
            timestamp: new Date().toISOString()
          }]);
        }
      } else {
        setMessages([]);
        setCurrentConversationTitle(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation :", error);
    } finally {
      setIsLoadingConversation(false);
    }
  };
  
  loadConversation();
}, [conversationId]);  const sendMessage = async (text, options = {}) => {
    const newMessage = { id: Date.now(), text, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    setIsLoading(true);
    
    try {
      console.log("Envoi de message avec ID de conversation:", currentConversationId);
      console.log("Options RAG:", options);

      const response = await sendQuery(text, currentConversationId, options);

      if (response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
      }
      
      if (response.title) {
        setCurrentConversationTitle(response.title);
      }

      // Traitement amélioré de la réponse pour RAG
      const botReply = {
        id: Date.now() + 1,
        text: response.answer,
        sender: "bot",
        sources: response.sources || [],
        citations: response.citations || [],
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
  };  const handleFileUpload = async (files) => {
    // Store files temporarily to be sent with the next message
    // The actual upload will happen when the user sends a message
    // For now, just show a confirmation message
    const newMessages = [...messages];
    
    const fileNames = Array.from(files).map(file => file.name).join(', ');
    const fileMessage = {
      id: Date.now(),
      text: `Fichier${files.length > 1 ? 's' : ''} ajouté${files.length > 1 ? 's' : ''} : ${fileNames}`,
      sender: "user",
    };
    
    newMessages.push(fileMessage);
    
    const botReply = {
      id: Date.now() + 1,
      text: `J'ai bien reçu ${files.length} fichier${files.length > 1 ? 's' : ''}. Posez-moi votre question et j'utiliserai ce${files.length > 1 ? 's' : ''} document${files.length > 1 ? 's' : ''} pour vous répondre.`,
      sender: "bot",
    };
    
    setMessages([...newMessages, botReply]);
  };
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentConversationTitle(null);
  };
  const handleDeleteConversation = async (convId) => {
    try {
      const success = await deleteConversation(convId);
      if (success && onConversationDeleted) {
        // Notifier le composant parent que la conversation a été supprimée
        onConversationDeleted(convId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
      throw error; // Rethrow pour que ChatBox puisse afficher un message d'erreur
    }
  };

  return (
    <div className="fixed right-0 top-0 w-[calc(100%-16rem)] h-screen flex flex-col overflow-hidden">
      <div className="h-16 shrink-0 bg-background border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">          {isLoadingConversation ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-[#16698C] rounded-full"></span>
              Chargement...
            </span>
          ) : currentConversationId ? (
            currentConversationTitle || `Conversation #${currentConversationId.substring(0, 8)}...`
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
        isLoading={isLoading}
        conversationId={conversationId}
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