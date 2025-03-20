import React from 'react';
import { Button } from "../../components/ui/button";

const FilterButtons = ({ selectedFilter, setSelectedFilter }) => {
  const filters = [
    { id: 'all', label: 'Tout', color: '#16698C' },
    { id: 'treasury', label: 'Trésorie', color: '#F0CA28' },
    { id: 'organisational', label: 'Organisationnel', color: '#CD1E72' },
    { id: 'other', label: 'Autre', color: '#09AD42' }
  ];

  return (
    <>
      <style>
        {filters.map(filter => `
          .filter-${filter.id}:not(.selected):hover {
            background-color: ${filter.color}30 !important;
          }
          .filter-${filter.id}.selected:hover {
            background-color: ${filter.color}bb !important;
          }
        `).join('')}
      </style>
      <div className="flex gap-1">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="xm"
            onClick={() => setSelectedFilter(filter.id)}
            style={{
              backgroundColor: selectedFilter === filter.id ? filter.color : 'transparent',
              color: selectedFilter === filter.id ? 'white' : filter.color,
            }}
            className={`flex-1 text-[11px] px-1 h-6 md:rounded-2xl filter-${filter.id} ${
              selectedFilter === filter.id ? 'selected' : ''
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default FilterButtons; 