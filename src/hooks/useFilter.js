import { useState } from 'react';

// définition des couleurs des catégories
export const categoryColors = {
  all: '#16698C',
  treasury: '#F0CA28',
  organisational: '#CD1E72',
  other: '#09AD42'
};

export const categoryLabels = {
  all: 'Tout',
  treasury: 'Trésorie',
  organisational: 'Organisationnel',
  other: 'Autre'
};

export const useFilter = (items) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredItems = items.filter(item => 
    selectedFilter === 'all' || item.category === selectedFilter
  );

  return {
    selectedFilter,
    setSelectedFilter,
    filteredItems,
    categoryColors,
    categoryLabels
  };
}; 