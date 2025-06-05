import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const SignUpDialog = ({ children, onSignUp }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation du formulaire
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        // Réinitialiser l'erreur
        setError('');
        
        // Appeler la fonction d'inscription
        onSignUp(formData);
    };

    // Réinitialiser les champs quand la popup se ferme
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
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
                    <DialogTitle className="text-[#FFFFFF]">Créer un compte</DialogTitle>
                    <DialogDescription className="text-[#FFFFFF]/70">
                        Inscrivez-vous pour accéder à toutes les fonctionnalités.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="firstName"
                                placeholder="Prénom"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="lastName"
                                placeholder="Nom"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
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
                    >
                        S'inscrire
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SignUpDialog;