import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // <-- 1. Agregamos useNavigate
import { Plus, MessageSquare, CheckCircle, Clock, X, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const campanaSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type CampanaValues = z.infer<typeof campanaSchema>;

const Campanas = () => {
    // 2. Inicializamos los radares de React Router
    const location = useLocation();
    const navigate = useNavigate();

    const [campanas, setCampanas] = useState([
        { id: 1, nombre: "Promo Verano 2026", estado: "Completada", enviados: 1250, fecha: "02 Abr 2026" },
        { id: 2, nombre: "Recordatorio de Pago", estado: "Activa", enviados: 340, fecha: "04 Abr 2026" },
        { id: 3, nombre: "Lanzamiento Producto X", estado: "Borrador", enviados: 0, fecha: "--" },
    ]);

    // 3.Leemos el mensaje secreto directamente aquí
    const [isModalOpen, setIsModalOpen] = useState(location.state?.abrirModal || false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CampanaValues>({
        resolver: zodResolver(campanaSchema)
    });

    const onSubmit = (data: CampanaValues) => {
        const nuevaCampana = {
            id: campanas.length + 1,
            nombre: data.nombre,
            estado: "Activa",
            enviados: 0,
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        };

        setCampanas([nuevaCampana, ...campanas]);
        cerrarModal();
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset(); 
    };

    //  4. Limpiamos la ruta silenciosamente para que al dar F5 no se vuelva a abrir el modal
    useEffect(() => {
        if (location.state?.abrirModal) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className="p-8 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Campañas Masivas</h2>
                    <p className="text-gray-500">Administra y envía mensajes a múltiples contactos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nueva Campaña
                </button>
            </div>

            {/* === LA TABLA === */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre de Campaña</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mensajes Enviados</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {campanas.map((campana) => (
                            <tr key={campana.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <MessageSquare size={16} />
                                        </div>
                                        <span className="font-medium text-gray-700">{campana.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max
                                        ${campana.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                                            campana.estado === 'Activa' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                'bg-gray-100 text-gray-700'}`}>
                                        {campana.estado === 'Completada' && <CheckCircle size={12} />}
                                        {campana.estado === 'Activa' && <Clock size={12} />}
                                        {campana.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    {campana.enviados.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {campana.fecha}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* === EL MODAL DE NUEVA CAMPAÑA === */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Configurar Nueva Campaña</h3>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Campo: Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Campaña</label>
                                <input
                                    {...register("nombre")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Ej: Oferta Especial Diciembre"
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                            </div>

                            {/* Campo Falso: Subir Excel */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base de Contactos (Excel/CSV)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">Haz clic para subir tu archivo</p>
                                    <p className="text-xs text-gray-400 mt-1">.xlsx, .csv (Máx. 10,000 contactos)</p>
                                </div>
                            </div>

                            {/* Campo: Mensaje de WhatsApp */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del Mensaje</label>
                                <textarea
                                    {...register("mensaje")}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="¡Hola! Te escribimos de TechSolutions para ofrecerte..."
                                />
                                {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                                <p className="text-xs text-gray-500 mt-1 flex justify-end">Tip: Puedes usar *negritas* y _cursivas_</p>
                            </div>

                            {/* Botones */}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                                    <MessageSquare size={18} />
                                    Lanzar Campaña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campanas;