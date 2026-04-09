import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    tenantId: string; 
    role: string; // <-- Siempre 'role'
    nombreEmpresa: string;
    accesos: string[]; // <-- Siempre 'accesos'
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            // Guardamos el objeto 'user' tal cual llega del backend
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' }
    )
);