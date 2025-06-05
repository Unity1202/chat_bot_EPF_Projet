/**
 * Utilitaires de debugging pour RAG
 */

/**
 * Diagnostic complet des données RAG
 * @param {Object} data - Les données à analyser
 * @param {string} context - Le contexte du diagnostic
 */
export const diagnoseRAGData = (data, context = 'Unknown') => {
  console.group(`🔬 RAG Diagnostic - ${context}`);
  
  // Analyse générale
  console.log('Raw data:', JSON.stringify(data, null, 2));
  console.log('Data type:', typeof data);
  console.log('Is array:', Array.isArray(data));
  console.log('Is object:', data && typeof data === 'object');
  
  if (data && typeof data === 'object') {
    console.log('Available keys:', Object.keys(data));
    
    // Recherche de citations dans différents formats
    const citationFields = [
      'citations', 'excerpts', 'context_excerpts', 'rag_excerpts',
      'sources', 'references', 'extracts', 'passages'
    ];
    
    citationFields.forEach(field => {
      if (data[field]) {
        console.log(`Found ${field}:`, data[field]);
        if (Array.isArray(data[field])) {
          console.log(`${field} count:`, data[field].length);
          data[field].forEach((item, index) => {
            console.log(`${field}[${index}]:`, item);
          });
        }
      }
    });
    
    // Analyse des messages si c'est un tableau
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item && typeof item === 'object') {
          console.log(`Item ${index}:`, item);
          citationFields.forEach(field => {
            if (item[field]) {
              console.log(`Item ${index} ${field}:`, item[field]);
            }
          });
        }
      });
    }
    
    // Analyse des messages dans un objet conversation
    if (data.messages && Array.isArray(data.messages)) {
      console.log('Analyzing conversation messages:');
      data.messages.forEach((msg, index) => {
        if (msg.sender === 'bot') {
          console.log(`Bot message ${index}:`, {
            text: msg.text?.substring(0, 50) + '...',
            sources: msg.sources?.length || 0,
            citations: msg.citations?.length || 0,
            citationsData: msg.citations
          });
        }
      });
    }
  }
  
  console.groupEnd();
};

/**
 * Tracer les transformations de données
 * @param {Object} original - Données originales
 * @param {Object} transformed - Données transformées
 * @param {string} operation - Nom de l'opération
 */
export const traceDataTransformation = (original, transformed, operation) => {
  console.group(`🔄 Data Transformation - ${operation}`);
  console.log('Before:', original);
  console.log('After:', transformed);
  
  // Comparer les citations spécifiquement
  const originalCitations = extractCitations(original);
  const transformedCitations = extractCitations(transformed);
  
  console.log('Original citations:', originalCitations);
  console.log('Transformed citations:', transformedCitations);
  console.log('Citations preserved:', originalCitations.length === transformedCitations.length);
  
  console.groupEnd();
};

/**
 * Extraire toutes les citations possibles d'un objet
 * @param {Object} data - Les données à analyser
 * @returns {Array} - Toutes les citations trouvées
 */
export const extractCitations = (data) => {
  if (!data) return [];
  
  const citations = [];
  const citationFields = [
    'citations', 'excerpts', 'context_excerpts', 'rag_excerpts'
  ];
  
  // Recherche directe
  citationFields.forEach(field => {
    if (data[field] && Array.isArray(data[field])) {
      citations.push(...data[field]);
    }
  });
  
  // Recherche dans les messages
  if (data.messages && Array.isArray(data.messages)) {
    data.messages.forEach(msg => {
      citationFields.forEach(field => {
        if (msg[field] && Array.isArray(msg[field])) {
          citations.push(...msg[field]);
        }
      });
    });
  }
  
  // Recherche dans un tableau
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && typeof item === 'object') {
        citationFields.forEach(field => {
          if (item[field] && Array.isArray(item[field])) {
            citations.push(...item[field]);
          }
        });
      }
    });
  }
  
  return citations.filter(citation => citation && (citation.content || citation.text || citation.excerpt));
};

/**
 * Vérifier la structure d'une réponse d'API
 * @param {Object} response - La réponse de l'API
 * @param {string} endpoint - Le nom de l'endpoint
 */
export const validateAPIResponse = (response, endpoint) => {
  console.group(`✅ API Response Validation - ${endpoint}`);
  
  const expectedFields = {
    'sendQuery': ['answer', 'sources', 'excerpts', 'conversation_id'],
    'getConversationById': ['id', 'messages', 'title'],
    'message': ['id', 'text', 'sender', 'citations']
  };
  
  const expected = expectedFields[endpoint] || [];
  const missing = [];
  const present = [];
  
  expected.forEach(field => {
    if (response && response.hasOwnProperty(field)) {
      present.push(field);
    } else {
      missing.push(field);
    }
  });
  
  console.log('Expected fields:', expected);
  console.log('Present fields:', present);
  console.log('Missing fields:', missing);
  console.log('Additional fields:', response ? Object.keys(response).filter(k => !expected.includes(k)) : []);
  
  // Validation spécifique pour les citations
  const citations = extractCitations(response);
  console.log('Total citations found:', citations.length);
  
  console.groupEnd();
  
  return {
    isValid: missing.length === 0,
    missing,
    present,
    citationsCount: citations.length
  };
};
