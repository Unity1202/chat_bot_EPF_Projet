import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, RefreshCw, FilePlus, AlertCircle, FileText, Info } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState(null);
  const [corrections, setCorrections] = useState([]);  useEffect(() => {
    if (correctedDocument) {
      let formattedCorrections = [];
      
      // Transformer les détails de corrections en format compatible avec notre interface
      if (correctedDocument.corrections_details && Array.isArray(correctedDocument.corrections_details)) {
        // Le format attendu selon la documentation: "Correction orthographique: 'eror' → 'error'"
        formattedCorrections = correctedDocument.corrections_details.map((detail, index) => {
          let type = 'other';
          let original = '';
          let corrected = '';
          
          try {
            // Essayer plusieurs formats de parsing pour garantir la compatibilité
            
            // Format principal: "Correction orthographique: 'eror' → 'error'"
            const mainMatch = detail.match(/Correction (orthographique|grammaticale|juridique): ['"]([^'"]*)['"] → ['"]([^'"]*)['"]/);
            
            // Format alternatif: "Correction: 'eror' → 'error'"
            const altMatch = detail.match(/Correction: ['"]([^'"]*)['"] → ['"]([^'"]*)['"]/);
            
            // Format de secours: rechercher simplement pour des apostrophes ou guillemets
            const backupMatch = detail.match(/['"]([^'"]*)['"].*['"]([^'"]*)['"]/);
            
            if (mainMatch) {
              type = mainMatch[1] === 'orthographique' ? 'spelling' : 
                     mainMatch[1] === 'grammaticale' ? 'grammar' : 'legal';
              original = mainMatch[2];
              corrected = mainMatch[3];
            } else if (altMatch) {
              // Si type non spécifié, on essaie de le deviner en fonction du contenu
              original = altMatch[1];
              corrected = altMatch[2];
              
              // Tentative simple de détection du type d'erreur
              if (original.length === corrected.length && original.toLowerCase() !== corrected.toLowerCase()) {
                type = 'spelling'; // Probablement une erreur de majuscule ou caractère
              } else if (Math.abs(original.length - corrected.length) <= 2) {
                type = 'spelling'; // Probablement une faute d'orthographe
              } else {
                type = 'grammar'; // Probablement une erreur grammaticale
              }
            } else if (backupMatch) {
              original = backupMatch[1];
              corrected = backupMatch[2];
              type = 'other';
            }
          } catch (error) {
            console.warn("Impossible de parser le détail de correction:", detail, error);
          }
          
          return {
            id: index,
            type,
            original,
            corrected,
            explanation: detail,
            parseFailed: !original && !corrected
          };
        }).filter(correction => !(correction.parseFailed && correction.type === 'other'));
      } else {
        console.warn("Aucun détail de correction ou format incorrect dans la réponse API", correctedDocument);
      }
      
      // Ajouter également les recommandations légales comme des "corrections"
      if (correctedDocument.legal_recommendations && Array.isArray(correctedDocument.legal_recommendations)) {
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
      
      console.log('Corrections formatées:', formattedCorrections);
      console.log('Nombre de corrections appliquées:', correctedDocument.corrections_applied || formattedCorrections.length);
      setCorrections(formattedCorrections);
    }
  }, [correctedDocument]);
    // Lancer la correction du document
  const handleCorrect = async () => {
    if (!document) {
      const error = new Error("Document non disponible");
      setErrorMessage(error.message);
      onError(error);
      return;
    }
    
    if (!document.id) {
      const error = new Error("Document sans identifiant");
      setErrorMessage(error.message);
      onError(error);
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Clear previous errors
      
    try {
      console.log("Demande de correction pour le document:", document);
      const result = await correctDocument(document.id);
      
      // Valider la réponse de l'API
      if (!result) {
        throw new Error("Réponse vide reçue de l'API");
      }
      
      // Vérifier si on a les champs requis dans la réponse
      if (!result.corrections_applied && result.corrections_applied !== 0) {
        console.warn("Le nombre de corrections appliquées n'est pas défini dans la réponse");
      }
      
      if (!result.corrections_details || !Array.isArray(result.corrections_details)) {
        console.warn("Les détails des corrections sont manquants ou dans un format incorrect");
      }
      
      onCorrectionComplete(result);
    } catch (error) {
      // Display more informative error to the user
      console.error("Erreur de correction:", error);
      
      let errorMsg;
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object') {
        errorMsg = error?.detail || JSON.stringify(error);
      } else {
        errorMsg = String(error);
      }
      
      // Pour les erreurs 422, ajouter un message plus informatif
      if (errorMsg.includes("422") || errorMsg.includes("Unprocessable Entity")) {
        errorMsg += " (Les données envoyées sont incorrectes ou invalides)";
      }
      
      setErrorMessage(errorMsg);
      onError(new Error(`Impossible de corriger le document: ${errorMsg}`));
    } finally {
      setLoading(false);
    }
  };
  // Télécharger le document corrigé
  const handleDownload = async (corrected = true) => {
    if (!document) {
      setErrorMessage("Document non disponible pour le téléchargement");
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Clear previous errors
      try {
      // Selon l'API: pour un document original, utiliser document.filename
      // Pour un document corrigé, utiliser correctedDocument.filename
      let filename = null;
      let documentType = corrected ? "corrigé" : "original";
      
      if (corrected && correctedDocument) {
        // Pour le document corrigé, utiliser la propriété filename fournie par l'API
        // Selon la documentation: "filename": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_corrected.txt"
        if (!correctedDocument.filename) {
          console.error("Le document corrigé n'a pas de nom de fichier", correctedDocument);
          throw new Error(`Nom de fichier non disponible pour le document ${documentType}`);
        }
        filename = correctedDocument.filename;
      } else if (document) {
        // Pour le document original, utiliser le filename original
        filename = document.filename || document.name || 
                  (document.id ? `document_${document.id}` : null);
      }
      
      if (!filename) {
        throw new Error(`Nom de fichier non disponible pour le document ${documentType}`);
      }
      
      console.log(`Téléchargement du document ${documentType}: ${filename}`);
      
      try {
        const blob = await downloadDocument(filename);
        
        if (!blob || blob.size === 0) {
          throw new Error(`Le fichier téléchargé est vide`);
        }
        
        // Vérifier le type MIME pour s'assurer que c'est un fichier valide et non une réponse HTML d'erreur
        const mimeType = blob.type;
        if (mimeType === 'text/html' && !filename.endsWith('.html')) {
          console.warn("Le serveur a renvoyé un contenu HTML alors qu'un autre type était attendu");
        }
          // Créer un lien et déclencher le téléchargement
        const url = window.URL.createObjectURL(blob);
        // Utiliser window.document pour éviter la confusion avec la variable document locale
        const downloadLink = window.document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = url;
        downloadLink.download = filename.includes('/') ? filename.split('/').pop() : filename;
        
        window.document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(downloadLink);
      } catch (downloadError) {
        throw new Error(`Erreur lors du téléchargement du fichier: ${downloadError.message}`);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      
      let errorMsg;
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object') {
        errorMsg = error?.detail || JSON.stringify(error);
      } else {
        errorMsg = String(error);
      }
      
      setErrorMessage(errorMsg);
      onError(new Error(`Erreur lors du téléchargement: ${errorMsg}`));
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
      </div>      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erreur lors de la correction
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {errorMessage || "Une erreur est survenue lors de la correction du document."}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-3"
                onClick={handleCorrect}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <div>              <h3 className="font-medium text-lg text-green-700 dark:text-green-400">
                Correction terminée!
              </h3>
              <p className="text-green-600 dark:text-green-500">
                {typeof correctedDocument.corrections_applied === 'number' 
                  ? `${correctedDocument.corrections_applied} corrections ont été appliquées à votre document.`
                  : corrections.length > 0 
                    ? `${corrections.length} corrections ont été appliquées à votre document.`
                    : 'Votre document a été traité avec succès.'
                }
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
        </div>      ) : noErrorsToFix ? (
        <div className="text-center p-8 border rounded-lg">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-green-700">Document déjà parfait!</h3>
          <p className="text-gray-500 mt-2 mb-6">
            Aucune erreur n'a été détectée dans votre document. 
            {analysis.overall_compliance_score !== undefined && (
              <span className="block mt-2">
                Score de conformité: <strong>{Math.round(analysis.overall_compliance_score * 100)}%</strong>
              </span>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleDownload(false)}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger le document
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleCorrect}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Vérifier à nouveau
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md flex items-center">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Même si aucune erreur n'a été détectée, vous pouvez quand même demander une correction pour appliquer des améliorations mineures.</span>
          </div>
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
