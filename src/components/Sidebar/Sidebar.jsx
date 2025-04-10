import React, { useState, useEffect } from "react";
import {
  Sidebar as UISidebar,
  SidebarContent
} from "../ui/sidebar";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import { ScrollArea } from "../ui/scroll-area";
import { getConversationHistory } from "../../Services/chatService";
import { useAuth } from "../../contexts/AuthContext";
import { useSearch } from "../../hooks/useSearch";
import { useFilter } from "../../hooks/useFilter";
import { createNewConversation } from "../../Services/chatService";


export function Sidebar({ onConversationSelect, refreshTrigger = 0 }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const { searchQuery, setSearchQuery, filteredItems: searchFilteredItems } = useSearch(conversations);
  const { selectedFilter, setSelectedFilter, filteredItems: categoryFilteredItems } = useFilter(searchFilteredItems);

  // Charger les conversations lorsque l'utilisateur est connecté ou quand refreshTrigger change
  useEffect(() => {
    const loadConversations = async () => {
      if (isAuthenticated) {
        setLoading(true);
        setError(null);
  
        try {
          const historicConversations = await getConversationHistory();
          setConversations(historicConversations);
        } catch (error) {
          console.error("Erreur lors du chargement des conversations :", error);
          setError("Impossible de charger l'historique des conversations");
        } finally {
          setLoading(false);
        }
      } else {
        setConversations([]);
      }
    };
  
    loadConversations();
  }, [isAuthenticated, refreshTrigger]);// Ajouter refreshTrigger comme dépendance

  // Fonction pour démarrer une nouvelle conversation
const handleNewChat = async () => {
  try {
    const newConversation = await createNewConversation();
    console.log("Nouvelle conversation créée avec ID:", newConversation.conversation_id);
    
    if (newConversation.conversation_id && onConversationSelect) {
      onConversationSelect(newConversation.conversation_id);
    }
  } catch (error) {
    console.error("Erreur lors de la création d'une nouvelle conversation :", error);
  }
};

  // Fonction pour sélectionner une conversation existante
  const handleSelectConversation = (conversationId) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  return (
    <UISidebar className="mt-16">
      <SidebarContent className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background">
          <SidebarHeader 
            selectedFilter={selectedFilter} 
            setSelectedFilter={setSelectedFilter}
            onSearch={setSearchQuery}
            onNewChat={handleNewChat}
          />
        </div>
        <div className="flex-1 overflow-hidden group">
          <div className="h-full">
            <ScrollArea 
              viewportClassName="h-full"
              className="transition-opacity duration-300"
              type="hover"
            >
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#16698C]"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500 text-sm">
                  {error}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {isAuthenticated 
                    ? "Aucune conversation trouvée. Commencez une nouvelle conversation !" 
                    : "Connectez-vous pour voir votre historique de conversations"}
                </div>
              ) : (
                <ConversationList 
                  conversations={categoryFilteredItems}
                  searchQuery={searchQuery}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </UISidebar>
  );
}