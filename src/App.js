import { AppSidebar } from "./components/Sidebar/AppSidebar"
import { SidebarProvider } from "./components/ui/sidebar"
import Header from "./components/Header/Header"

const App = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <div className="flex flex-1 relative">
          <AppSidebar />
          <main className="flex-1">
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
