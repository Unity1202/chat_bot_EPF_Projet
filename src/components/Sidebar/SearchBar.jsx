import React from 'react';
import { Search } from "lucide-react";
import { Input } from "../ui/input";

const SearchBar = ({ placeholder = "Rechercher...", onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-2 top-[7px] h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="h-7 px-7 py-1 text-xs"
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar; 