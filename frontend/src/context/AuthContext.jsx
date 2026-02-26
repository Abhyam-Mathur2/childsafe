import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Gamification States
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        // Check local storage for persistent login
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Load gamification data
        const storedXp = localStorage.getItem('xp');
        const storedLevel = localStorage.getItem('level');
        if (storedXp) setXp(parseInt(storedXp));
        if (storedLevel) setLevel(parseInt(storedLevel));
        
        setLoading(false);
    }, []);

    const gainXp = (amount) => {
        setXp(prevXp => {
            const newXp = prevXp + amount;
            const nextLevelThreshold = level * 1000;
            
            if (newXp >= nextLevelThreshold) {
                setLevel(prevLevel => {
                    const newLevel = prevLevel + 1;
                    localStorage.setItem('level', newLevel.toString());
                    return newLevel;
                });
                const remainingXp = newXp - nextLevelThreshold;
                localStorage.setItem('xp', remainingXp.toString());
                return remainingXp;
            }
            
            localStorage.setItem('xp', newXp.toString());
            return newXp;
        });
    };

    const login = async (email, password) => {
        console.log("Attempting login with", email);
        await new Promise(resolve => setTimeout(resolve, 800));

        if (password.length >= 6) {
            const userData = { name: email.split('@')[0], email };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        }
        throw new Error("Invalid credentials");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('xp');
        localStorage.removeItem('level');
        setXp(0);
        setLevel(1);
    };

    const signup = async (name, email, password) => {
        console.log("Attempting signup with", email);
        await new Promise(resolve => setTimeout(resolve, 800));

        const userData = { name, email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, loading, xp, level, gainXp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
