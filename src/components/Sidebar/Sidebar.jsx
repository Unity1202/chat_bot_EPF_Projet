import React, { useState, useEffect, useMemo } from "react";
import {
  Sidebar as UISidebar,
  SidebarContent
} from "../ui/sidebar";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import { getConversationHistory, deleteConversation, createNewConversation } from '../../Services/chatService';
import { Link } from 'react-router-dom';

import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "../../contexts/AuthContext";
import { useSearch } from "../../hooks/useSearch";
import { useFilter } from "../../hooks/useFilter";

export function Sidebar({ onConversationSelect, refreshTrigger = 0, activeConversationId, updatedConversation = null }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [filter] = useState(null);

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
  }, [isAuthenticated, refreshTrigger]);
  
  // Mettre à jour une conversation spécifique lorsque updatedConversation est fourni
  useEffect(() => {
    if (updatedConversation && updatedConversation.id && updatedConversation.title) {
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === updatedConversation.id) {
            console.log(`Mise à jour du titre de la conversation ${conv.id} : ${updatedConversation.title}`);
            return { ...conv, title: updatedConversation.title };
          }
          return conv;
        });
      });
    }
  }, [updatedConversation]);

  // Fonction pour démarrer une nouvelle conversation
  const handleNewChat = async () => {
    try {
      const newConversation = await createNewConversation();
      console.log("Nouvelle conversation créée avec ID:", newConversation.conversation_id);
      
      if (newConversation.conversation_id && onConversationSelect) {
        onConversationSelect(newConversation.conversation_id);

        // Rafraîchir la liste des conversations pour afficher la nouvelle
        const historicConversations = await getConversationHistory();
        setConversations(historicConversations);
      }
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation :", error);
    }
  };

  // Fonction pour supprimer une conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      setLoading(true);
      const success = await deleteConversation(conversationId);
      if (success) {
        // Mettre à jour la liste locale
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // Si c'était la conversation active, notifier le parent
        if (activeConversationId === conversationId) {
          onConversationSelect(null);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Échec de la suppression de la conversation");
    } finally {
      setLoading(false);
    }
  };

  // Version sans useMemo pour éviter l'erreur
  let filteredConversations = conversations;
  
  if (filter) {
    filteredConversations = filteredConversations.filter(conv => conv.category === filter);
  }
  
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filteredConversations = filteredConversations.filter(conv => 
      conv.title.toLowerCase().includes(searchLower) || 
      conv.preview.toLowerCase().includes(searchLower)
    );
  }

  // Fonction pour sélectionner une conversation existante
  const handleSelectConversation = (conversationId) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  return (
    <UISidebar className="mt-16">
      <SidebarContent className="flex flex-col h-full">        <div className="sticky top-0 z-10 bg-background">
          <SidebarHeader 
            selectedFilter={selectedFilter} 
            setSelectedFilter={setSelectedFilter}
            onSearch={setSearchQuery}
            onNewChat={handleNewChat}
          />
        </div>
        
        {/* Lien vers l'outil d'analyse de documents */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <Link 
            to="/document-analyzer" 
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 8h-9.5m7.5 4h-7.5m5.5 4h-5.5M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 2v6h6M18 2l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium text-sm">Analyse de Documents</span>
          </Link>
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
                  onDeleteConversation={handleDeleteConversation}
                  activeConversationId={activeConversationId}
                />
              )}
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </UISidebar>
  );
}