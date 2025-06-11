import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import { sendQuery, getConversationById, deleteConversation, checkAuthentication } from "../../Services/chatService";
import { useAuth } from "../../contexts/AuthContext";

export default function AppChat({ conversationId = null, onConversationDeleted, onConversationUpdated }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [shouldNavigateToNewConversation, setShouldNavigateToNewConversation] = useState(false);

  // Vérifier l'authentification lorsque l'utilisateur accède à une conversation
  useEffect(() => {
    const verifyAuthentication = async () => {
      if (conversationId) {
        const isUserAuthenticated = await checkAuthentication();
        if (!isUserAuthenticated) {
          console.log("AppChat: Utilisateur non authentifié tentant d'accéder à une conversation, redirection vers l'accueil");
          navigate('/');
        }
      }
    };

    verifyAuthentication();
  }, [conversationId, navigate]);

  // Effet pour gérer la navigation lorsqu'une nouvelle conversation est créée automatiquement
  useEffect(() => {
    if (shouldNavigateToNewConversation) {
      console.log(`Navigation vers la nouvelle conversation: ${shouldNavigateToNewConversation}`);
      navigate(`/chat/${shouldNavigateToNewConversation}`);
      setShouldNavigateToNewConversation(null);
    }
  }, [shouldNavigateToNewConversation, navigate]);

// Dans useEffect qui charge la conversation
useEffect(() => {
  const loadConversation = async () => {    if (!conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
      setCurrentConversationTitle(null);
      setIsLoadingConversation(false); // S'assurer que le loading est désactivé
      return;
    }
    
    setCurrentConversationId(conversationId);
    console.log("ID de conversation mis à jour:", conversationId);
    
    setIsLoadingConversation(true);
    
    // Timeout de sécurité pour éviter un blocage infini
    const timeoutId = setTimeout(() => {
      console.warn("Timeout atteint lors du chargement de la conversation");
      setIsLoadingConversation(false);
    }, 10000); // 10 secondes
    
    try {
      const conversation = await getConversationById(conversationId);
        if (conversation) {
        // Mettre à jour le titre de la conversation
        setCurrentConversationTitle(conversation.title || null);
          if (conversation.messages && conversation.messages.length > 0) {
          // Debug pour vérifier les citations lors du chargement
          console.group('🔄 Loading Conversation Messages');
          console.log('Conversation loaded:', conversation);
          console.log('Messages count:', conversation.messages.length);
          conversation.messages.forEach((msg, index) => {
            if (msg.sender === 'bot') {
              console.log(`Message ${index} citations:`, msg.citations?.length || 0, msg.citations);
            }
          });
          console.groupEnd();
          
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
      // En cas d'erreur, s'assurer que l'interface reste utilisable
      setMessages([]);
      setCurrentConversationTitle(null);
    } finally {
      clearTimeout(timeoutId); // Annuler le timeout
      setIsLoadingConversation(false);
    }
  };
  
  loadConversation();
}, [conversationId]);  const sendMessage = async (text, options = {}) => {
    // Créer un message approprié selon le contenu
    let messageText = text;
    if (!text.trim() && options.files && options.files.length > 0) {
      // Si pas de texte mais des fichiers, créer un message descriptif
      const fileNames = options.files.map(file => file.name).join(', ');
      messageText = `📎 ${options.files.length} fichier${options.files.length > 1 ? 's' : ''} uploadé${options.files.length > 1 ? 's' : ''}: ${fileNames}`;
    }
    
    const newMessage = { id: Date.now(), text: messageText, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    setIsLoading(true);
    
    try {
      console.log("Envoi de message avec ID de conversation:", currentConversationId);
      console.log("Options RAG:", options);

      // Déterminer la requête à envoyer au backend
      let queryToSend = text.trim();
      if (!queryToSend && options.files && options.files.length > 0) {
        // Si pas de texte mais des fichiers, utiliser une requête par défaut
        queryToSend = "Analysez ce document et dites-moi ce qu'il contient.";
      }

      const response = await sendQuery(queryToSend, currentConversationId, options);
        // Vérifier si une nouvelle conversation a été créée
      if (response.conversation_id) {
        const newConversationCreated = !currentConversationId && response.conversation_id;
        setCurrentConversationId(response.conversation_id);
          // Si une nouvelle conversation a été créée automatiquement, marquer pour naviguer vers elle
        if (newConversationCreated) {
          console.log(`Nouvelle conversation créée automatiquement avec ID: ${response.conversation_id}`);
          setShouldNavigateToNewConversation(response.conversation_id);
          
          // Notifier immédiatement le parent qu'une nouvelle conversation a été créée
          if (onConversationUpdated) {
            // Extraire un titre temporaire basé sur le message ou utiliser un par défaut
            const userMessage = text.trim();
            const tempTitle = userMessage && userMessage.length > 5 
              ? (userMessage.length > 30 ? `${userMessage.substring(0, 30)}...` : userMessage)
              : "Nouvelle conversation";
            
            console.log(`Nouvelle conversation créée: ID=${response.conversation_id}, Titre temporaire="${tempTitle}"`);
            onConversationUpdated(response.conversation_id, tempTitle, true);
          }
        }
      }
      
      if (response.title) {
        console.log(`Titre reçu du backend: ${response.title}`);
        setCurrentConversationTitle(response.title);
        // Notifier le parent que la conversation a été mise à jour (titre modifié)
        if (onConversationUpdated) {
          console.log(`Appel de onConversationUpdated avec: ID=${response.conversation_id}, Title=${response.title}`);
          onConversationUpdated(response.conversation_id, response.title);
        }
      }// Traitement amélioré de la réponse pour RAG avec support multi-format
      const botReply = {
        id: Date.now() + 1,
        text: response.answer,
        sender: "bot",
        sources: response.sources || [],
        // Mapper toutes les variantes possibles de citations (comme dans chatService)
        citations: response.citations || response.excerpts || response.context_excerpts || response.rag_excerpts || [],
        // Ajouter les informations du document généré si disponible
        generatedDocument: response.generatedDocument
      };

      // Debug pour vérifier les citations reçues
      console.group('🤖 Bot Reply Creation');
      console.log('Response from backend:', response);
      console.log('Available citation fields:');
      console.log('- citations:', response.citations?.length || 0);
      console.log('- excerpts:', response.excerpts?.length || 0);
      console.log('- context_excerpts:', response.context_excerpts?.length || 0);
      console.log('- rag_excerpts:', response.rag_excerpts?.length || 0);
      console.log('Bot reply created:', botReply);
      console.log('Final citations count:', botReply.citations?.length);
      console.log('Final citations data:', botReply.citations);
      console.groupEnd();

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
  };  const handleFileUpload = (files) => {
    try {
      // Vérification que les fichiers sont bien reçus
      if (!files || !files.length) {
        console.warn("Aucun fichier reçu dans handleFileUpload");
        return;
      }
      
      // Log pour debugging
      console.log(`${files.length} fichier(s) sélectionné(s):`, files.map(f => f.name));
      
      // IMPORTANT: Toujours forcer l'état isLoading à false après la sélection d'un fichier
      // pour garantir que l'interface reste utilisable
      setIsLoading(false);
      
      // On pourrait ajouter ici d'autres traitements liés aux fichiers si nécessaire
      // Comme la préparation pour afficher une prévisualisation, etc.
    } catch (error) {
      console.error("Erreur dans handleFileUpload:", error);
      // Garantir que l'interface reste utilisable même en cas d'erreur
      setIsLoading(false);
    }
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
      </div>      <div className="h-16 shrink-0 bg-background border-t p-4">
        <InputBox
          sendMessage={sendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading} 
          key={`input-${conversationId || 'new'}`} // Utiliser conversationId au lieu de Date.now() pour améliorer la stabilité
        />
      </div>
    </div>
  );
}