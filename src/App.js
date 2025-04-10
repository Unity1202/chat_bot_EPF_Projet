// composant principal de l'application qui définit la structure de base
// organise les composants majeurs : header, sidebar et zone de chat
// utilise flexbox pour la mise en page responsive

import { useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar"
import Header from "./components/Header/Header"
import AppChat from "./components/Chat/AppChat"
import { AuthProvider } from "./contexts/AuthContext"

const App = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Pour forcer le rafraîchissement de la Sidebar

  // Fonction pour sélectionner une conversation
  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
  };
  
  // Fonction pour rafraîchir la liste des conversations après une suppression
  const handleConversationDeleted = useCallback(() => {
    setRefreshTrigger(prev => prev + 1); // Incrémenter pour déclencher le rechargement
    setSelectedConversationId(null); // Réinitialiser la conversation sélectionnée
  }, []);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <div className="flex flex-1 relative">
          <Sidebar 
            onConversationSelect={handleConversationSelect}
            refreshTrigger={refreshTrigger} // Passer la valeur pour déclencher un rechargement
          />
          <main className="flex-1">
              <AppChat 
                conversationId={selectedConversationId}
                onConversationDeleted={handleConversationDeleted}
              />
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App