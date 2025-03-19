import React from 'react';
import { History, Plus } from "lucide-react";
import { Button } from "../ui/button";
import SearchBar from "./SearchBar";

const SidebarHeader = () => {
  return (
    <div className="border-b border-sidebar-border group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:pointer-events-none p-4 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <History className="h-3.5 w-3.5 text-[#16698C]" />
          <h2 className="text-sm font-medium">Historique</h2>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="h-7 px-2 bg-[#16698C] hover:bg-[#16698C]/90 text-xs font-medium rounded-md flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nouveau Chat
        </Button>
      </div>
      <SearchBar />
    </div>
  );
};

export default SidebarHeader; 