import { useState } from 'react';

// fonction pour surligner le texte recherché
export const highlightText = (text, searchQuery) => {
  if (!searchQuery?.trim()) return text;
  
  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === searchQuery.toLowerCase() ? (
      <span key={index} style={{ backgroundColor: '#15ACCD40', color: '#15ACCD' }}>{part}</span>
    ) : part
  );
};

// hook personnalisé pour la recherche
export const useSearch = (items, searchFields = ['title', 'preview']) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return searchFields.some(field => 
      item[field]?.toLowerCase().includes(query)
    );
  });

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    highlightText
  };
}; 