import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import UserManagement from './pages/UserManagement';
import Campanas from './pages/Campanas';
import Configuracion from './pages/Configuracion';
import Roles from './pages/Roles';
import { Toaster } from 'react-hot-toast';
import Flujos from './pages/Flujos';
import UpdatePassword from './pages/UpdatePassword';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirección por defecto al login si entras a la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Privadas (Envueltas por el Layout Mágico) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout /> {/* <-- EL MARCO: Aquí está el menú lateral, arriba el Header, y en el centro el <Outlet /> */}
          </ProtectedRoute>
        }>
          {/* LA FOTO POR DEFECTO: Lo que se pinta en el <Outlet /> al entrar a /dashboard */}
          <Route index element={<Dashboard />} />

          {/* LA OTRA FOTO: Lo que se pinta en el <Outlet /> al entrar a /dashboard/users */}
          <Route path="users" element={<UserManagement />} />

          {/* Ruta para la página de Campañas */}
          <Route path="campanas" element={<Campanas />} />

          {/* Ruta para la pagina de configuracion */}
          <Route path="configuracion" element={<Configuracion />} />

          {/* Ruta para la pagina de roles */}
          <Route path="roles" element={<Roles />} />

          {/* Ruta para la página de flujos */}
          <Route path="flujos" element={<Flujos />} />



        </Route>

        {/* ========================================== */}
        {/* RUTA PARA CAMBIO DE CONTRASEÑA OBLIGATORIO */}
        {/* ========================================== */}
        <Route path="/actualizar-password" element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* RUTA PARA CAMBIO DE CONTRASEÑA OBLIGATORIO */}
        {/* ========================================== */}
        <Route path="/actualizar-password" element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        } />



      </Routes>
    </Router>
  );
}

export default App;