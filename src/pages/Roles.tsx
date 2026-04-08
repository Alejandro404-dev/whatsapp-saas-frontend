import { useState } from 'react';
import { Plus, Shield, Edit2, Trash2, X, CheckSquare, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Esquema de validacion
const rolSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    permisos: z.array(z.string()).min(1, "Debes seleccionar al menos un permiso"),
});

type RolValues = z.infer<typeof rolSchema>;

// Diccionario de permisos disponibles en el sistema
const PERMISOS_SISTEMA = [
    { id: 'ver_dashboard', nombre: 'Ver Panel Principal', desc: 'Acceso a metricas y graficos' },
    { id: 'gestionar_campanas', nombre: 'Gestionar Campañas', desc: 'Crear, ver y lanzar envios masivos' },
    { id: 'gestionar_flujos', nombre: 'Gestionar Flujos', desc: 'Crear y editar chatbots automatizados' },
    { id: 'gestionar_usuarios', nombre: 'Gestionar Usuarios', desc: 'Crear y eliminar empleados del sistema' },
    { id: 'configurar_canal_meta', nombre: 'Configuracion de Canal', desc: 'Modificar tokens y conexion con WhatsApp' },
];

const Roles = () => {
    // Estado inicial. Nota la propiedad 'protegido' en el rol de Administrador
    const [roles, setRoles] = useState([
        { id: 1, nombre: "Administrador", permisos: ["ver_dashboard", "gestionar_campanas", "gestionar_flujos", "gestionar_usuarios", "configurar_canal_meta"], usuariosActivos: 2, protegido: true },
        { id: 2, nombre: "Operador de Ventas", permisos: ["ver_dashboard", "gestionar_campanas"], usuariosActivos: 5, protegido: false },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rolEnEdicion, setRolEnEdicion] = useState<number | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RolValues>({
        resolver: zodResolver(rolSchema),
        defaultValues: {
            permisos: []
        }
    });

    const abrirModalNuevo = () => {
        setRolEnEdicion(null);
        reset({ nombre: '', permisos: [] });
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (rol: typeof roles[0]) => {
        if (rol.protegido) {
            toast.error("Los roles del sistema no pueden ser editados");
            return;
        }
        setRolEnEdicion(rol.id);
        setValue('nombre', rol.nombre);
        setValue('permisos', rol.permisos);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = (data: RolValues) => {
        if (rolEnEdicion) {
            // Logica de actualizacion
            setRoles(roles.map(r => r.id === rolEnEdicion ? { ...r, nombre: data.nombre, permisos: data.permisos } : r));
            toast.success("Rol actualizado correctamente");
        } else {
            // Logica de creacion (los nuevos roles NUNCA son protegidos)
            const nuevoRol = {
                id: roles.length + 1,
                nombre: data.nombre,
                permisos: data.permisos,
                usuariosActivos: 0,
                protegido: false 
            };
            setRoles([nuevoRol, ...roles]);
            toast.success("Nuevo rol creado");
        }
        cerrarModal();
    };

    const eliminarRol = (id: number, usuariosActivos: number, protegido: boolean) => {
        if (protegido) {
            toast.error("No puedes eliminar un rol nativo del sistema");
            return;
        }
        if (usuariosActivos > 0) {
            toast.error("No puedes eliminar un rol que tiene usuarios asignados");
            return;
        }
        if (confirm("¿Estas seguro de eliminar este rol?")) {
            setRoles(roles.filter(r => r.id !== id));
            toast.success("Rol eliminado");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Roles y Permisos</h2>
                    <p className="text-gray-500">Crea niveles de acceso personalizados para tu equipo</p>
                </div>
                <button 
                    onClick={abrirModalNuevo}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nuevo Rol
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre del Rol</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Permisos Asignados</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Usuarios Activos</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {roles.map((rol) => (
                            <tr key={rol.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                                            {/* Si es protegido muestra un candado, si no, un escudo */}
                                            {rol.protegido ? <Lock size={16} className="text-slate-400" /> : <Shield size={16} />}
                                        </div>
                                        <span className={`font-bold ${rol.protegido ? 'text-slate-500' : 'text-gray-700'}`}>
                                            {rol.nombre}
                                            {rol.protegido && <span className="ml-2 text-xs font-normal bg-slate-100 px-2 py-0.5 rounded text-slate-500">Sistema</span>}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${rol.protegido ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {rol.permisos.length === PERMISOS_SISTEMA.length ? 'Acceso Total' : `${rol.permisos.length} accesos concedidos`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-600 font-medium">{rol.usuariosActivos} miembros</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Boton Editar */}
                                        <button 
                                            onClick={() => abrirModalEdicion(rol)}
                                            className={`p-2 transition-colors ${rol.protegido ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                                            title={rol.protegido ? "Rol protegido del sistema" : "Editar Rol"}
                                            disabled={rol.protegido}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {/* Boton Eliminar */}
                                        <button 
                                            onClick={() => eliminarRol(rol.id, rol.usuariosActivos, rol.protegido ?? false)}
                                            className={`p-2 transition-colors ${rol.protegido || rol.usuariosActivos > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                                            title={rol.protegido ? "Rol protegido del sistema" : "Eliminar Rol"}
                                            disabled={rol.protegido}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CREACION/EDICION */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-gray-800">
                                {rolEnEdicion ? 'Editar Rol' : 'Crear Nuevo Rol'}
                            </h3>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Rol</label>
                                    <input 
                                        {...register("nombre")} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                        placeholder="Ej: Analista de Marketing" 
                                    />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckSquare size={18} className="text-blue-600" />
                                        <label className="block text-sm font-bold text-gray-700">Permisos del Sistema</label>
                                    </div>
                                    
                                    <div className="space-y-2 border border-gray-100 rounded-lg p-1 bg-gray-50">
                                        {PERMISOS_SISTEMA.map((permiso) => (
                                            <label 
                                                key={permiso.id} 
                                                className="flex items-start gap-3 p-3 rounded hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-sm"
                                            >
                                                <div className="pt-0.5">
                                                    <input 
                                                        type="checkbox" 
                                                        value={permiso.id}
                                                        {...register("permisos")}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{permiso.nombre}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{permiso.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.permisos && <p className="text-red-500 text-xs mt-2">{errors.permisos.message}</p>}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
                                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors font-medium">
                                    Guardar Rol
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;