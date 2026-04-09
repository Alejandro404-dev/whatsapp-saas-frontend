import { useAuthStore } from '../features/auth/store/useAuthStore';
import { MessageSquare, TrendingUp, Users, Smartphone, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const stats = [
        { title: "Mensajes Enviados", value: "14,592", trend: "+12.5%", trendUp: true, icon: <MessageSquare size={24} className="text-blue-600" />, bgColor: "bg-blue-50" },
        { title: "Campañas Activas", value: "3", trend: "En ejecución", trendUp: true, icon: <TrendingUp size={24} className="text-green-600" />, bgColor: "bg-green-50" },
        { title: "Operadores", value: "8", trend: "2 en línea", trendUp: true, icon: <Users size={24} className="text-purple-600" />, bgColor: "bg-purple-50" },
        { title: "Números Conectados", value: "1", trend: "Estado: Activo", trendUp: true, icon: <Smartphone size={24} className="text-orange-600" />, bgColor: "bg-orange-50" }
    ];

    return (
        <div className="p-8">
            {/* ENCABEZADO */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Hola, {user?.email?.split('@')[0] || 'Usuario'} 👋
                </h1>
                <p className="text-gray-500 mt-2">
                    Aquí tienes un resumen de la actividad de tu plataforma en los últimos 30 días.
                </p>
            </div>

            {/* TARJETAS DE ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>{stat.icon}</div>
                            <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>{stat.trend}</span>
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CONTENEDOR INFERIOR: Dos columnas simétricas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
                
                {/* COLUMNA IZQUIERDA: Acciones Rápidas */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. TARJETA DE NUEVA CAMPAÑA */}
                        <div 
                            onClick={() => navigate('/dashboard/campanas')} 
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Nueva Campaña</h4>
                                    <p className="text-xs text-gray-500">Envía mensajes masivos</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-300" />
                        </div>

                        {/* 2. TARJETA DE GESTIÓN DE EQUIPO */}
                        {(user?.role === 'SuperAdmin' || user?.accesos?.includes('gestionar_usuarios')) && (
                            <div 
                                onClick={() => navigate('/dashboard/users')} 
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Añadir Miembro</h4>
                                    <p className="text-xs text-gray-500">Invita a tu equipo al sistema</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* COLUMNA DERECHA: Estado del Sistema */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Estado del Sistema</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-[1.15rem]">
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="relative">
                                    <Activity size={20} className="text-green-500 mr-3" />
                                    <span className="absolute top-0 right-3 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Conexión API Meta</p>
                                    <p className="text-xs text-gray-500">En línea y funcionando</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;