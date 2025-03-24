// composant principal de l'application qui définit la structure de base
// organise les composants majeurs : header, sidebar et zone de chat
// utilise flexbox pour la mise en page responsive

import { Sidebar } from "./components/Sidebar/Sidebar"
import Header from "./components/Header/Header"
import AppChat from "./components/Chat/AppChat"

const App = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1">
            <AppChat />
        </main>
      </div>
    </div>
  )
}

export default App
