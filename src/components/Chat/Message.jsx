export default function Message({ text, sender, sources = [], citations = [] }) {
  const isUser = sender === "user";
  
  // Debug pour tracer les citations
  console.group(`📨 Message Component - ${sender}`);
  console.log('Text:', text?.substring(0, 100) + '...');
  console.log('Sources received:', sources);
  console.log('Citations received:', citations);
  console.log('Citations length:', citations?.length);
  console.log('Citations valid count:', citations?.filter(c => c && (c.content || c.text || c.excerpt))?.length);
  console.groupEnd();
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          isUser 
            ? "bg-[#16698C] text-white" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        }`}
      >
        <div className="whitespace-pre-wrap">{text}</div>        {/* Afficher les sources si elles existent et ne sont pas vides */}
        {sources && sources.length > 0 && sources.some(source => source && (source.title || source.document_name || source.excerpt)) && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">Sources documentaires</p>
            </div>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-3 rounded-r-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {source.title || source.document_name || `Source ${index + 1}`}
                      </h4>
                      
                      {source.excerpt && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed mb-2">
                          "{source.excerpt.length > 150 ? source.excerpt.substring(0, 150) + '...' : source.excerpt}"
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {source.page && (
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                            </svg>
                            Page {source.page}
                          </span>
                        )}
                        
                        {source.type && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {source.type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-8 h-8 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition-colors"
                        title="Ouvrir le document"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}          {/* Afficher les citations si elles existent et ne sont pas vides */}
        {citations && citations.length > 0 && citations.some(citation => citation && (citation.content || citation.text || citation.excerpt)) && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20l-4-4H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Citations</p>
            </div>
            <div className="space-y-3">
              {citations.map((citation, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded-r-lg">                  {/* Citation text */}
                  <blockquote className="text-sm italic text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
                    {(() => {
                      const citationText = citation.content || citation.text || citation.excerpt || "Citation non disponible";
                      const maxLength = 120;
                      return `"${citationText.length > maxLength ? citationText.substring(0, maxLength) + '...' : citationText}"`;
                    })()}
                  </blockquote>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {/* Source/Document */}
                    {(citation.document || citation.source || citation.document_name) && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span className="font-medium">
                          {citation.document || citation.source || citation.document_name}
                        </span>
                      </div>
                    )}
                    
                    {/* Page number */}
                    {citation.page && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                          <path d="M10 10h4"></path>
                          <path d="M10 14h4"></path>
                        </svg>
                        <span>Page {citation.page}</span>
                      </div>
                    )}
                    
                    {/* Section ou chapitre */}
                    {citation.section && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                        <span>{citation.section}</span>
                      </div>
                    )}
                    
                    {/* Score de pertinence si disponible */}
                    {citation.score && (
                      <div className="flex items-center gap-1 ml-auto">
                        <div className={`w-2 h-2 rounded-full ${
                          citation.score > 0.8 ? 'bg-green-500' : 
                          citation.score > 0.6 ? 'bg-yellow-500' : 
                          'bg-orange-500'
                        }`}></div>
                        <span className="text-xs">
                          {Math.round(citation.score * 100)}% pertinent
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* URL si disponible */}
                  {citation.url && (
                    <div className="mt-2">
                      <a 
                        href={citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Voir le document
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}