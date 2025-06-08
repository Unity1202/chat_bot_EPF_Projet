import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { generateDocument, downloadDocument } from "../../Services/documentGeneratorService";

/**
 * Dialogue pour générer des documents à partir d'une conversation
 */
export default function DocumentGeneratorDialog({ 
  open, 
  onClose, 
  conversationId = '',
  conversationTitle 
}) {
  // États pour les options de génération
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [filename, setFilename] = useState(null);
  // Options de configuration
  const [format, setFormat] = useState("pdf");
  const [title, setTitle] = useState("");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [includeSources, setIncludeSources] = useState(true);
  
  // Ensure dialog state is properly synchronized
  React.useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setError(null);
      setSuccess(false);
    }
  }, [open]);
  
  // Mettre à jour le titre lorsque conversationTitle change
  React.useEffect(() => {
    if (conversationTitle) {
      setTitle(conversationTitle);
    } else {
      setTitle("Document généré");
    }
  }, [conversationTitle]);

  // Réinitialiser les états à la fermeture
  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      setDocumentUrl(null);
      onClose();
    }
  };
  // Générer le document
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
  try {
      // Vérification supplémentaire que conversationId est défini et n'est pas vide
      if (!conversationId || conversationId.trim() === '') {
        throw new Error("L'identifiant de conversation est manquant");
      }

      // Éviter le problème de style 'Title' en utilisant document_title au lieu de title
      const result = await generateDocument({
        conversation_id: conversationId,
        format,
        custom_title: title,
        include_question_history: includeHistory,
        include_sources: includeSources
      });
      
      setFilename(result.filename);
      setDocumentUrl(result.url);
      setSuccess(true);
    } catch (error) {
      console.error("Erreur lors de la génération du document:", error);
      setError(error.message || "Une erreur est survenue lors de la génération du document");
    } finally {
      setLoading(false);
    }
  };

  // Télécharger le document généré
  const handleDownload = () => {
    if (filename) {
      downloadDocument(filename);
    }
  };
  // Ne pas afficher le dialogue si conversationId est indéfini
  if (!conversationId && open) {
    console.error("DocumentGeneratorDialog: conversationId manquant");
    onClose();
    return null;
  }
    return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Générer un document</DialogTitle>
          <DialogDescription>
            Créez un document PDF ou Word à partir de cette conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="bg-green-50 text-green-600 p-3 rounded-md">
              Document généré avec succès !
            </div>
          ) : (
            <>              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="format" className="text-right">
                  Format
                </Label>
                <div className="col-span-3">
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format" disabled={loading}>
                      <SelectValue placeholder="Sélectionner un format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word (DOCX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="history" 
                    checked={includeHistory} 
                    onCheckedChange={setIncludeHistory}
                    disabled={loading}
                  />
                  <Label htmlFor="history">
                    Inclure tout l'historique de questions
                  </Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="sources" 
                    checked={includeSources} 
                    onCheckedChange={setIncludeSources}
                    disabled={loading}
                  />
                  <Label htmlFor="sources">
                    Inclure les sources
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          {success ? (
            <>
              <Button type="button" onClick={handleDownload} className="mr-2">
                Télécharger
              </Button>
              <Button type="button" onClick={handleClose} variant="outline">
                Fermer
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="mr-2"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Génération...
                  </span>
                ) : (
                  "Générer"
                )}
              </Button>
              <Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
                Annuler
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}