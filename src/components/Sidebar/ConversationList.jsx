import React from 'react';
import { Clock } from "lucide-react";
import { formatConversationDate } from '../../lib/dateUtils';
import { highlightText } from '../../hooks/useSearch';
import { categoryColors, categoryLabels } from '../../hooks/useFilter';

const ConversationItem = ({ title, preview, date, category, searchQuery = '' }) => (
  <div className="group relative flex cursor-pointer items-center rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
    <div className="flex-1 space-y-1">
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
  </div>
);

const ConversationList = ({ conversations, searchQuery = '' }) => {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-1 px-2">
        {conversations.map((conv) => (
          <ConversationItem 
            key={conv.id} 
            {...conv} 
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList; 