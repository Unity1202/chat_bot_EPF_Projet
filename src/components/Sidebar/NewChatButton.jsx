import React from 'react';
import { Plus } from "lucide-react"; // Assurez-vous que l'import est correct

import { Button } from "../ui/button";

const NewChatButton = ({ onClick }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={isLoading}
      size="sm" 
      variant="default"
      className="h-7 px-2 bg-[#16698C] hover:bg-[#16ACCD]/90 text-xs text-white font-medium md:rounded-2xl flex items-center gap-1"
    >
      <Plus className="h-4 w-4" /> {/* Utilisez Plus ici */}
      {isLoading ? 'Création...' : 'Nouvelle conversation'}
    </Button>
  );
};

export default NewChatButton;