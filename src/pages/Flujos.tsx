import { useState } from 'react';
import { Bot, Plus, Edit2, Trash2, X, MessageCircle, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Esquema de validacion
const flujoSchema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio"),
    palabrasClave: z.string().min(2, "Ingresa al menos una palabra clave"),
    respuesta: z.string().min(5, "El mensaje de respuesta es muy corto"),
});

type FlujoValues = z.infer<typeof flujoSchema>;

const Flujos = () => {
    // Estado inicial de los bots
    const [flujos, setFlujos] = useState([
        { id: 1, nombre: "Mensaje de Bienvenida", palabrasClave: "hola, buen dia, info", respuesta: "¡Hola! 👋 Gracias por comunicarte con nosotros. ¿En qué te podemos ayudar hoy?", activo: true },
        { id: 2, nombre: "Horarios de Atención", palabrasClave: "horario, a que hora, abren", respuesta: "Nuestro horario de atención es de Lunes a Viernes de 8:00 AM a 6:00 PM.", activo: true },
        { id: 3, nombre: "Precios", palabrasClave: "precio, costo, valor", respuesta: "Nuestros planes comienzan desde $10 USD mensuales. Puedes ver más en nuestra web.", activo: false },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flujoEnEdicion, setFlujoEnEdicion] = useState<number | null>(null);

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<FlujoValues>({
        resolver: zodResolver(flujoSchema)
    });

    // Observamos el texto en tiempo real para la vista previab 
    const mensajePrevia = useWatch({
        control,
        name: "respuesta",
        defaultValue: ""
    });

    const abrirModalNuevo = () => {
        setFlujoEnEdicion(null);
        reset({ nombre: '', palabrasClave: '', respuesta: '' });
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (flujo: typeof flujos[0]) => {
        setFlujoEnEdicion(flujo.id);
        setValue('nombre', flujo.nombre);
        setValue('palabrasClave', flujo.palabrasClave);
        setValue('respuesta', flujo.respuesta);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const toggleEstado = (id: number) => {
        setFlujos(flujos.map(f => {
            if (f.id === id) {
                const nuevoEstado = !f.activo;
                toast.success(nuevoEstado ? "Flujo activado" : "Flujo pausado");
                return { ...f, activo: nuevoEstado };
            }
            return f;
        }));
    };

    const onSubmit = (data: FlujoValues) => {
        if (flujoEnEdicion) {
            setFlujos(flujos.map(f => f.id === flujoEnEdicion ? { ...f, ...data } : f));
            toast.success("Flujo actualizado correctamente");
        } else {
            const nuevoFlujo = {
                id: flujos.length + 1,
                ...data,
                activo: true
            };
            setFlujos([nuevoFlujo, ...flujos]);
            toast.success("Nuevo bot configurado");
        }
        cerrarModal();
    };

    const eliminarFlujo = (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta automatización?")) {
            setFlujos(flujos.filter(f => f.id !== id));
            toast.success("Flujo eliminado");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Automatización (Chatbots)</h2>
                    <p className="text-gray-500">Configura respuestas automáticas basadas en palabras clave</p>
                </div>
                <button
                    onClick={abrirModalNuevo}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Nuevo Flujo
                </button>
            </div>

            {/* TABLA DE FLUJOS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre del Flujo</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Palabras Clave (Triggers)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {flujos.map((flujo) => (
                            <tr key={flujo.id} className={`hover:bg-gray-50 transition-colors ${!flujo.activo && 'opacity-60'}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${flujo.activo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Bot size={16} />
                                        </div>
                                        <span className="font-bold text-gray-700">{flujo.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-mono bg-gray-50 px-3 py-1 rounded w-max border border-gray-100">
                                        <Zap size={14} className="text-amber-500" />
                                        {flujo.palabrasClave}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleEstado(flujo.id)}
                                        className="flex items-center gap-2 focus:outline-none"
                                        title={flujo.activo ? "Pausar bot" : "Activar bot"}
                                    >
                                        {flujo.activo ? (
                                            <ToggleRight size={28} className="text-green-500" />
                                        ) : (
                                            <ToggleLeft size={28} className="text-gray-400" />
                                        )}
                                        <span className={`text-sm font-bold ${flujo.activo ? 'text-green-600' : 'text-gray-500'}`}>
                                            {flujo.activo ? 'Activo' : 'Pausado'}
                                        </span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 text-gray-400">
                                        <button onClick={() => abrirModalEdicion(flujo)} className="p-2 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => eliminarFlujo(flujo.id)} className="p-2 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CON VISTA PREVIA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh]">

                        {/* Panel Izquierdo: Formulario */}
                        <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {flujoEnEdicion ? 'Editar Automatización' : 'Nueva Automatización'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Interno</label>
                                    <input {...register("nombre")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ej: Bot de Precios" />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Palabras Clave (Separadas por coma)</label>
                                    <input {...register("palabrasClave")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ej: precio, costo, valor" />
                                    <p className="text-xs text-gray-500 mt-1">Si el cliente escribe alguna de estas palabras, el bot responderá.</p>
                                    {errors.palabrasClave && <p className="text-red-500 text-xs mt-1">{errors.palabrasClave.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje de Respuesta</label>
                                    <textarea {...register("respuesta")} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Escribe aquí lo que el bot debe responder..." />
                                    {errors.respuesta && <p className="text-red-500 text-xs mt-1">{errors.respuesta.message}</p>}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={cerrarModal} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all">Guardar Flujo</button>
                                </div>
                            </form>
                        </div>

                        {/* Panel Derecho: Simulador Celular */}
                        <div className="w-1/2 bg-slate-50 p-8 flex flex-col items-center justify-center relative">
                            <button onClick={cerrarModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>

                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <MessageCircle size={16} /> Vista Previa del Cliente
                            </h4>

                            {/* Contenedor simulando un telefono */}
                            <div className="w-[300px] h-[500px] bg-[#efeae2] rounded-3xl shadow-xl border-[8px] border-slate-800 overflow-hidden flex flex-col relative">
                                {/* Cabecera de WhatsApp */}
                                <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shrink-0">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Bot size={18} /></div>
                                    <div>
                                        <p className="font-bold text-sm">Tu Empresa</p>
                                        <p className="text-[10px] text-white/70">bot activo</p>
                                    </div>
                                </div>

                                {/* Cuerpo del chat */}
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
                                    {/* Mensaje simulado del cliente */}
                                    <div className="bg-white p-2 rounded-lg rounded-tl-none self-start max-w-[85%] shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-800">Hola, quisiera saber el precio de los servicios.</p>
                                        <p className="text-[9px] text-gray-400 text-right mt-1">10:42 AM</p>
                                    </div>

                                    {/* Mensaje del Bot (Reactivo) */}
                                    {mensajePrevia ? (
                                        <div className="bg-[#dcf8c6] p-2 rounded-lg rounded-tr-none self-end max-w-[85%] shadow-sm border border-green-200">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{mensajePrevia}</p>
                                            <p className="text-[9px] text-gray-500 text-right mt-1">10:42 AM</p>
                                        </div>
                                    ) : (
                                        <div className="self-end text-xs text-gray-400 italic bg-white/50 px-2 py-1 rounded">Escribe un mensaje para previsualizar...</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Flujos;