import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, CheckCircle, Clock, X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const campanaSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type CampanaValues = z.infer<typeof campanaSchema>;

const Campanas = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Referencia para el input de archivo oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [campanas, setCampanas] = useState([
        { id: 1, nombre: "Promo Verano 2026", estado: "Completada", enviados: 1250, fecha: "02 Abr 2026" },
        { id: 2, nombre: "Recordatorio de Pago", estado: "Activa", enviados: 340, fecha: "04 Abr 2026" },
        { id: 3, nombre: "Lanzamiento Producto X", estado: "Borrador", enviados: 0, fecha: "--" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(location.state?.abrirModal || false);

    // ESTADOS PARA LA MAGIA DEL EXCEL
    const [isUploading, setIsUploading] = useState(false);
    const [hasUploaded, setHasUploaded] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CampanaValues>({
        resolver: zodResolver(campanaSchema)
    });

    const onSubmit = (data: CampanaValues) => {
        if (!hasUploaded) {
            toast.error("Debes subir una base de contactos primero");
            return;
        }

        const nuevaCampana = {
            id: campanas.length + 1,
            nombre: data.nombre,
            estado: "Activa",
            enviados: 0,
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        };

        setCampanas([nuevaCampana, ...campanas]);
        cerrarModal();
        toast.success(`¡Campaña "${data.nombre}" encolada para envío!`);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset();
        setHasUploaded(false); // Reseteamos el excel falso
        setIsUploading(false);
    };

    useEffect(() => {
        if (location.state?.abrirModal) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    //  LA FUNCIÓN QUE SIMULA LEER EL EXCEL
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);

            // Simulamos que el servidor está procesando el archivo por 2 segundos
            setTimeout(() => {
                setIsUploading(false);
                setHasUploaded(true);
                toast.success("Base de datos procesada correctamente");
            }, 2000);
        }
    };

    return (
        <div className="p-8 relative">
            {/* ENCABEZADO Y TABLA */}
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

            {/* === EL MODAL DE NUEVA CAMPAÑA CON MAGIA === */}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Campaña</label>
                                <input
                                    {...register("nombre")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Ej: Oferta Especial Diciembre"
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                            </div>

                            {/* LA ZONA DE EXCEL DINÁMICA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base de Contactos</label>

                                {/* Input invisible real */}
                                <input
                                    type="file"
                                    accept=".csv, .xlsx"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />

                                {!isUploading && !hasUploaded && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        <Upload size={24} className="mx-auto text-blue-500 mb-2" />
                                        <p className="text-sm text-blue-700 font-medium">Haz clic para subir archivo Excel/CSV</p>
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="border-2 border-gray-200 rounded-lg p-6 text-center flex flex-col items-center justify-center h-26">
                                        <Loader2 className="text-blue-500 animate-spin mb-2" size={24} />
                                        <p className="text-sm text-gray-600 font-medium">Analizando columnas y números...</p>
                                    </div>
                                )}

                                {hasUploaded && (
                                    <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                                <CheckCircle2 size={18} />
                                                1,452 Contactos Válidos Encontrados
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setHasUploaded(false)}
                                                className="text-xs text-green-700 hover:underline"
                                            >
                                                Cambiar archivo
                                            </button>
                                        </div>
                                        {/* Mini tabla de vista previa */}
                                        <div className="bg-white rounded border border-green-100 p-2 text-xs text-gray-600 font-mono">
                                            <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-1 mb-1 font-bold text-gray-700">
                                                <span>Nombre</span>
                                                <span>Teléfono</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2"><span>Juan Pérez</span><span>+57 300 123 4567</span></div>
                                            <div className="grid grid-cols-2 gap-2"><span>María Gómez</span><span>+57 312 987 6543</span></div>
                                            <div className="grid grid-cols-2 gap-2 text-gray-400 italic"><span>... y 1,450 más</span><span></span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del Mensaje</label>
                                <textarea
                                    {...register("mensaje")}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="¡Hola! Te escribimos de TechSolutions para ofrecerte..."
                                />
                                {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                            </div>

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