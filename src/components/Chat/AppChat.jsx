import { useState } from "react";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import { sendQuery } from "../../Services/chatService";

export default function AppChat({ isSidebarOpen }) {
  const [messages, setMessages] = useState([
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text) => {
    // Ajouter le message de l'utilisateur
    const newMessage = { id: messages.length + 1, text, sender: "user" };
    setMessages([...messages, newMessage]);
    
    // Indiquer que nous sommes en train de charger
    setIsLoading(true);
    
    try {
      // Envoyer la requête au backend
      const response = await sendQuery(text, conversationId);
      
      // Sauvegarder l'ID de conversation pour les futurs échanges
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      // Ajouter la réponse du bot
      const botReply = { 
        id: messages.length + 2, 
        text: response.answer, 
        sender: "bot",
        sources: response.sources || []
      };
      
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      // Gérer les erreurs
      const errorMessage = { 
        id: messages.length + 2, 
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.", 
        sender: "bot",
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    // Pour chaque fichier, créer un message avec le nom du fichier
    Array.from(files).forEach(file => {
      const newMessage = { 
        id: messages.length + 1, 
        text: `Pièce jointe : ${file.name}`,
        sender: "user",
        file: file
      };
      setMessages([...messages, newMessage]);
    });
  };

  return (
    <div className="fixed right-0 top-0 w-[calc(100%-16rem)] h-screen flex flex-col overflow-hidden">
      {/* ChatBox */}
      <div className="flex-1 min-h-0">
        <div className="h-[calc(100vh-8rem)] overflow-y-auto p-4">
          <ChatBox messages={messages} isLoading={isLoading} />
        </div>
      </div>

      {/* Barre d'Entrée */}
      <div className="h-16 shrink-0 bg-background border-t p-4">
        <InputBox 
          sendMessage={sendMessage} 
          isSidebarOpen={isSidebarOpen}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}