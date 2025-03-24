import React from "react";
import {
  Sidebar as UISidebar,
  SidebarContent
} from "../ui/sidebar";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import { ScrollArea } from "../ui/scroll-area";
import { useSearch } from "../../hooks/useSearch";
import { useFilter } from "../../hooks/useFilter";

// conversations fictives pour tester le formatage
const conversations = [
  {
    id: 1,
    title: "Conversation d'aujourd'hui",
    preview: "Test du formatage pour aujourd'hui",
    date: new Date().toISOString(),
    category: 'treasury'
  },
  {
    id: 2,
    title: "Conversation d'hier",
    preview: "Test du formatage pour hier",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'organisational'
  },
  {
    id: 3,
    title: "Conversation d'il y a 3 jours",
    preview: "Test du formatage pour il y a 3 jours",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'other'
  },
  {
    id: 4,
    title: "Conversation de la semaine dernière",
    preview: "Test du formatage pour la semaine dernière",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'treasury'
  },
  {
    id: 5,
    title: "Conversation de ce mois",
    preview: "Test du formatage pour ce mois",
    date: "2025-03-05T10:30:00.000Z",
    category: 'organisational'
  },
  {
    id: 6,
    title: "Conversation du mois dernier",
    preview: "Test du formatage pour le mois dernier",
    date: "2025-02-15T10:30:00.000Z",
    category: 'other'
  },
  {
    id: 7,
    title: "Conversation de janvier",
    preview: "Test du formatage pour un mois spécifique",
    date: "2025-01-15T10:30:00.000Z",
    category: 'treasury'
  },
  {
    id: 8,
    title: "Conversation de l'année dernière",
    preview: "Test du formatage pour l'année dernière",
    date: "2024-12-25T10:30:00.000Z",
    category: 'organisational'
  }
];

export function Sidebar() {
  const { searchQuery, setSearchQuery, filteredItems: searchFilteredItems } = useSearch(conversations);
  const { selectedFilter, setSelectedFilter, filteredItems: categoryFilteredItems } = useFilter(searchFilteredItems);

  return (
    <UISidebar className="mt-16">
      <SidebarContent className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background">
          <SidebarHeader 
            selectedFilter={selectedFilter} 
            setSelectedFilter={setSelectedFilter}
            onSearch={setSearchQuery}
          />
        </div>
        <div className="flex-1 overflow-hidden group">
          <div className="h-full">
            <ScrollArea 
              viewportClassName="h-full"
              className="transition-opacity duration-300"
              type="hover"
            >
              <ConversationList 
                conversations={categoryFilteredItems}
                searchQuery={searchQuery}
              />
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </UISidebar>
  );
} 