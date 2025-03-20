import { useState } from "react";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";

export default function AppChat({ isSidebarOpen }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour, je suis votre assistant juridique spécialisé pour les Junior-Entreprises. Comment puis-je vous aider aujourd'hui ?", sender: "bot" }
  ]);

  const sendMessage = (text) => {
    const newMessage = { id: messages.length + 1, text, sender: "user" };
    setMessages([...messages, newMessage]);

    setTimeout(() => {
      const botReply = { id: messages.length + 2, text: "Je vais chercher cette information pour vous.", sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
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
          <ChatBox messages={messages} />
        </div>
      </div>

      {/* Barre d'Entrée */}
      <div className="h-16 shrink-0 bg-background border-t p-4">
        <InputBox 
          sendMessage={sendMessage} 
          isSidebarOpen={isSidebarOpen} 
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
  
}
