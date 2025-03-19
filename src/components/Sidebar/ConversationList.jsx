import React from 'react';
import { Clock } from "lucide-react";
import { formatConversationDate } from '../../lib/dateUtils';

const ConversationItem = ({ title, preview, date }) => (
  <div className="group relative flex cursor-pointer items-center rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
    <div className="flex-1 space-y-1">
      <p className="text-sm font-medium leading-none">{title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{preview}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatConversationDate(date)}</span>
      </div>
    </div>
  </div>
);

const ConversationList = ({ conversations }) => {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-1 px-2">
        {conversations.map((conv) => (
          <ConversationItem key={conv.id} {...conv} />
        ))}
      </div>
    </div>
  );
};

export default ConversationList; 