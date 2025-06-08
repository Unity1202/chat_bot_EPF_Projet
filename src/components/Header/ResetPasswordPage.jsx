import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { verifyResetToken, resetPassword } from '../../Services/authService';
import LogoJuridica from '../Header/LogoJuridica';
import LogoClient from '../Header/LogoClient';

/**
 * Page de réinitialisation de mot de passe
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [success, setSuccess] = useState(false);

  // Extraire le token du query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Aucun token de réinitialisation trouvé. Veuillez vérifier le lien.');
      setTokenValid(false);
    }
  }, [location]);

  // Valider le token
  const validateToken = async (tokenToValidate) => {
    setLoading(true);
    try {
      const isValid = await verifyResetToken(tokenToValidate);
      setTokenValid(isValid);
      if (!isValid) {
        setError('Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.');
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      setError('Une erreur est survenue lors de la vérification du lien. Veuillez réessayer.');
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation des entrées
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un message d'erreur si le token est invalide
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <LogoJuridica />
          </div>
          <div className="mt-4 flex justify-center">
            <LogoClient />
          </div>
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-2">Lien invalide</h2>
              <p>{error}</p>
              <div className="mt-4">
                <Button onClick={() => navigate('/')} className="w-full">
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Afficher un spinner pendant le chargement initial
  if (tokenValid === null && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <p className="mt-4 text-gray-600">Vérification du lien de réinitialisation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogoJuridica />
        </div>
        <div className="mt-4 flex justify-center">
          <LogoClient />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialisation du mot de passe
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Mot de passe réinitialisé avec succès!</h3>
              <p>Vous allez être redirigé vers la page de connexion...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmez le mot de passe
                </label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;