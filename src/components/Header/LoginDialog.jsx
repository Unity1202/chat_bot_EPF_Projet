import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const LoginDialog = ({ children, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    // réinitialiser les champs quand la popup se ferme
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEmail('');
            setPassword('');
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
                            className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#FFFFFF] text-[#16698C] placeholder:text-[#16698C]/60"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full bg-[#15ACCD] text-[#FFFFFF] hover:bg-[#15abcdd6]"
                    >
                        Se connecter
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog; 