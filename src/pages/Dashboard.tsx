import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    // Traemos los datos del usuario logueado y la función para cerrar sesión desde nuestra memoria global
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Borra los datos de Zustand
        navigate('/login'); // Te manda de vuelta a la puerta
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Menú Lateral) */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold text-blue-400">WhatsApp SaaS</h2>
                    {/* Aquí mostramos el Tenant ID que sacamos de Node */}
                    <p className="text-xs text-slate-400 mt-1">Tenant: {user?.tenantId || 'N/A'}</p>
                </div>
                
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {/* Estas opciones son las que marca la propuesta técnica */}
                        <li className="p-3 bg-slate-800 rounded-lg cursor-pointer text-blue-400 font-medium">Panel Principal</li>
                        <li className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">Constructor de Flujos</li>
                        <li className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">Campañas Masivas</li>
                        <li className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">CRM Contactos</li>
                    </ul>
                </nav>
            </div>

            {/* Contenedor Principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Barra Superior) */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h1 className="text-xl font-semibold text-gray-800">Panel Principal</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            {/* Mostramos dinámicamente el email y el rol */}
                            <p className="text-sm font-medium text-gray-700">{user?.email || 'Usuario Desconocido'}</p>
                            <p className="text-xs text-blue-600 font-semibold">{user?.role || 'Sin Rol'}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Área de Trabajo (Donde irán las gráficas luego) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Bienvenido a tu espacio de trabajo</h3>
                        <p className="text-gray-500">
                            Has iniciado sesión exitosamente. La conexión entre React, Zustand y nuestro simulador de Node está funcionando al 100%.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;