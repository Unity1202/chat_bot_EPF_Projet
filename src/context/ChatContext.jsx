import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);

  const addConversation = (newConversation) => {
    setConversations((prev) => [...prev, newConversation]);
  };

  return (
    <ChatContext.Provider value={{ conversations, addConversation }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
