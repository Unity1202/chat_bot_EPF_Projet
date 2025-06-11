import React, { useState } from 'react';
import { X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import SignUpDialog from '../SignUpDialog';
import ForgotPasswordRequestDialog from './ForgotPasswordRequestDialog';
import { login as loginUser, signup } from '../../Services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from "../../lib/utils";

/**
 * Dialog spécifique pour la connexion utilisateur depuis l'avatar
 * Version simplifiée sans dépendances complexes avec le système de dialog général
 */
const UserLoginDialog = ({ isOpen, onClose }) => {
  const { login: loginContext } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Masquer le dialogue si isOpen est false
  if (!isOpen) return null;

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');    try {
      const userData = await loginUser(email, password);
      await loginContext(userData);
      onClose();
    } catch (error) {
      setError(error.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'inscription
  const handleSignUp = async (userData) => {
    setLoading(true);
    setError('');    try {
      const response = await signup(userData);
      await loginContext(response.user || { email: userData.email });
      onClose();
      
      // Rechargement automatique de la page après une inscription réussie
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      setError(error.message || "Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay semi-transparent */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/80"
        onClick={onClose}
      />
      
      {/* Contenu de la boîte de dialogue */}
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
          "bg-[#16698C] border-[#16698C] border-2"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-[#FFFFFF]">
            Connexion
          </h2>
          <p className="text-sm text-[#FFFFFF]/70">
            Connectez-vous pour accéder à votre compte.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
            />
          </div>
          
          <div className="flex justify-end mb-2">
            <button
              type="button"
              className="text-[#15ACCD] hover:underline text-xs"
              onClick={() => setShowForgotPassword(true)}
            >
              Mot de passe oublié ?
            </button>
          </div>
          
          {error && (
            <div className="text-[#FFCC00] text-sm font-medium">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-[#15ACCD] text-[#FFFFFF] hover:bg-[#15abcdd6]"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
        
        {/* Pied de page */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
          <div className="w-full text-center text-[#FFFFFF]/90 text-sm">
            <span>Pas encore de compte ? </span>
            <SignUpDialog onSignUp={handleSignUp}>
              <span className="cursor-pointer text-[#15ACCD] font-medium hover:underline">
                S'inscrire
              </span>
            </SignUpDialog>
          </div>
        </div>

        {/* Bouton pour fermer */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
      </div>
      
      {/* Ajout du dialogue de mot de passe oublié */}
      <ForgotPasswordRequestDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};

export default UserLoginDialog;
