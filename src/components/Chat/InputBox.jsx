import { useState, useRef } from 'react';

export default function InputBox({ sendMessage, isSidebarOpen, onFileUpload }) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
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
        className="text-background hover:text-gray-700 text-xl"
      >
        📎
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tapez votre message ici..."
        className="flex-1 p-2 border rounded-lg bg-background text-flex-1"
      />
      <button 
        type="submit" 
        className="bg-[#16698C] text-white px-4 py-2 rounded-lg hover:bg-[#16ACCD]"
      >
        Envoyer
      </button>
    </form>
  );
}
