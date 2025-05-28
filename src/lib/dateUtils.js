// fonction pour formater les dates des conversations
export function formatConversationDate(date) {
  const now = new Date();
  const conversationDate = new Date(date);
  
  // même jour
  if (
    conversationDate.getDate() === now.getDate() &&
    conversationDate.getMonth() === now.getMonth() &&
    conversationDate.getFullYear() === now.getFullYear()
  ) {
    return "Aujourd'hui";
  }
  
  // hier
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    conversationDate.getDate() === yesterday.getDate() &&
    conversationDate.getMonth() === yesterday.getMonth() &&
    conversationDate.getFullYear() === now.getFullYear()
  ) {
    return "Hier";
  }
  
  // calcul de la différence en jours
  const diffTime = now - conversationDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // entre 2 et 6 jours
  if (diffDays >= 2 && diffDays <= 6) {
    return `Il y a ${diffDays} jours`;
  }
  
  // semaine dernière
  if (diffDays > 6 && diffDays <= 13) {
    return "La semaine dernière";
  }

  // ce mois
  if (
    conversationDate.getMonth() === now.getMonth() &&
    conversationDate.getFullYear() === now.getFullYear()
  ) {
    return "Ce mois";
  }
  
  // mois dernier
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  if (
    conversationDate.getMonth() === lastMonth.getMonth() &&
    conversationDate.getFullYear() === now.getFullYear()
  ) {
    return "Le mois dernier";
  }
  
  // si c'est cette année, afficher le mois
  if (conversationDate.getFullYear() === now.getFullYear()) {
    const mois = conversationDate.toLocaleString('fr-FR', { month: 'long' });
    return mois.charAt(0).toLowerCase() + mois.slice(1);
  }
  
  // année précédente
  return conversationDate.getFullYear().toString();
} 

// Fonction pour regrouper les conversations par période de temps
export function groupConversationsByDate(conversations) {
  const groups = {
    "Aujourd'hui": [],
    "Hier": [],
    "Cette semaine": [],
    "Ce mois": [],
    "Le mois dernier": [],
    "Plus ancien": []
  };
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(now.getDate() - 7);
  
  const lastMonthDate = new Date(now);
  lastMonthDate.setMonth(now.getMonth() - 1);
  
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  conversations.forEach(conversation => {
    const convDate = new Date(conversation.date);
    
    // Aujourd'hui
    if (convDate.toDateString() === now.toDateString()) {
      groups["Aujourd'hui"].push(conversation);
    }
    // Hier
    else if (convDate.toDateString() === yesterday.toDateString()) {
      groups["Hier"].push(conversation);
    }
    // Cette semaine
    else if (convDate > lastWeekDate) {
      groups["Cette semaine"].push(conversation);
    }
    // Ce mois
    else if (convDate.getMonth() === now.getMonth() && convDate.getFullYear() === now.getFullYear()) {
      groups["Ce mois"].push(conversation);
    }
    // Le mois dernier
    else if (convDate > lastMonthDate) {
      groups["Le mois dernier"].push(conversation);
    }
    // Plus ancien
    else {
      groups["Plus ancien"].push(conversation);
    }
  });
  
  // Trier les conversations dans chaque groupe
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  return groups;
}