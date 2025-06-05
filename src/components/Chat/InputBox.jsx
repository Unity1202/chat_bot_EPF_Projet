import { useState, useRef } from 'react';
import { BookOpenIcon, BookOpenCheck, SearchIcon, LightbulbIcon } from 'lucide-react';

export default function InputBox({ sendMessage, onFileUpload, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [useRAG, setUseRAG] = useState(true);
  
  // Déterminer si l'input doit être désactivé
  const isDisabled = isLoading || disabled;  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      // Passer les options RAG et les fichiers au sendMessage
      const options = { 
        use_rag: useRAG,
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      };
      sendMessage(message, options);
      setMessage('');
      setSelectedFiles([]); // Clear files after sending
    }
  };
  
  const toggleRAG = () => {
    setUseRAG(!useRAG);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      // Also call the parent's file upload handler for display purposes
      onFileUpload(files);
      e.target.value = null; // Reset input
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
  };  return (
    <div className="bg-background">
      {/* File indicators */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
              <span className="mr-2">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-blue-500 hover:text-blue-700"
                title="Supprimer ce fichier"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-background"><button 
        type="button" 
        onClick={handleFileClick}
        disabled={isDisabled}
        title="Joindre des documents (PDF, Word, TXT, etc.)"
        className={`flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-md ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={toggleRAG}
        disabled={isDisabled}
        className={`p-1.5 rounded-md ${useRAG ? 'text-blue-600 bg-blue-100' : 'text-gray-400'} hover:bg-gray-100`}
        title={useRAG ? "Sources documentaires activées" : "Sources documentaires désactivées"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {useRAG ? (
            <>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </>
          ) : (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </>
          )}
        </svg>
      </button>      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.md,.json,.html,.htm"
        disabled={isDisabled}
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}        placeholder={
          disabled ? "Chargement de la conversation..." : 
          isLoading ? "En attente de réponse..." : 
          selectedFiles.length > 0 ? `Posez votre question sur ${selectedFiles.length} fichier${selectedFiles.length > 1 ? 's' : ''}...` :
          "Tapez votre message ici..."
        }
        disabled={isDisabled}
        className="flex-1 p-2 border rounded-lg bg-background text-flex-1 disabled:opacity-70"
      />
      <button 
        type="submit" 
        disabled={isDisabled || !message.trim()}
        className={`bg-[#16698C] text-white px-4 py-2 rounded-lg ${
          isDisabled || !message.trim() 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-[#16ACCD]'
        }`}
      >
        {isLoading ? 'Envoi...' : 'Envoyer'}      </button>
    </form>
    </div>
  );
}