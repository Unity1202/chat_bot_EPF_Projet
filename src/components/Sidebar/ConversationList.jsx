import React,{ useState }  from 'react';
import { Clock, Trash2 } from "lucide-react";
import { formatConversationDate } from '../../lib/dateUtils';
import { highlightText } from '../../hooks/useSearch';
import { categoryColors, categoryLabels } from '../../hooks/useFilter';
import ConfirmationModal from '../ui/ConfirmationModal';
// ScrollArea est gérée au niveau de Sidebar.jsx

const ConversationItem = ({ id, title, preview, date, category, searchQuery = '', onSelect, onDelete, isNew = false, activeConversationId }) => (
  <div 
    className={`group relative flex cursor-pointer items-center rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground conversation-item-hover ${isNew ? 'conversation-new' : ''} ${id === activeConversationId ? 'bg-sidebar-accent/20' : ''}`}
  >
    <div 
      className="flex-1 space-y-1"
      onClick={() => onSelect(id)}
    >
      <p className="text-sm font-medium leading-none">
        {highlightText(title, searchQuery)}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {highlightText(preview, searchQuery)}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatConversationDate(date)}</span>
        </div>
        <div 
          className="text-[10px] px-2 py-0.5 md:rounded-2xl"
          style={{
            backgroundColor: `${categoryColors[category]}30`,
            color: categoryColors[category],
          }}
        >
          {categoryLabels[category]}
        </div>
      </div>
    </div>

    {/* Bouton de suppression pour chaque conversation */}
    <button
      className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-opacity"
      onClick={(e) => {
        e.stopPropagation(); // Empêcher la sélection de la conversation lors du clic sur le bouton
        onDelete(id);
      }}
      title="Supprimer cette conversation"
      aria-label="Supprimer cette conversation"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
);

const ConversationList = ({ conversations, searchQuery = '', onSelectConversation, onDeleteConversation, activeConversationId }) => {
  // Trier les conversations par date (la plus récente en premier)
  const [modalOpen, setModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [newConversations, setNewConversations] = useState({});
    // Détection optimisée des nouvelles conversations pour un rendu plus fluide
  React.useEffect(() => {
    // Fonction pour marquer les nouvelles conversations
    const markNewConversations = () => {
      if (conversations.length === 0) return;
      
      // Utiliser une référence d'IDs précédemment vus
      const newConvsMap = {...newConversations};
      let hasChanges = false;
      
      // Identifier les nouvelles conversations qui viennent d'être ajoutées
      conversations.forEach(conv => {
        const now = new Date();
        const convTime = new Date(conv.date);
        const isRecent = (now - convTime) / 1000 < 3; // Réduit à 3 secondes
        
        // Si la conversation est récente et n'est pas déjà marquée comme nouvelle
        if (isRecent && !newConvsMap[conv.id]) {
          newConvsMap[conv.id] = true;
          hasChanges = true;
          
          // Programmer la suppression du statut "nouveau" après un délai
          setTimeout(() => {
            setNewConversations(prev => {
              const updated = {...prev};
              delete updated[conv.id];
              return updated;
            });
          }, 2000); // Réduit à 2 secondes pour une expérience plus fluide
        }
      });
      
      // Mise à jour optimisée, uniquement si nécessaire
      if (hasChanges) {
        setNewConversations(newConvsMap);
      }
    };
    
    // Application immédiate sans délai
    markNewConversations();
    
    // Pas besoin de nettoyage car il n'y a pas de timer à nettoyer
  }, [conversations, newConversations]);
  
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

 // Fonction pour ouvrir la modal de confirmation
 const handleDelete = (conversationId) => {
  setConversationToDelete(conversationId);
  setModalOpen(true);
};

  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    setModalOpen(false);
    setConversationToDelete(null);
  };
  
  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setModalOpen(false);
    setConversationToDelete(null);
  };  return (
    <>
      <div className="flex flex-col h-full">
        <div className="px-2">
          {sortedConversations.length > 0 ? (
            <div className="space-y-1 py-2">                {sortedConversations.map(conv => (
                  <ConversationItem 
                    key={conv.id} 
                    {...conv} 
                    searchQuery={searchQuery}
                    onSelect={onSelectConversation}
                    onDelete={handleDelete}
                    isNew={Boolean(newConversations[conv.id])}
                    activeConversationId={activeConversationId}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              Aucune conversation disponible
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={modalOpen}
        title="Supprimer la conversation"
        message="Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default ConversationList;