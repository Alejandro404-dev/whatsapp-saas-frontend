import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, CheckCircle, Clock, X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// ==========================================
// ESQUEMA DE VALIDACIÓN ZOD (CORREGIDO)
// ==========================================
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const campanaSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().min(1, "La fecha fin es requerida"),
}).refine((data) => {
    const start = new Date(data.startDate + "T00:00:00");
    return start >= hoy;
}, {
    message: "La fecha de inicio no puede ser menor a hoy",
    path: ["startDate"],
}).refine((data) => {
    const start = new Date(data.startDate + "T00:00:00");
    const end = new Date(data.endDate + "T00:00:00");
    return end >= start;
}, {
    message: "La fecha fin no puede ser menor a la de inicio",
    path: ["endDate"],
});

type CampanaValues = z.infer<typeof campanaSchema>;

interface ContactoExcel {
    nombre: string;
    telefono: string;
}

const Campanas = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Referencia para el input de archivo oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [campanas, setCampanas] = useState([
        { id: 1, nombre: "Promo Verano 2026", estado: "Completada", enviados: 1250, fecha: "02 Abr 2026 - 15 Abr 2026" },
        { id: 2, nombre: "Recordatorio de Pago", estado: "Activa", enviados: 340, fecha: "04 Abr 2026 - 10 Abr 2026" },
        { id: 3, nombre: "Lanzamiento Producto X", estado: "Borrador", enviados: 0, fecha: "--" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(location.state?.abrirModal || false);

    // ESTADOS PARA LA MAGIA DEL EXCEL
    const [isUploading, setIsUploading] = useState(false);
    const [hasUploaded, setHasUploaded] = useState(false);
    // NUEVO ESTADO: Guarda los contactos reales extraídos
    const [contactosValidos, setContactosValidos] = useState<ContactoExcel[]>([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CampanaValues>({
        resolver: zodResolver(campanaSchema)
    });

    const onSubmit = (data: CampanaValues) => {
        if (!hasUploaded || contactosValidos.length === 0) {
            toast.error("Debes subir una base de contactos válida primero");
            return;
        }

        const formatoOpciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };

        const inicioDate = new Date(data.startDate + "T00:00:00");
        const finDate = new Date(data.endDate + "T00:00:00");

        const fechaInicioStr = inicioDate.toLocaleDateString('es-ES', formatoOpciones);
        const fechaFinStr = finDate.toLocaleDateString('es-ES', formatoOpciones);

        const nuevaCampana = {
            id: campanas.length + 1,
            nombre: data.nombre,
            estado: "Activa",
            enviados: 0,
            fecha: `${fechaInicioStr} - ${fechaFinStr}`
        };

        setCampanas([nuevaCampana, ...campanas]);
        cerrarModal();
        toast.success(`¡Campaña "${data.nombre}" encolada para envío a ${contactosValidos.length} contactos!`);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset();
        setHasUploaded(false);
        setIsUploading(false);
        setContactosValidos([]); // Limpiamos la memoria
    };

    useEffect(() => {
        if (location.state?.abrirModal) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // ==========================================
    // LA FUNCIÓN REAL QUE LEE EL EXCEL
    // ==========================================
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setHasUploaded(false);

        const reader = new FileReader();
        
        reader.onload = (evt) => {
            try {
                // 1. Leemos el archivo binario
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                
                // 2. Agarramos la primera hoja de cálculo
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                // 3. Convertimos esa hoja a un Array de Objetos genéricos
                const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

                // 4. Mapeamos los datos para estandarizarlos
                const contactosLimpios: ContactoExcel[] = data.map((fila) => {
                    const filaMinusculas: Record<string, string> = {};
                    for (const key in fila) {
                        // Lo pasamos a string por si Excel lee el teléfono como número
                        filaMinusculas[key.toLowerCase().trim()] = String(fila[key]);
                    }

                    return {
                        nombre: filaMinusculas['nombre'] || filaMinusculas['name'] || filaMinusculas['cliente'] || 'Sin Nombre',
                        telefono: filaMinusculas['telefono'] || filaMinusculas['celular'] || filaMinusculas['phone'] || 'Sin Número'
                    };
                }).filter(c => c.telefono !== 'Sin Número'); // Descartamos filas vacías

                if (contactosLimpios.length === 0) {
                    toast.error("El archivo no tiene una columna de Teléfono válida.");
                    setIsUploading(false);
                    return;
                }

                setContactosValidos(contactosLimpios);
                setHasUploaded(true);
                toast.success(`¡Se extrajeron ${contactosLimpios.length} contactos!`);

            } catch (error) {
                console.error(error);
                toast.error("Hubo un error al leer el archivo Excel.");
            } finally {
                setIsUploading(false);
                // Reseteamos el input invisible para que el "onChange" detecte si se sube el mismo archivo de nuevo
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsBinaryString(file);
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
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Duración</th>
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        {...register("startDate")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                                    <input
                                        type="date"
                                        {...register("endDate")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                                </div>
                            </div>

                            {/* LA ZONA DE EXCEL DINÁMICA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base de Contactos</label>

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
                                        <p className="text-xs text-blue-400 mt-1">El archivo debe tener las columnas "Nombre" y "Telefono"</p>
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
                                                {contactosValidos.length} Contactos Válidos
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setHasUploaded(false); setContactosValidos([]); }}
                                                className="text-xs text-green-700 hover:underline"
                                            >
                                                Cambiar archivo
                                            </button>
                                        </div>
                                        
                                        <div className="bg-white rounded border border-green-100 p-2 text-xs text-gray-600 font-mono">
                                            <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-1 mb-1 font-bold text-gray-700">
                                                <span>Nombre</span>
                                                <span>Teléfono</span>
                                            </div>
                                            
                                            {/* Renderizamos solo los primeros 3 para la vista previa */}
                                            {contactosValidos.slice(0, 3).map((contacto, index) => (
                                                <div key={index} className="grid grid-cols-2 gap-2">
                                                    <span className="truncate">{contacto.nombre}</span>
                                                    <span>{contacto.telefono}</span>
                                                </div>
                                            ))}
                                            
                                            {contactosValidos.length > 3 && (
                                                <div className="grid grid-cols-2 gap-2 text-gray-400 italic mt-1 pt-1 border-t border-gray-50">
                                                    <span>... y {contactosValidos.length - 3} más</span>
                                                    <span></span>
                                                </div>
                                            )}
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