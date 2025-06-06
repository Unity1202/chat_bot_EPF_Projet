import React from 'react';
import { History } from "lucide-react";

const HistoryHeader = () => {
  return (
    <div className="flex items-center gap-1">
      <History className="h-3.5 w-3.5 text-[#16698C]" />
      <h2 className="text-l font-medium">Historique</h2>
    </div>
  );
};

export default HistoryHeader; 