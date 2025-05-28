import React,{ useState }  from 'react';
import { Clock, Trash2 } from "lucide-react";
import { formatConversationDate } from '../../lib/dateUtils';
import { highlightText } from '../../hooks/useSearch';
import { categoryColors, categoryLabels } from '../../hooks/useFilter';
import ConfirmationModal from '../ui/ConfirmationModal';

const ConversationItem = ({ id, title, preview, date, category, searchQuery = '', onSelect, onDelete }) => (
  <div 
    className="group relative flex cursor-pointer items-center rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

const ConversationList = ({ conversations, searchQuery = '', onSelectConversation, onDeleteConversation }) => {
  // Trier les conversations par date (la plus récente en premier)
  const [modalOpen, setModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
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
  };

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent px-2">
          {sortedConversations.length > 0 ? (
            <div className="space-y-1 py-2">
              {sortedConversations.map(conv => (
                <ConversationItem 
                  key={conv.id} 
                  {...conv} 
                  searchQuery={searchQuery}
                  onSelect={onSelectConversation}
                  onDelete={handleDelete}
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