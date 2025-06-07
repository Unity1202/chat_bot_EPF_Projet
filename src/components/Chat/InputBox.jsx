import { useState, useRef, useEffect } from 'react';
import { BookOpenIcon, BookOpenCheck, SearchIcon, LightbulbIcon } from 'lucide-react';

export default function InputBox({ sendMessage, onFileUpload, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [useRAG, setUseRAG] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Effet simple pour logger les changements d'état isLoading
  useEffect(() => {
    console.log("État isLoading externe a changé:", isLoading);
  }, [isLoading]);
  
  // Calculer si l'input doit être désactivé UNIQUEMENT pendant l'envoi
  // Le chargement d'un fichier ne doit pas désactiver la saisie de texte
  const isInputDisabled = isSending || disabled;  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si nous avons du contenu à envoyer (message ou fichiers)
    const hasContent = message.trim() || selectedFiles.length > 0;
    
    if (hasContent && !isSending) {
      try {
        // Activer l'état d'envoi (bloque uniquement le bouton d'envoi, pas la saisie)
        setIsSending(true);
        
        // Préparer les options avec RAG et fichiers
        const options = { 
          use_rag: useRAG,
          files: selectedFiles.length > 0 ? selectedFiles : undefined
        };
        
        // Si pas de message mais des fichiers, utiliser un message par défaut
        const messageToSend = message.trim() || "Analysez ce fichier s'il vous plaît.";
        
        // Envoyer le message via la fonction parent
        if (sendMessage && typeof sendMessage === 'function') {
          await sendMessage(messageToSend, options);
        }
        
        // Réinitialiser le message après l'envoi réussi
        setMessage('');
        // Note: on ne réinitialise PAS selectedFiles ici pour permettre
        // de poser plusieurs questions sur le même document
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
      } finally {
        // Réactiver le bouton d'envoi
        setIsSending(false);
      }
    }
  };
  
  const toggleRAG = () => {
    setUseRAG(!useRAG);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        // Convertir FileList en array
        const files = Array.from(e.target.files);
        
        // Vérifier que les fichiers sont valides et acceptés par le backend
        const validFiles = files.filter(file => {
          // Vérifier que c'est un fichier valide
          if (!file || file.size <= 0) {
            console.warn(`Fichier invalide: ${file?.name || 'inconnu'}`);
            return false;
          }
          
          // Vérifier la taille du fichier (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.warn(`Fichier trop volumineux (${Math.round(file.size/1024/1024)}MB): ${file.name}`);
            return false;
          }
          
          // Vérifier le type de fichier
          const acceptedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'text/markdown',
            'application/json',
            'text/html'
          ];
          
          if (!acceptedTypes.includes(file.type)) {
            console.warn(`Type de fichier non supporté (${file.type}): ${file.name}`);
            return false;
          }
          
          return true;
        });
        
        if (validFiles.length === 0) {
          alert("Aucun fichier valide sélectionné. Veuillez sélectionner un fichier PDF, Word, TXT ou d'autres formats texte (max 10MB).");
          return;
        }
        
        console.log(`${validFiles.length} fichier(s) valide(s) sélectionné(s):`, 
          validFiles.map(f => `${f.name} (${f.type}, ${Math.round(f.size/1024)}KB)`));
        
        // Mettre à jour l'état local
        setSelectedFiles(validFiles);
        
        // Mettre en focus le champ de texte après sélection de fichier
        setTimeout(() => {
          document.querySelector('input[type="text"]')?.focus();
        }, 100);
        
        // Appeler le gestionnaire parent pour notifier le composant parent
        if (onFileUpload && typeof onFileUpload === 'function') {
          onFileUpload(validFiles);
        }
        
        // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
        e.target.value = null;
      } catch (error) {
        console.error("Erreur lors de la sélection des fichiers:", error);
        alert("Une erreur est survenue lors de la sélection des fichiers. Veuillez réessayer.");
      }
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
  };
  
  return (
    <div className="bg-background">      {/* File indicators avec style amélioré pour plus de clarté */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b bg-blue-50 items-center">
          <div className="text-blue-700 font-medium mr-2 text-sm">
            {selectedFiles.length === 1 ? 'Document chargé:' : `${selectedFiles.length} documents chargés:`}
          </div>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm shadow-sm">
              <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span className="mr-2">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-blue-500 hover:text-blue-700 ml-1 font-bold"
                title="Supprimer ce fichier"
              >
                ×
              </button>
            </div>
          ))}
          {selectedFiles.length > 0 && (
            <div className="text-xs text-blue-600 italic ml-auto">
              Vous pouvez poser plusieurs questions sur ces documents
            </div>
          )}
        </div>
      )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-background">        <button 
          type="button" 
          onClick={handleFileClick}
          disabled={isInputDisabled}
          title="Joindre des documents (PDF, Word, TXT, etc.)"
          className={`flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-md ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
          <button
          type="button"
          onClick={toggleRAG}
          disabled={isInputDisabled}
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
        </button>
          <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.md,.json,.html,.htm"
          disabled={isInputDisabled}
        />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}        
          placeholder={
            disabled ? "Chargement de la conversation..." : 
            isSending ? "En attente de réponse..." : 
            selectedFiles.length > 0 ? `Posez votre question sur ${selectedFiles.length > 1 ? 'les fichiers' : 'le fichier'} chargé${selectedFiles.length > 1 ? 's' : ''}...` :
            "Tapez votre message ici..."
          }
          disabled={isInputDisabled}
          className="flex-1 p-2 border rounded-lg bg-background text-foreground disabled:opacity-70"
        />
        
        <button 
          type="submit" 
          disabled={isSending || (!message.trim() && selectedFiles.length === 0)}
          className={`bg-[#16698C] text-white px-4 py-2 rounded-lg ${
            isSending || (!message.trim() && selectedFiles.length === 0)
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#16ACCD]'
          }`}
        >
          {isSending ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}