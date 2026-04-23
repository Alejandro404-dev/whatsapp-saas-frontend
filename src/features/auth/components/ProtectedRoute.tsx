import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Este componente es un "Guardia de Ruta" que protege las rutas privadas
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // 1. Selector limpio y eficiente
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);

    // 2. Si falta cualquiera de los dos, fuera.
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    // Si todo está bien, lo dejamos pasar al componente que pidió (ej. Dashboard)
    return <>{children}</>;
};