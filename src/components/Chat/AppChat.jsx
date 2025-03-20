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

  return (
    <div className={`w-[calc(100vw-${isSidebarOpen ? '16rem' : '0px'})] transition-all duration-300 h-[calc(100vh-32px)] flex flex-col overflow-hidden`}>
      {/* En-tête */}
      <div className="h-16 shrink-0 bg-[#16698C] text-white text-center text-lg font-bold flex items-center justify-center">
        Assistant Juridique
      </div>

      {/* ChatBox */}
      <div className="flex-1 min-h-0">
        <div className="h-[calc(100vh-8rem)] overflow-y-auto p-4">
          <ChatBox messages={messages} />
        </div>
      </div>

      {/* Barre d'Entrée */}
      <div className="h-16 shrink-0 bg-white border-t p-4">
        <InputBox sendMessage={sendMessage} isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
  
}
