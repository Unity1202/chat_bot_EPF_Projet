import * as React from "react"
import { History, Plus, Search } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "./ui/sidebar"
import { Button } from "./ui/button"

const conversations = [
  {
    id: 1,
    title: "Discussion sur l'intelligence artificielle",
    date: "2024-03-13",
    preview: "Exploration des concepts fondamentaux de l'IA et ses applications..."
  },
  {
    id: 2,
    title: "Projet de développement web",
    date: "2024-03-12",
    preview: "Planification d'une application React moderne avec Tailwind CSS..."
  },
  {
    id: 3,
    title: "Architecture logicielle",
    date: "2024-03-11",
    preview: "Discussion sur les meilleures pratiques de conception..."
  },
  {
    id: 4,
    title: "Sécurité informatique",
    date: "2024-03-10",
    preview: "Analyse des vulnérabilités courantes et solutions..."
  },
  {
    id: 5,
    title: "Optimisation des performances",
    date: "2024-03-09",
    preview: "Techniques pour améliorer les performances d'une application web..."
  },
  {
    id: 6,
    title: "Tests automatisés",
    date: "2024-03-08",
    preview: "Mise en place d'une suite de tests automatisés avec Jest..."
  },
  {
    id: 7,
    title: "Déploiement continu",
    date: "2024-03-07",
    preview: "Configuration du pipeline CI/CD avec GitHub Actions..."
  },
  {
    id: 8,
    title: "Gestion des états",
    date: "2024-03-06",
    preview: "Comparaison des différentes solutions de gestion d'état..."
  },
  {
    id: 9,
    title: "Accessibilité web",
    date: "2024-03-05",
    preview: "Bonnes pratiques pour rendre une application accessible..."
  },
  {
    id: 10,
    title: "Design système",
    date: "2024-03-04",
    preview: "Création et maintenance d'un design système cohérent..."
  },
  {
    id: 11,
    title: "Microservices",
    date: "2024-03-03",
    preview: "Architecture et implémentation d'une application microservices..."
  },
  {
    id: 12,
    title: "Base de données",
    date: "2024-03-02",
    preview: "Choix et optimisation d'une base de données pour le projet..."
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:pointer-events-none p-4 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5 text-[#16698C]" />
            <h2 className="text-sm font-medium">Historique</h2>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="h-7 pl-1 pr-1.5 bg-[#16698C] hover:bg-[#16698C]/90 text-xs rounded-md"
          >
            <Plus className="h-2.5 w-2.5 mr-0" />
            Nouveau Chat
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-[7px] h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Rechercher..."
            className="w-full h-7 rounded-md border border-input bg-background px-7 py-1 text-xs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pb-2 pt-0">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex cursor-pointer items-center rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{conv.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{conv.preview}</p>
                  <p className="text-xs text-muted-foreground">{conv.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
} 