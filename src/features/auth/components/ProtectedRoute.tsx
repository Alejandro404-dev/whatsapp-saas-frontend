import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const location = useLocation(); // Para saber en qué ruta estamos intentando entrar

    // 1. Si no hay sesión, pa' fuera
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si tiene pendiente cambiar la clave Y NO está ya en la pantalla de cambiar clave
    if (user?.requirePasswordChange && location.pathname !== '/actualizar-password') {
        return <Navigate to="/actualizar-password" replace />;
    }

    // 3. (Opcional pero recomendado) Si NO tiene que cambiar la clave pero intenta entrar a esa pantalla
    if (!user?.requirePasswordChange && location.pathname === '/actualizar-password') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};