import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

const NewChatButton = () => {
  return (
    <Button 
      variant="default" 
      size="sm" 
      className="h-7 px-2 bg-[#16698C] hover:bg-[#16ACCD]/90 text-xs text-white font-medium md:rounded-2xl flex items-center gap-1"
    >
      <Plus className="h-4 w-4" />
      Nouveau Chat
    </Button>
  );
};

export default NewChatButton; 