// point d'entrée principal de l'application react
// configure le provider de thème pour gérer le mode clair/sombre
// monte l'application dans l'élément root du dom
// active le mode strict de react pour détecter les problèmes potentiels

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import './styles/fonts.css';
import './styles/components.css';
import './styles/markdown.css';
import './styles/rag-specific.css';
import './styles/document-analyzer.css';
import App from './App';
import { ThemeProvider } from './components/Header/theme-provider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);