import { useAuthStore } from '../features/auth/store/useAuthStore';
import { MessageSquare, TrendingUp, Users, Smartphone, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuthStore();

    const stats = [
        { title: "Mensajes Enviados", value: "14,592", trend: "+12.5%", trendUp: true, icon: <MessageSquare size={24} className="text-blue-600" />, bgColor: "bg-blue-50" },
        { title: "Campañas Activas", value: "3", trend: "En ejecución", trendUp: true, icon: <TrendingUp size={24} className="text-green-600" />, bgColor: "bg-green-50" },
        { title: "Operadores", value: "8", trend: "2 en línea", trendUp: true, icon: <Users size={24} className="text-purple-600" />, bgColor: "bg-purple-50" },
        { title: "Números Conectados", value: "1", trend: "Estado: Activo", trendUp: true, icon: <Smartphone size={24} className="text-orange-600" />, bgColor: "bg-orange-50" }
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Hola, {user?.email?.split('@')[0] || 'Usuario'} 👋
                </h1>
                <p className="text-gray-500 mt-2">
                    Aquí tienes un resumen de la actividad de tu plataforma en los últimos 30 días.
                </p>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to="/dashboard/campanas"
                            state={{ abrirModal: true }}
                            className="group flex items-center p-4 border border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4"><MessageSquare size={20} /></div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 group-hover:text-blue-700">Nueva Campaña</h4>
                                <p className="text-xs text-gray-500">Envía mensajes masivos</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                        </Link>
                        {user?.role?.toUpperCase() === 'ADMINISTRADOR' && (
                            <Link to="/dashboard/users" className="group flex items-center p-4 border border-gray-100 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mr-4"><Users size={20} /></div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 group-hover:text-purple-700">Gestión de Equipo</h4>
                                    <p className="text-xs text-gray-500">Administra accesos</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600" />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Estado del Sistema</h2>
                    <div className="space-y-6">
                        <div className="flex items-center">
                            <div className="relative"><Activity size={20} className="text-green-500 mr-3" /><span className="absolute top-0 right-3 w-2 h-2 bg-green-500 rounded-full animate-ping"></span></div>
                            <div><p className="text-sm font-semibold text-gray-800">Conexión API Meta</p><p className="text-xs text-gray-500">En línea y funcionando</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;