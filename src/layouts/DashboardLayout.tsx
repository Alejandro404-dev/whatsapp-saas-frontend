import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, MessageSquare, Smartphone } from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path ? "bg-slate-800 text-blue-400" : "hover:bg-slate-800 transition-colors text-white";

    return (
        <div className="flex h-screen bg-gray-100">
            {/* BARRA LATERAL FIJA */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-blue-400 uppercase tracking-wider">
                        {user?.nombreEmpresa || 'Mi Negocio'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Plataforma SaaS</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link to="/dashboard" className={`p-3 rounded-lg cursor-pointer font-medium flex items-center gap-3 ${isActive('/dashboard')}`}>
                                <LayoutDashboard size={20} />
                                Panel Principal
                            </Link>
                        </li>

                        {/* ¡CANDADO RBAC! Solo Administrador ve Gestión de Usuarios */}
                        {user?.role?.toUpperCase() === 'ADMINISTRADOR' && (
                            <li>
                                <Link to="/dashboard/users" className={`p-3 rounded-lg cursor-pointer font-medium flex items-center gap-3 ${isActive('/dashboard/users')}`}>
                                    <Users size={20} />
                                    Gestión Usuarios
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link to="/dashboard/configuracion" className={`p-3 rounded-lg cursor-pointer font-medium flex items-center gap-3 ${isActive('/dashboard/configuracion')}`}>
                                <Smartphone size={20} />
                                Canal WhatsApp
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/campanas" className={`p-3 rounded-lg cursor-pointer font-medium flex items-center gap-3 ${isActive('/dashboard/campanas')}`}>
                                <MessageSquare size={20} />
                                Campañas
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER FIJO */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10 shrink-0">
                    <h1 className="text-xl font-semibold text-gray-800">Administración</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                            <p className="text-xs text-blue-600 font-semibold uppercase">{user?.role}</p>
                        </div>
                        <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* EL HUECO (Aquí entra la vista que el usuario seleccione) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;