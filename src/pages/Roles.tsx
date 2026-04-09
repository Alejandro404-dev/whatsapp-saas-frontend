import { useState, useEffect } from 'react';
import { Plus, Shield, Edit2, Trash2, X, Check, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { obtenerRoles, crearRol, editarRol, eliminarRol } from '../api/roleService';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import type { Role } from '../types/role.types';

const rolSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    // descripcion: z.string().optional(), // Podrías agregarlo si lo necesitas
});

type RolValues = z.infer<typeof rolSchema>;

const PERMISOS_DISPONIBLES = [
    { id: 'ver_dashboard', nombre: 'Ver Dashboard', modulo: 'General' },
    { id: 'gestionar_campanas', nombre: 'Gestionar Campañas', modulo: 'Marketing' },
    { id: 'configurar_bots', nombre: 'Configurar Chatbots', modulo: 'Automatización' },
    { id: 'gestionar_usuarios', nombre: 'Gestionar Equipo', modulo: 'Administración' },
    { id: 'configurar_sistema', nombre: 'Configuración Avanzada', modulo: 'Administración' },
];

const Roles = () => {
    const { user } = useAuthStore();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rolEnEdicion, setRolEnEdicion] = useState<string | null>(null);

    // Estado para los checkboxes
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RolValues>({
        resolver: zodResolver(rolSchema)
    });

    const esSuperAdmin = user?.role === 'SuperAdmin';

    useEffect(() => {
        const cargarRoles = async () => {
            if (!user?.tenantId) return;
            try {
                const data = await obtenerRoles(user.tenantId);
                setRoles(data);
            } catch (error) {
                console.error("Error al cargar roles:", error);
                toast.error("Error al cargar los roles");
            }
        };
        cargarRoles();
    }, [user?.tenantId]);

    const abrirModalNuevo = () => {
        setRolEnEdicion(null);
        reset({ nombre: '' });
        setPermisosSeleccionados([]);
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (rol: Role) => {
        setRolEnEdicion(rol.id);
        setValue('nombre', rol.nombre);
        setPermisosSeleccionados(rol.permisos);
        setIsModalOpen(true);
    };

    const togglePermiso = (idPermiso: string) => {
        setPermisosSeleccionados(prev =>
            prev.includes(idPermiso)
                ? prev.filter(p => p !== idPermiso)
                : [...prev, idPermiso]
        );
    };

    const onSubmit = async (data: RolValues) => {
        if (!user?.tenantId) return;

        try {
            toast.loading(rolEnEdicion ? "Actualizando..." : "Creando...", { id: "formRol" });

            if (rolEnEdicion) {
                await editarRol(rolEnEdicion, {
                    nombre: data.nombre,
                    permisos: permisosSeleccionados
                });

                // Actualizar estado local
                setRoles(roles.map(r => r.id === rolEnEdicion ? { ...r, nombre: data.nombre, permisos: permisosSeleccionados } : r));
                toast.success("Rol actualizado", { id: "formRol" });
            } else {
                const nuevo = await crearRol({
                    nombre: data.nombre,
                    permisos: permisosSeleccionados,
                    tenantId: user.tenantId
                });

                // Aseguramos que el nuevo rol se formatee correctamente para la UI
                const rolParaTabla: Role = {
                    id: nuevo.id,
                    nombre: nuevo.name, // Asegúrate de que backend devuelve name
                    permisos: nuevo.permissions || [], // Y permissions
                    usuariosActivos: 0,
                    protegido: false
                };

                setRoles([...roles, rolParaTabla]);
                toast.success("Rol creado", { id: "formRol" });
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el rol", { id: "formRol" });
        }
    };

    const handleDelete = async (rol: Role) => {
        if (rol.protegido) {
            toast.error("No puedes eliminar un rol del sistema.");
            return;
        }
        if (rol.usuariosActivos > 0) {
            toast.error("No puedes eliminar un rol con usuarios asignados.");
            return;
        }

        if (confirm(`¿Eliminar el rol ${rol.nombre}?`)) {
            try {
                toast.loading("Eliminando...", { id: "delRol" });
                await eliminarRol(rol.id);
                setRoles(roles.filter(r => r.id !== rol.id));
                toast.success("Rol eliminado", { id: "delRol" });
            } catch (error) {
                console.error("Error al eliminar rol:", error);
                toast.error("Error al eliminar", { id: "delRol" });
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Roles y Permisos</h2>
                    <p className="text-gray-500">Configura los niveles de acceso para tu equipo</p>
                </div>
                {/* Solo mostramos el botón si es SuperAdmin (o si quieres que los Admins también creen roles, puedes quitar esta condición) */}
                {esSuperAdmin && (
                    <button
                        onClick={abrirModalNuevo}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        Crear Rol
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(rol => (
                    <div key={rol.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${rol.protegido ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {rol.protegido ? <Lock size={24} /> : <Shield size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{rol.nombre}</h3>
                                    <p className="text-sm text-gray-500">{rol.usuariosActivos} usuarios</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Lógica de edición: SuperAdmin puede editar todo menos otros SuperAdmins (si hubiera). Un rol protegido no se edita salvo que sea SuperAdmin editando un rol base, pero por simplicidad de la regla: */}
                                <button
                                    onClick={() => abrirModalEdicion(rol)}
                                    className={`p-2 transition-colors ${rol.protegido && !esSuperAdmin ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                                    disabled={rol.protegido && !esSuperAdmin}
                                    title={rol.protegido && !esSuperAdmin ? "Solo el SuperAdmin puede editar este rol" : "Editar rol"}
                                >
                                    <Edit2 size={18} />
                                </button>

                                <button
                                    onClick={() => handleDelete(rol)}
                                    className={`p-2 transition-colors ${rol.protegido || rol.usuariosActivos > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                                    disabled={rol.protegido || rol.usuariosActivos > 0}
                                    title={rol.protegido ? "Rol protegido" : rol.usuariosActivos > 0 ? "Tiene usuarios" : "Eliminar rol"}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex-grow">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Permisos incluidos:</p>
                            <ul className="space-y-2">
                                {rol.permisos.includes('ALL') ? (
                                    <li className="flex items-center gap-2 text-sm text-purple-600 font-medium bg-purple-50 p-2 rounded">
                                        <Check size={16} /> Acceso Total al Sistema
                                    </li>
                                ) : rol.permisos.length > 0 ? (
                                    rol.permisos.map((p, index) => {
                                        const permInfo = PERMISOS_DISPONIBLES.find(pd => pd.id === p);
                                        return (
                                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <Check size={16} className="text-green-500" />
                                                {permInfo ? permInfo.nombre : p}
                                            </li>
                                        )
                                    })
                                ) : (
                                    <li className="text-sm text-gray-400 italic">Sin permisos específicos</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                {rolEnEdicion ? 'Editar Rol' : 'Crear Nuevo Rol'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-grow space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Rol</label>
                                <input
                                    {...register("nombre")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej: Editor de Marketing"
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4">Selecciona los Permisos</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PERMISOS_DISPONIBLES.map(permiso => (
                                        <div
                                            key={permiso.id}
                                            onClick={() => togglePermiso(permiso.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3
                                                ${permisosSeleccionados.includes(permiso.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200'}`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                                                ${permisosSeleccionados.includes(permiso.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                                {permisosSeleccionados.includes(permiso.id) && <Check size={14} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{permiso.nombre}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{permiso.modulo}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-all">
                                    {rolEnEdicion ? 'Guardar Cambios' : 'Crear Rol'}
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