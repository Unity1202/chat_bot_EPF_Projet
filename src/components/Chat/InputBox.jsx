import { useState } from "react";

export default function InputBox({ sendMessage }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Posez votre question..."
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-[#16698C]"
      />
      <button 
        type="submit" 
        className="px-4 py-2 bg-[#16698C] text-white rounded-lg hover:bg-[#145879] transition-colors"
      >
        Envoyer
      </button>
    </form>
  );
}
