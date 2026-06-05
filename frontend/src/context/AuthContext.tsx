import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import api from '../service/api';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(undefined!);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);  // ждём проверку токена

    // При загрузке страницы — проверяем, есть ли токен
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Если токен есть — получаем пользователя
            api.get('/users/me')
                .then((res) => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData: User) => setUser(userData);
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}