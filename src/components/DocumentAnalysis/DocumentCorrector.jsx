import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, RefreshCw, FilePlus, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { correctDocument, downloadDocument } from '../../Services/documentAnalysisService';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';

/**
 * Composant pour la correction automatique de documents
 */
export default function DocumentCorrector({
  document,
  analysis,
  correctedDocument,
  onCorrectionComplete,
  onError,
  setLoading,
  isLoading
}) {
  const [showComparison, setShowComparison] = useState(true);
  const [corrections, setCorrections] = useState([]);
  useEffect(() => {
    if (correctedDocument && correctedDocument.corrections_details) {
      // Transformer les détails de corrections en format compatible avec notre interface
      const formattedCorrections = correctedDocument.corrections_details.map((detail, index) => {
        // Analyser les corrections au format "Correction type: 'original' → 'corrected'"
        const match = detail.match(/Correction (orthographique|grammaticale|juridique): ['"]([^'"]*)['"] → ['"]([^'"]*)['"]/);
        const type = match ? 
          match[1] === 'orthographique' ? 'spelling' : 
          match[1] === 'grammaticale' ? 'grammar' : 'legal' 
          : 'other';
        
        const original = match ? match[2] : '';
        const corrected = match ? match[3] : '';
        
        return {
          id: index,
          type,
          original,
          corrected,
          explanation: detail
        };
      });
      
      // Ajouter également les recommandations légales comme des "corrections"
      if (correctedDocument.legal_recommendations) {
        const legalSuggestions = correctedDocument.legal_recommendations.map((rec, index) => ({
          id: `legal-${index}`,
          type: 'legal',
          original: '',
          corrected: rec,
          explanation: rec,
          isRecommendation: true
        }));
        
        formattedCorrections.push(...legalSuggestions);
      }
      
      setCorrections(formattedCorrections);
    }
  }, [correctedDocument]);
  // Lancer la correction du document
  const handleCorrect = async () => {
    if (!document || !document.id) {
      onError(new Error("Document invalide ou ID manquant"));
      return;
    }

    setLoading(true);
    
    try {
      const result = await correctDocument(document.id);
      onCorrectionComplete(result);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };// Télécharger le document corrigé
  const handleDownload = async (corrected = true) => {
    if (!document) return;

    setLoading(true);
    
    try {
      // Utiliser soit le nom de fichier du document corrigé, soit celui de l'original
      // Vérification approfondie pour s'assurer que les objets et leurs propriétés existent
      let filename = null;
      
      if (corrected && correctedDocument) {
        // Pour le document corrigé, utiliser la propriété filename ou créer un nom basé sur l'original
        filename = correctedDocument.filename || 
                  (correctedDocument.id && document && document.name ? 
                    `corrected_${document.name}` : null);
      } else if (document) {
        // Pour le document original, essayer toutes les propriétés possibles
        filename = document.name || document.filename || 
                   (document.id ? `document_${document.id}.pdf` : null);
      }
      
      if (!filename) {
        throw new Error("Nom de fichier non disponible");
      }
      
      const blob = await downloadDocument(filename);
      
      // Créer un lien et déclencher le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  // Si pas de document ou d'analyse, afficher un message
  if (!document || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Document ou analyse manquante</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Veuillez uploader un document et lancer une analyse avant de corriger
        </p>
      </div>
    );
  }
  // Pas d'erreurs à corriger
  const noErrorsToFix = !analysis.spelling_errors?.length && 
                       !analysis.grammar_errors?.length && 
                       !analysis.legal_compliance_issues?.length;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Correction du Document</h2>
        <div className="text-sm text-gray-500">
          {document.name}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-8">
          <Progress value={65} className="h-2" />
          <p className="text-center text-gray-500">
            Correction automatique en cours...
          </p>
        </div>
      ) : correctedDocument ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <div className="mr-4 bg-green-100 dark:bg-green-800 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-green-700 dark:text-green-400">
                Correction terminée!
              </h3>
              <p className="text-green-600 dark:text-green-500">
                {corrections.length} corrections ont été appliquées à votre document.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => handleDownload(true)}
            >
              <Download className="mr-2 h-5 w-5" />
              Télécharger la version corrigée
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleDownload(false)}
            >
              <FileText className="mr-2 h-5 w-5" />
              Télécharger l'original
            </Button>
          </div>

          {corrections.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-lg font-medium">Corrections appliquées</h3>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Afficher les comparaisons
                  </span>
                  <Switch 
                    checked={showComparison} 
                    onCheckedChange={setShowComparison} 
                  />
                </div>
              </div>

              <div className="space-y-4">                {corrections.map((correction, index) => (
                  <Card key={index} className="border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {correction.type === 'spelling' && 'Correction orthographique'}
                        {correction.type === 'grammar' && 'Correction grammaticale'}
                        {correction.type === 'legal' && 'Recommandation juridique'}
                        {correction.type === 'other' && 'Autre correction'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {correction.isRecommendation ? (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <div className="text-gray-800 dark:text-gray-200">{correction.corrected}</div>
                        </div>
                      ) : showComparison && correction.original && correction.corrected ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                            <div className="text-xs text-red-500 mb-1 font-medium">Avant:</div>
                            <div className="text-gray-800 dark:text-gray-200">{correction.original}</div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="text-xs text-green-500 mb-1 font-medium">Après:</div>
                            <div className="text-gray-800 dark:text-gray-200">{correction.corrected}</div>
                          </div>
                        </div>
                      ) : correction.original && correction.corrected ? (
                        <div className="flex items-center">
                          <span className="line-through text-red-500 mr-4">{correction.original}</span>
                          <span className="text-green-600">→</span>
                          <span className="ml-4 text-green-600">{correction.corrected}</span>
                        </div>
                      ) : (
                        <div className="text-gray-800 dark:text-gray-200">{correction.explanation || correction.corrected}</div>
                      )}
                      
                      {!correction.isRecommendation && correction.explanation && (
                        <div className="mt-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <span className="font-medium">Détail:</span> {correction.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : noErrorsToFix ? (
        <div className="text-center p-8 border rounded-lg">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-green-700">Document déjà parfait!</h3>
          <p className="text-gray-500 mt-2 mb-6">
            Aucune erreur n'a été détectée dans votre document. Il n'y a rien à corriger.
          </p>
          
          <Button 
            variant="outline" 
            onClick={() => handleDownload(false)}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger le document
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-medium mb-1">Correction automatique</h3>
                  <p className="text-gray-500 text-sm">
                    L'assistant corrigera automatiquement les erreurs détectées dans votre document
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="flex items-center mr-4">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                      <span>{analysis.spelling_errors?.length || 0} orthographiques</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
                      <span>{analysis.grammar_errors?.length || 0} grammaticales</span>
                    </div>                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                      <span>{analysis.legal_compliance_issues?.length || 0} juridiques</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleCorrect}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Corriger automatiquement
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <FilePlus className="h-4 w-4 mr-2" />
                Ce qui sera corrigé:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Toutes les erreurs d'orthographe détectées</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Les erreurs grammaticales et de ponctuation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Remplacement des termes juridiques inappropriés</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Formatage et mise en page améliorés</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-300">
                Note importante
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                La correction automatique est une aide, mais elle n'est pas infaillible. 
                Nous vous recommandons de vérifier les modifications suggérées avant 
                d'utiliser le document final pour des applications importantes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
