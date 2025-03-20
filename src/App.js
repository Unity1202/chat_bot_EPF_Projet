import { AppSidebar } from "./components/Sidebar/AppSidebar"
import Header from "./components/Header/Header"
import AppChat from "./components/Chat/AppChat" // Correction de l'import

const App = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex flex-1 relative">
        <AppSidebar />
        <main className="flex-1">
            <AppChat />
        </main>
      </div>
    </div>
  )
}

export default App
