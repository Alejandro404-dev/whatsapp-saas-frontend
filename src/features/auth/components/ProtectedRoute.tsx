import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Este componente envuelve a las rutas que queremos proteger
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Revisamos nuestra memoria global para ver si hay una sesión activa
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Si no está autenticado, lo pateamos de vuelta al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si todo está bien, lo dejamos pasar al componente que pidió (ej. Dashboard)
    return <>{children}</>;
};