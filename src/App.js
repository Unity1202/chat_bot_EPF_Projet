// composant principal de l'application qui définit la structure de base
// organise les composants majeurs : header, sidebar et zone de chat
// utilise flexbox pour la mise en page responsive

import { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar/Sidebar"
import Header from "./components/Header/Header"
import AppChat from "./components/Chat/AppChat"
import AdminView from "./views/AdminView"
import ProtectedAdminRoute from "./components/Admin/ProtectedAdminRoute"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./contexts/AuthContext";
import { checkAuthentication } from "./Services/chatService";

const ChatContainer = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { isAuthenticated } = useAuth();
  
  // Vérifier l'authentification avant de charger la conversation
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoadingAuth(true);
        // Attendre quelques instants pour que l'authentification soit vérifiée
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Si l'URL contient un ID de conversation mais l'utilisateur n'est pas authentifié,
        // nous devons attendre que l'authentification soit terminée
        if (conversationId && !isAuthenticated) {
          // Vérifier directement avec l'API pour être sûr
          const authStatus = await checkAuthentication();
          console.log("Statut d'authentification vérifié:", authStatus);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    verifyAuth();
  }, [conversationId, isAuthenticated]);
  
  // Fonction pour sélectionner une conversation
  const handleConversationSelect = (conversationId) => {
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    } else {
      navigate('/');
    }
  };
  
  // Fonction pour rafraîchir la liste des conversations après une suppression
  const handleConversationDeleted = useCallback((deletedConversationId) => {
    setRefreshTrigger(prev => prev + 1);
    
    // Si la conversation supprimée est celle actuellement affichée
    if (conversationId === deletedConversationId) {
      navigate('/'); // Rediriger vers la page d'accueil
    }
  }, [conversationId, navigate]);

  return (
    <>
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar 
          onConversationSelect={handleConversationSelect}
          refreshTrigger={refreshTrigger}
          activeConversationId={conversationId}
        />        <main className="flex-1">
          {isLoadingAuth && conversationId ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16698C]"></div>
              <p className="ml-3 text-lg">Chargement de la conversation...</p>
            </div>
          ) : (
            <div className="flex flex-col">
              
              
              <div className="flex-1">
                <AppChat 
                  conversationId={conversationId}
                  onConversationDeleted={handleConversationDeleted}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

// Composant AuthenticatedApp pour s'assurer que nous avons la bonne information d'authentification
const AuthenticatedApp = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16698C]"></div>
      </div>
    );
  }
    return (
    <Routes>
      <Route path="/" element={<ChatContainer />} />
      <Route path="/chat/:conversationId" element={<ChatContainer />} />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminView /></ProtectedAdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Composant App principal avec la configuration des routes
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen w-full">
          <AuthenticatedApp />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;