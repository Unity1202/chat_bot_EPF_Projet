import React from 'react';
import SearchBar from "./SearchBar";
import FilterButtons from "./FilterButtons";
import NewChatButton from "./NewChatButton";
import HistoryHeader from "./HistoryHeader";

const SidebarHeader = ({ selectedFilter, setSelectedFilter, onSearch, onNewChat }) => {
  return (
    <div className="border-b border-sidebar-border group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:pointer-events-none px-3 py-3 pb-3">
      <div className="flex items-center justify-between mb-4">
        <HistoryHeader />
        <NewChatButton onClick={onNewChat} />
      </div>
      <SearchBar onSearch={onSearch} />
      <div className="mt-3">
        <FilterButtons selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
      </div>
    </div>
  );
};

export default SidebarHeader;