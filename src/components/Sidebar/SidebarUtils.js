/**
 * Utilitaires pour la barre latérale qui aident à gérer les conversations
 * et à optimiser les mises à jour de l'interface utilisateur
 */

/**
 * Met à jour une conversation dans la liste des conversations
 * 
 * @param {Array} conversations - Liste actuelle des conversations
 * @param {Object} updatedConv - Données de la conversation mise à jour
 * @returns {Array} - Liste mise à jour des conversations
 */
export const updateConversationInList = (conversations, updatedConv) => {
  if (!updatedConv || !updatedConv.id) return conversations;

  const conversationExists = conversations.some(conv => conv.id === updatedConv.id);

  if (conversationExists) {
    // Si la conversation existe déjà, mettre à jour son titre
    return conversations.map(conv => {
      if (conv.id === updatedConv.id) {
        return { ...conv, title: updatedConv.title || conv.title };
      }
      return conv;
    });
  } else {
    // Si c'est une nouvelle conversation, l'ajouter en tête de liste
    const newConversation = {
      id: updatedConv.id,
      title: updatedConv.title || "Nouvelle conversation",
      category: "other",
      timestamp: new Date().toISOString()
    };
    
    // Ajouter en tête de liste et limiter à 100 conversations max pour les performances
    return [newConversation, ...conversations].slice(0, 100);
  }
};
