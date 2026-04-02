import { create } from 'zustand';
import { persist } from 'zustand/middleware';


// Definimos los datos que queremos guardar de usuario
interface User {
    id: string;
    email: string;
    tenantId: string; // Cruacial para saber a que empresa pertenece
    role: string
    nombreEmpresa: string;
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
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' } // Esto guarda los datos en el LocalStorage automáticamente
    )
);