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
      variant="outline"
      className="flex items-center justify-center gap-2 w-full"
    >
      <Plus className="h-4 w-4" /> {/* Utilisez Plus ici */}
      {isLoading ? 'Création...' : 'Nouvelle conversation'}
    </Button>
  );
};

export default NewChatButton;