import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import SignUpDialog from '../SignUpDialog';
import {  signup } from '../../Services/authService';
import { useAuth } from '../../contexts/AuthContext';


export async function loginUser(email, password) {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
      credentials: "include", // Inclure les cookies
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Connexion échouée");
    }
  
    return await response.json();
  }
  
const LoginDialog = ({ children }) => {


    const { login: loginContext } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);


    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
      
        try {
          const response = await loginUser(email, password);
      
          // Mettre à jour le contexte utilisateur avec les données retournées
          loginContext(response.user);
      
          // Fermer la boîte de dialogue
          setOpen(false);
        } catch (error) {
          setError(error.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        } finally {
          setLoading(false);
        }
      };

    const handleSignUp = async (userData) => {
        setLoading(true);
        setError('');
        
        try {
            const response = await signup(userData);
            loginContext(response.user || { email: userData.email });
            
            // Fermer la boîte de dialogue avant le rechargement
            setOpen(false);
            
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

    // Réinitialiser les champs quand la popup se ferme
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setError('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#16698C] border-[#16698C] border-2 [&>button]:text-white">
                <DialogHeader>
                    <DialogTitle className="text-[#FFFFFF]">Connexion</DialogTitle>
                </DialogHeader>
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
                
                <DialogFooter className="mt-4">
                    <div className="w-full text-center text-[#FFFFFF]/90 text-sm">
                        <span>Pas encore de compte ? </span>
                        <SignUpDialog onSignUp={handleSignUp}>
                            <span className="cursor-pointer text-[#15ACCD] font-medium hover:underline">
                                S'inscrire
                            </span>
                        </SignUpDialog>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;