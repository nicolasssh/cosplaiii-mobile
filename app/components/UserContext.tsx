import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Importez votre instance Firebase Auth

// Créer le contexte
const UserContext = createContext({
    user: null,
    setUser: (user: any) => {},
});

// Fournisseur de contexte
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe(); // Nettoyer l'abonnement
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook pour utiliser le contexte utilisateur
export const useUser = () => useContext(UserContext);
