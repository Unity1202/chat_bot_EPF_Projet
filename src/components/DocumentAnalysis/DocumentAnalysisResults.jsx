import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { analyzeDocument } from '../../Services/documentAnalysisService';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import '../../styles/document-analysis-fixes.css';

/**
 * Composant pour afficher les résultats d'analyse d'un document
 */
export default function DocumentAnalysisResults({ 
  document, 
  analysis, 
  onAnalysisComplete, 
  onError, 
  setLoading, 
  isLoading 
}) {
  const [activeTab, setActiveTab] = useState("spelling");
  const [hasRequested, setHasRequested] = useState(false);
    // Définir la fonction d'analyse en premier avec useCallback pour éviter les problèmes de dépendances circulaires
  const handleAnalyze = useCallback(async () => {
    if (!document) return;
    
    console.log("Lancement de l'analyse document ID:", document.id);
    setLoading(true);
    setHasRequested(true);
    
    try {
      const analysisResults = await analyzeDocument(document.id);
      onAnalysisComplete(analysisResults);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  }, [document, onAnalysisComplete, onError, setLoading]);

  // Lancer l'analyse automatiquement si le document change et qu'on n'a pas encore de résultats
  useEffect(() => {
    let analyzeTimeout;
    
    // Vérifier si nous avons un document et si nous devons déclencher une analyse
    if (document && !analysis && !isLoading && !hasRequested) {
      console.log("Planification de l'analyse automatique pour le document:", document.id);
      // Utiliser un timeout pour éviter les requêtes multiples rapprochées
      analyzeTimeout = setTimeout(() => {
        console.log("Déclenchement de l'analyse automatique");
        handleAnalyze();
      }, 300);
    }
    
    return () => {
      if (analyzeTimeout) {
        console.log("Nettoyage du timeout d'analyse");
        clearTimeout(analyzeTimeout);
      }
    };
  }, [document, analysis, isLoading, hasRequested, handleAnalyze]);

  // Si pas de document, afficher un message
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Aucun document sélectionné</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Veuillez uploader un document dans l'onglet précédent
        </p>
      </div>
    );
  }  // Si en cours d'analyse
  if (isLoading && hasRequested) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow document-analyzer-root">
        <h2 className="text-xl font-semibold mb-6">Analyse en cours...</h2>
        <div className="space-y-4">
          <Progress indeterminate className="h-2" />
          <p className="text-center text-gray-500">
            L'analyse de votre document est en cours. Cela peut prendre quelques instants.
          </p>
        </div>
      </div>
    );
  }

  // Si pas encore d'analyse
  if (!analysis) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow document-analyzer-root">
        <h2 className="text-xl font-semibold mb-4">Analyse du Document</h2>
        <div className="p-4 border rounded-lg mb-4">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            <span className="font-medium">{document.name}</span>
          </div>
          <Button onClick={handleAnalyze}>Lancer l'analyse</Button>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          L'analyse vérifiera l'orthographe, la grammaire et les aspects juridiques de votre document.
        </div>
      </div>
    );
  }
  // Utiliser le score global de conformité fourni par l'API ou calculer un score par défaut
  const complianceScore = analysis.overall_compliance_score !== undefined ? 
    analysis.overall_compliance_score : 
    Math.max(0, 1 - ((analysis.spelling_errors?.length || 0) + 
                     (analysis.grammar_errors?.length || 0) + 
                     (analysis.legal_compliance_issues?.length || 0)) * 0.03);
  
  // Convertir le score (0.0-1.0) en pourcentage (0-100)
  const score = Math.round(complianceScore * 100);
  const scoreColor = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow document-analyzer-root">
      <div className="flex flex-wrap items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Résultats d'Analyse</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Document: {document.name || document.filename || "Sans nom"}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}/100</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Score global</div>
        </div>
      </div>

      <div className="error-grid mb-6">
        <Card className={analysis.spelling_errors?.length ? "border-red-200" : "border-green-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              {analysis.spelling_errors?.length ? (
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              Orthographe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.spelling_errors?.length || 0}
            </div>
            <p className="text-xs text-gray-500">erreurs détectées</p>
          </CardContent>
        </Card>

        <Card className={analysis.grammar_errors?.length ? "border-orange-200" : "border-green-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              {analysis.grammar_errors?.length ? (
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              Grammaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.grammar_errors?.length || 0}
            </div>
            <p className="text-xs text-gray-500">erreurs détectées</p>
          </CardContent>
        </Card>        <Card className={analysis.legal_compliance_issues?.length ? "border-purple-200" : "border-green-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              {analysis.legal_compliance_issues?.length ? (
                <AlertTriangle className="h-4 w-4 text-purple-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              Aspects Juridiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.legal_compliance_issues?.length || 0}
            </div>
            <p className="text-xs text-gray-500">problèmes détectés</p>
          </CardContent>
        </Card>
      </div>      {(analysis.spelling_errors?.length || 0) + (analysis.grammar_errors?.length || 0) + (analysis.legal_compliance_issues?.length || 0) > 0 ? (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="spelling">
              Orthographe
              {analysis.spelling_errors?.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {analysis.spelling_errors.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="grammar">
              Grammaire
              {analysis.grammar_errors?.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                  {analysis.grammar_errors.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="legal">
              Juridique
              {analysis.legal_compliance_issues?.length > 0 && (
                <span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                  {analysis.legal_compliance_issues.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spelling" className="pt-4">
            {analysis.spelling_errors?.length > 0 ? (
              <div className="space-y-4">
                {analysis.spelling_errors.map((error, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">                        <div>
                          <div className="font-medium text-red-600">{error.word}</div>
                          <div className="text-sm text-gray-500">
                            Position: {error.position ? `${error.position.start}-${error.position.end}` : "non spécifiée"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Suggestions:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {error.suggestions.map((suggestion, idx) => (
                              <Button key={idx} variant="outline" size="sm" className="text-xs">
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-green-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Aucune erreur d'orthographe détectée</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grammar" className="pt-4">
            {analysis.grammar_errors?.length > 0 ? (
              <div className="space-y-4">
                {analysis.grammar_errors.map((error, index) => (
                  <Card key={index} className="border-orange-200">                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <div className="font-medium text-orange-600">Erreur grammaticale</div>
                          <div className="text-sm text-gray-700 mt-1 py-1 px-2 bg-gray-100 rounded error-context">
                            {error.text || "Texte non disponible"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Correction suggérée:</div>
                          <div className="mt-1 py-1 px-2 bg-green-50 text-green-700 rounded">
                            {error.suggestions && error.suggestions.length > 0 ? error.suggestions[0] : "Pas de suggestion"}                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {error.message || "Pas d'explication disponible"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-green-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Aucune erreur grammaticale détectée</p>
              </div>
            )}
          </TabsContent>          <TabsContent value="legal" className="pt-4">
            {analysis.legal_compliance_issues?.length > 0 ? (
              <div className="space-y-4">
                {analysis.legal_compliance_issues.map((issue, index) => (
                  <Card key={index} className="border-purple-200">
                    <CardContent className="pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-purple-600">{issue.issue_type}</div>
                            <div className="text-sm text-gray-700 mt-1">
                              {issue.description}
                            </div>
                          </div>
                        </div>
                        
                        {issue.text && (
                          <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Extrait concerné:</div>
                            <div className="text-gray-600 dark:text-gray-400">{issue.text}</div>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <div className="font-medium text-sm">Recommandation:</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {issue.recommendation}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-green-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Aucun problème juridique détecté</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-green-700">Document parfait!</h3>
          <p className="text-gray-500 mt-2">
            Aucune erreur n'a été détectée dans votre document.
          </p>
        </div>
      )}

      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium text-lg mb-3">Suggestions d'amélioration</h3>
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-blue-600 mr-3">💡</div>
                <div>
                  <p className="text-blue-800 dark:text-blue-300">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={handleAnalyze} variant="outline" className="mr-2">
          Relancer l'analyse
        </Button>
        <Button onClick={() => setActiveTab("spelling")}>
          Voir tous les détails
        </Button>
      </div>
    </div>
  );
}
