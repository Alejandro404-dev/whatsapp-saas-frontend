import { useState } from 'react';
import { Smartphone, ShieldCheck, Key, Info, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Configuracion = () => {
    const [estaConectado, setEstaConectado] = useState(false);
    const [mostrarToken, setMostrarToken] = useState(false);

    const handleConectar = () => {
        // Simulamos que el sistema está validando el Token con Meta
        toast.loading('Verificando credenciales con Meta...', { duration: 1500 });

        setTimeout(() => {
            setEstaConectado(true);
            toast.success('¡Conexión exitosa con Meta Cloud API!');
        }, 1500);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Configuración del Canal</h2>
                <p className="text-gray-500 text-sm">Conecta tu cuenta oficial de WhatsApp Business a través de Meta Cloud API</p>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* ESTADO DE LA CONEXIÓN */}
                <div className={`p-6 rounded-xl border-2 flex items-center justify-between transition-all ${estaConectado ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${estaConectado ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Estado de WhatsApp</h3>
                            <p className={`text-sm ${estaConectado ? 'text-green-700' : 'text-gray-500'}`}>
                                {estaConectado ? 'Conectado y listo para enviar' : 'Pendiente de configuración'}
                            </p>
                        </div>
                    </div>
                    {estaConectado && <CheckCircle2 className="text-green-500" size={28} />}
                </div>

                {/* FORMULARIO DE API */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 text-blue-600">
                        <Key size={20} />
                        <h3 className="font-bold">Credenciales de Meta API</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Identificador de Teléfono</label>
                            <input
                                type="text"
                                placeholder="Ej: 109283746509182"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Token de Acceso Permanente</label>
                            <div className="relative">
                                <input
                                    type={mostrarToken ? "text" : "password"}
                                    placeholder="EAAlxP••••••••••••••••••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarToken(!mostrarToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {mostrarToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
                            <Info className="text-blue-500 shrink-0" size={18} />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Estos datos se obtienen en tu panel de **Meta for Developers**. Asegúrate de que el token tenga permisos para `whatsapp_business_messaging`.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleConectar}
                                className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2 shadow-lg"
                            >
                                <ShieldCheck size={20} />
                                Verificar y Guardar Conexión
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEGURIDAD */}
                <div className="flex items-center gap-2 text-gray-400 justify-center">
                    <AlertCircle size={14} />
                    <span className="text-xs uppercase tracking-widest font-bold">Cifrado de extremo a extremo activo</span>
                </div>
            </div>
        </div>
    );
};

export default Configuracion;