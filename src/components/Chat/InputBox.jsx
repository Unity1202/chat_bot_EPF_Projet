import { useState, useRef } from 'react';

export default function InputBox({ sendMessage, onFileUpload, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Déterminer si l'input doit être désactivé
  const isDisabled = isLoading || disabled;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileUpload(e.target.files);
      e.target.value = null; // Reset input
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-background">
      <button 
        type="button" 
        onClick={handleFileClick}
        disabled={isDisabled}
        className={`text-background hover:text-gray-700 text-xl ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        📎
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        disabled={isDisabled}
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          disabled ? "Chargement de la conversation..." : 
          isLoading ? "En attente de réponse..." : 
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
        {isLoading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}