import React, { useState, useEffect, useMemo, useCallback } from "react";
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

export function Sidebar({ onConversationSelect, refreshTrigger = 0, activeConversationId, updatedConversation = null }) {  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const { searchQuery, setSearchQuery, filteredItems: searchFilteredItems } = useSearch(conversations);
  const { selectedFilter, setSelectedFilter, filteredItems: categoryFilteredItems } = useFilter(searchFilteredItems);  // Charger les conversations lorsque l'utilisateur est connecté ou quand refreshTrigger change
  useEffect(() => {
    let isMounted = true; // Pour éviter les mises à jour si le composant est démonté
    
    const loadConversations = async () => {
      if (!isAuthenticated) {
        if (isMounted) setConversations([]);
        return;
      }
      
      // Ne pas montrer de chargement pour une meilleure expérience utilisateur
      // Conserver les conversations existantes pendant le chargement
      setError(null);
      
      try {
        const historicConversations = await getConversationHistory();
        if (isMounted) {
          setConversations(prevConversations => {
            // Si nous avons des conversations temporaires, vérifier qu'elles sont présentes
            // dans les nouvelles données ou les conserver
            const tempConversations = prevConversations.filter(
              temp => !historicConversations.some(hist => hist.id === temp.id)
            );
            
            return [...tempConversations, ...historicConversations];
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des conversations :", error);
        if (isMounted) {
          setError("Impossible de charger l'historique des conversations");
        }
      }
    };
    
    loadConversations();
    
    // Nettoyage
    return () => {
      isMounted = false;
    };  }, [isAuthenticated, refreshTrigger]);
  // Mettre à jour une conversation spécifique lorsque updatedConversation est fourni
  useEffect(() => {
    if (updatedConversation && updatedConversation.id && updatedConversation.title) {
      // Si c'est une nouvelle conversation ou si une mise à jour majeure est signalée
      if (updatedConversation.isNew) {
        console.log(`Nouvelle conversation détectée (${updatedConversation.id}), ajout immédiat`);
        
        // Créer une nouvelle conversation temporaire avec les données essentielles
        const tempConversation = {
          id: updatedConversation.id,
          title: updatedConversation.title || "Nouvelle conversation",
          preview: "Conversation en cours...",
          date: new Date().toISOString(),
          category: "générale" // Catégorie par défaut
        };
        
        // Ajouter immédiatement la conversation temporaire
        setConversations(prev => {
          // Vérifier si cette conversation existe déjà
          const exists = prev.some(conv => conv.id === updatedConversation.id);
          if (!exists) {
            // Ajouter en tête de liste
            return [tempConversation, ...prev];
          }
          return prev;
        });
        
        // Charger les conversations en arrière-plan sans modifier l'UI
        const loadNewConversationsInBackground = async () => {
          try {
            // Pas besoin de setLoading car nous ne montrons plus d'indicateur de chargement
            const historicConversations = await getConversationHistory();
            
            // Mise à jour silencieuse en conservant la conversation temporaire si elle n'existe pas encore
            setConversations(prev => {
              // Vérifier que la conversation temporaire est présente dans les données récupérées
              const tempExists = historicConversations.some(conv => conv.id === updatedConversation.id);
              if (!tempExists) {
                // Si la conversation n'existe pas encore côté serveur, garder celle temporaire
                return [tempConversation, ...historicConversations.filter(conv => conv.id !== updatedConversation.id)];
              }
              return historicConversations;
            });
          } catch (error) {
            console.error("Erreur lors du rechargement des conversations en arrière-plan:", error);
          }
        };
        
        // Exécuter immédiatement mais en arrière-plan
        loadNewConversationsInBackground();
      } else {
        // Sinon on met simplement à jour la conversation existante
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
    }
  }, [updatedConversation, isAuthenticated]);
  // Fonction pour démarrer une nouvelle conversation
  const handleNewChat = async () => {
    try {
      // Créer une conversation temporaire optimiste avant l'appel API
      const tempId = `temp-${Date.now()}`;
      const tempConversation = {
        id: tempId,
        title: "Nouvelle conversation",
        preview: "Chargement...",
        date: new Date().toISOString(),
        category: "générale",
        isTemporary: true
      };
      
      // Ajouter immédiatement la conversation temporaire
      setConversations(prev => [tempConversation, ...prev]);
      
      // Créer la conversation côté serveur
      const newConversation = await createNewConversation();
      console.log("Nouvelle conversation créée avec ID:", newConversation.conversation_id);
      
      if (newConversation.conversation_id && onConversationSelect) {
        // Naviguer vers la conversation
        onConversationSelect(newConversation.conversation_id);
        
        // Remplacer silencieusement la conversation temporaire par la réelle
        setConversations(prev => {
          const withoutTemp = prev.filter(c => c.id !== tempId);
          
          // Créer une conversation réelle basée sur la réponse API
          const realConversation = {
            id: newConversation.conversation_id,
            title: "Nouvelle conversation",
            preview: "Conversation en cours...",
            date: new Date().toISOString(),
            category: "générale"
          };
          
          return [realConversation, ...withoutTemp];
        });
        
        // Charger les conversations en arrière-plan pour mise à jour silencieuse
        setTimeout(async () => {
          try {
            const historicConversations = await getConversationHistory();
            setConversations(historicConversations);
          } catch (err) {
            console.error("Erreur lors du rafraîchissement en arrière-plan:", err);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation :", error);
      // En cas d'erreur, supprimer la conversation temporaire
      setConversations(prev => prev.filter(c => !c.isTemporary));
    }
  };
  // Fonction pour supprimer une conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      // Mettre à jour l'UI immédiatement pour une meilleure réactivité
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Si c'était la conversation active, notifier le parent
      if (activeConversationId === conversationId) {
        onConversationSelect(null);
      }
      
      // Effectuer la suppression côté serveur en arrière-plan
      const success = await deleteConversation(conversationId);
      
      if (!success) {
        console.error("Échec de la suppression côté serveur");
        // En cas d'échec, on pourrait restaurer la conversation, mais cela pourrait
        // être déroutant pour l'utilisateur. Mieux vaut simplement le notifier.
        setError("La conversation n'a pas pu être supprimée. Veuillez rafraîchir la page.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Échec de la suppression de la conversation");
    }
  };
  // Nous n'avons plus besoin de cette section car useSearch et useFilter gèrent déjà le filtrage

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
        </div>        <div className="flex-1 overflow-hidden group sidebar-conversations-container">          <div className="h-full">            <ScrollArea 
              viewportClassName="h-full"
              className="h-full"
              type="always"
            >
              {error ? (
                <div className="p-4 text-center text-red-500 text-sm">
                  {error}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {isAuthenticated 
                    ? "Aucune conversation trouvée. Commencez une nouvelle conversation !" 
                    : "Connectez-vous pour voir votre historique de conversations"}
                </div>
              ) : (                <div className="transition-all duration-200 ease-in-out">
                  <ConversationList 
                    conversations={categoryFilteredItems}
                    searchQuery={searchQuery}
                    onSelectConversation={handleSelectConversation}
                    onDeleteConversation={handleDeleteConversation}
                    activeConversationId={activeConversationId}
                  />
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </UISidebar>
  );
}