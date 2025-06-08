import React, { useState } from 'react';
import { X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { requestPasswordReset } from '../../Services/authService';
import { cn } from "../../lib/utils";

/**
 * Dialogue pour demander la réinitialisation du mot de passe
 */
const ForgotPasswordRequestDialog = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Masquer le dialogue si isOpen est false
  if (!isOpen) return null;

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation simple de l'email
    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse e-mail valide');
      setLoading(false);
      return;
    }

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Mot de passe oublié</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
              <p>Un e-mail a été envoyé à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.</p>
              <p className="mt-2">Veuillez vérifier votre boîte de réception et suivre les instructions.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  Adresse e-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  disabled={loading}
                  required
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Entrez l'adresse e-mail associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  type="button" 
                  onClick={onClose} 
                  variant="outline" 
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordRequestDialog;