export default function Message({ text, sender, sources = [], citations = [] }) {
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
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:text-blue-800 dark:hover:text-blue-300 flex items-start gap-1"
                  >
                    <span className="inline-block w-4 h-4 mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </span>
                    <span>{source.title || source.document_name || source.url || `Source ${index + 1}`}</span>
                  </a>
                  {source.excerpt && (
                    <div className="ml-5 mt-1 text-xs italic text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                      {source.excerpt}
                    </div>
                  )}
                </li>
              ))}
            </ul>          </div>
        )}
        
        {/* Afficher les citations si elles existent */}
        {citations && citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium mb-1">Citations:</p>
            <ul className="text-xs space-y-2">
              {citations.map((citation, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <p className="italic">"{citation.text}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {citation.document || citation.source || "Document juridique"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}