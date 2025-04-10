import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import { sendQuery, getConversationById } from "../../Services/chatService";
import { useAuth } from "../../contexts/AuthContext";

export default function AppChat({ conversationId = null, onConversationDeleted }) {
  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Clé unique pour le localStorage basée sur l'utilisateur connecté
  const getStorageKey = () => {
    // Si l'utilisateur est authentifié, on utilise son email
    const userIdentifier = user?.email || sessionStorage.getItem('user_email') || 'anonymous';
    return `chat_conversation_${userIdentifier}`;
  };

  // Charger les messages depuis le localStorage au démarrage initial
  useEffect(() => {
    const loadInitialMessages = () => {
      // Ne pas charger les données si on a spécifié une conversation à charger
      if (conversationId !== null) return;

      try {
        const storedData = localStorage.getItem(getStorageKey());
        if (storedData) {
          const data = JSON.parse(storedData);
          setMessages(data.messages || []);
          setCurrentConversationId(data.conversationId || null);
          console.log("Conversation chargée depuis le localStorage:", data.conversationId);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    };

    loadInitialMessages();
  }, []);

  // Charger une conversation spécifique quand conversationId change
  useEffect(() => {
    const loadConversation = async () => {
      // Si on reçoit null, c'est une nouvelle conversation
      if (conversationId === null) {
        // Ne pas effacer si on a des messages en cache et qu'il s'agit du chargement initial
        if (messages.length === 0) {
          return;
        }
        
        setMessages([]);
        setCurrentConversationId(null);
        localStorage.removeItem(getStorageKey());
        return;
      }
      
      // Si on a déjà la même conversation, ne rien faire
      if (conversationId === currentConversationId) {
        return;
      }
      
      setIsLoadingConversation(true);
      
      try {
        const conversation = await getConversationById(conversationId);
        
        if (conversation) {
          setMessages(conversation.messages);
          setCurrentConversationId(conversation.conversationId);
          
          // Sauvegarder dans le localStorage
          const dataToSave = {
            messages: conversation.messages,
            conversationId: conversation.conversationId,
            timestamp: new Date().getTime()
          };
          
          localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
        } else {
          // En cas d'erreur, démarrer une nouvelle conversation mais ne pas effacer le localStorage
          setMessages([]);
          setCurrentConversationId(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la conversation:", error);
      } finally {
        setIsLoadingConversation(false);
      }
    };
    
    loadConversation();
  }, [conversationId]);

  // Sauvegarder les messages dans le localStorage à chaque changement
  useEffect(() => {
    if (messages.length > 0 || currentConversationId) {
      const dataToSave = {
        messages,
        conversationId: currentConversationId,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
      console.log("Conversation sauvegardée dans localStorage:", currentConversationId);
    }
  }, [messages, currentConversationId]);

  const sendMessage = async (text) => {
    // Ajouter le message de l'utilisateur
    const newMessage = { id: Date.now(), text, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Indiquer que nous sommes en train de charger
    setIsLoading(true);
    
    try {
      // Envoyer la requête au backend
      const response = await sendQuery(text, currentConversationId);
      
      // Sauvegarder l'ID de conversation pour les futurs échanges
      if (response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
      }
      
      // Ajouter la réponse du bot
      const botReply = { 
        id: Date.now() + 1, 
        text: response.answer, 
        sender: "bot",
        sources: response.sources || []
      };
      
      setMessages([...updatedMessages, botReply]);
    } catch (error) {
      console.error("Erreur de communication avec le backend:", error);
      
      // Gérer les erreurs
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.", 
        sender: "bot",
        isError: true
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    // Pour chaque fichier, créer un message avec le nom du fichier
    const newMessages = [...messages];
    
    Array.from(files).forEach((file, index) => {
      const newMessage = { 
        id: Date.now() + index, 
        text: `Pièce jointe : ${file.name}`,
        sender: "user",
        file: file.name // On ne peut pas stocker le File directement dans localStorage
      };
      newMessages.push(newMessage);
    });
    
    setMessages(newMessages);
  };

  // Fonction pour démarrer une nouvelle conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem(getStorageKey());
  };
  
  // Gestionnaire pour la suppression d'une conversation
  const handleDeleteConversation = (deletedConversationId) => {
    if (deletedConversationId === currentConversationId) {
      // Si la conversation supprimée est la conversation actuelle, démarrer une nouvelle
      startNewConversation();
    }
    
    // Notifier le parent pour mettre à jour la liste des conversations
    if (onConversationDeleted) {
      onConversationDeleted(deletedConversationId);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-[calc(100%-16rem)] h-screen flex flex-col overflow-hidden">
      {/* En-tête de conversation avec bouton nouvelle conversation */}
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
      
      {/* ChatBox */}
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

      {/* Barre d'Entrée */}
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