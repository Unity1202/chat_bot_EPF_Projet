# Fonctionnalité de Génération de Documents

Cette fonctionnalité permet aux utilisateurs de générer des documents PDF ou Word (DOCX) à partir des conversations avec l'assistant juridique.

## Prérequis pour le Backend

Pour utiliser cette fonctionnalité, les bibliothèques Python suivantes doivent être installées :

```bash
pip install python-docx reportlab
```

Ou via un fichier requirements :
```bash
pip install -r requirements-doc-generator.txt
```

Ce fichier contient les dépendances :
- python-docx (pour les documents Word)
- reportlab (pour les documents PDF)

## Architecture de la fonctionnalité

### 1. Service de génération de documents

Le service `DocumentGeneratorService` (dans `app/services/document_generator_service.py`) fournit deux méthodes principales :
- `generate_pdf()` : Génère un document PDF formaté
- `generate_word()` : Génère un document Word (DOCX) formaté

### 2. API Endpoints

Deux endpoints sont disponibles :

#### Générer un document
```
POST /api/document-generator/generate
```

Paramètres du corps de la requête :
```json
{
  "conversation_id": "string",        // ID de la conversation (obligatoire)
  "question_id": "integer",           // ID de la question (facultatif)
  "format": "pdf|docx",               // Format du document (obligatoire)
  "title": "string",                  // Titre personnalisé (facultatif)
  "include_question_history": false,  // Inclure tout l'historique (défaut: false)
  "include_sources": true             // Inclure les sources (défaut: true)
}
```

Réponse :
```json
{
  "filename": "string",  // Nom du fichier généré
  "url": "string"        // URL pour télécharger le document
}
```

#### Télécharger un document généré
```
GET /api/document-generator/download/{filename}
```

## Utilisation dans l'interface

1. Dans une conversation, cliquez sur l'icône de document en haut à droite.
2. Configurez les options de génération :
   - Format (PDF ou Word)
   - Titre du document
   - Inclusion de l'historique complet des questions
   - Inclusion des sources juridiques
3. Cliquez sur "Générer" pour créer le document.
4. Une fois généré, vous pouvez télécharger le document.

## Composants Frontend

Les fichiers implémentant cette fonctionnalité sont :

- `src/Services/documentGeneratorService.jsx` : Service qui communique avec l'API backend
- `src/components/Chat/DocumentGeneratorDialog.jsx` : Dialogue de configuration et génération
- `src/components/Chat/ChatBox.jsx` : Intégration du bouton de génération dans l'interface

## Format des documents générés

Les documents générés incluent :
- Un en-tête avec le titre et la date
- Le contenu des questions et réponses formaté
- Les sources juridiques (si activées)
- Un pied de page avec des informations sur JuridicA
