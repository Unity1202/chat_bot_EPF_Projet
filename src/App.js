import { AppSidebar } from "./components/AppSidebar"
import { Separator } from "./components/ui/separator"
import {
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar"

const App = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
            <SidebarTrigger className="-ml-1" />
          </header>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
