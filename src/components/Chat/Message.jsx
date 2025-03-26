export default function Message({ text, sender, sources = [] }) {
  const isUser = sender === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          isUser 
            ? "bg-[#16698C] text-white" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        }`}
      >
        <div className="whitespace-pre-wrap">{text}</div>
        
        {/* Afficher les sources si elles existent */}
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium mb-1">Sources:</p>
            <ul className="text-xs space-y-1">
              {sources.map((source, index) => (
                <li key={index} className="text-blue-600 dark:text-blue-400">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}