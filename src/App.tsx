import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirección por defecto si no estás logueado */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Privadas (Envueltas por el Layout) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard /> {/* Fíjate que ahora usamos el molde */}
          </ProtectedRoute>
        }>
            {/* Pantalla por defecto al entrar a /dashboard */}
            <Route index element={
                <div className="p-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Bienvenido a tu espacio de trabajo</h3>
                        <p className="text-gray-500">Selecciona una opción del menú lateral para comenzar.</p>
                    </div>
                </div>
            } />
            
            {/* Nuestra nueva pantalla de usuarios: /dashboard/users */}
            <Route path="users" element={<UserManagement />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;