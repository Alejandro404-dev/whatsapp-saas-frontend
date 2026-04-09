import { useState, useEffect } from 'react';
import { Plus, Users, Edit2, Trash2, X, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { obtenerUsuarios, crearUsuario, eliminarUsuario, editarUsuario } from '../api/userService';
import { obtenerRoles } from '../api/roleService';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import type { UserData, TableUser } from '../types/user.types';
import type { Role } from '../types/role.types';

const usuarioSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email invalido"),
    rolNombre: z.string().min(1, "Debes asignar un rol"),
});

type UsuarioValues = z.infer<typeof usuarioSchema>;

const UserManagement = () => {
    const { user } = useAuthStore();
    const [usuarios, setUsuarios] = useState<TableUser[]>([]);
    const [rolesDisponibles, setRolesDisponibles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue} = useForm<UsuarioValues>({
        resolver: zodResolver(usuarioSchema)
    });

    useEffect(() => {
        const cargarDatos = async () => {
            if (!user?.tenantId) return;
            try {
                const [datosUsuarios, datosRoles] = await Promise.all([
                    obtenerUsuarios(user.tenantId),
                    obtenerRoles(user.tenantId)
                ]);

                const mapeados = datosUsuarios.map((u: UserData) => ({
                    id: u.id,
                    nombre: u.email.split('@')[0],
                    email: u.email,
                    rolNombre: u.role,
                    fechaUnion: new Date(u.createdAt).toLocaleDateString()
                }));
                
                setUsuarios(mapeados);
                setRolesDisponibles(datosRoles);
            } catch (error) {
                console.error("Error al traer datos:", error);
                toast.error("Error al cargar la información");
            }
        };
        cargarDatos();
    }, [user?.tenantId]);

    const getColorEtiqueta = (rolNombre: string) => {
        const nombreStr = rolNombre.toLowerCase();
        if (nombreStr === 'superadmin') return 'bg-purple-100 text-purple-700';
        if (nombreStr === 'admin' || nombreStr === 'administrador') return 'bg-blue-100 text-blue-700';
        return 'bg-slate-100 text-slate-700'; 
    };

    const abrirModalNuevo = () => {
        setUsuarioEnEdicion(null);
        reset({ nombre: '', email: '', rolNombre: '' });
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (u: TableUser) => {
        setUsuarioEnEdicion(u.id);
        setValue('nombre', u.nombre);
        setValue('email', u.email);
        setValue('rolNombre', u.rolNombre);
        setIsModalOpen(true);
    };

    const onSubmit = async (data: UsuarioValues) => {
        if (!user?.tenantId) return;
        try {
            toast.loading(usuarioEnEdicion ? "Actualizando..." : "Guardando...", { id: "formUsuario" });

            if (usuarioEnEdicion) {
                const usuarioEditadoBD = await editarUsuario(usuarioEnEdicion, {
                    email: data.email,
                    roleName: data.rolNombre
                });

                setUsuarios(usuarios.map(u => u.id === usuarioEnEdicion ? { 
                    ...u, nombre: data.nombre, email: usuarioEditadoBD.email, rolNombre: usuarioEditadoBD.role 
                } : u));
                toast.success("Usuario actualizado", { id: "formUsuario" });
            } else {
                const nuevoEmpleadoBD = await crearUsuario({
                    email: data.email,
                    password: "Password123*", 
                    roleName: data.rolNombre,
                    tenantId: user.tenantId
                });

                const usuarioParaTabla = {
                    id: nuevoEmpleadoBD.id,
                    nombre: data.nombre,
                    email: nuevoEmpleadoBD.email,
                    rolNombre: nuevoEmpleadoBD.role,
                    fechaUnion: new Date(nuevoEmpleadoBD.createdAt).toLocaleDateString()
                };

                setUsuarios([usuarioParaTabla, ...usuarios]);
                toast.success("Usuario creado", { id: "formUsuario" });
            }
            setIsModalOpen(false);
            reset();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || "Error al procesar", { id: "formUsuario" });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este usuario del sistema?")) {
            try {
                toast.loading("Eliminando...", { id: "borrar" });
                await eliminarUsuario(id);
                setUsuarios(usuarios.filter(u => u.id !== id));
                toast.success("Usuario eliminado", { id: "borrar" });
            } catch (error) {
            console.error("Error al eliminar usuario:", error);
            toast.error("Error al eliminar", { id: "borrar" });
        }
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Equipo</h2>
                    <p className="text-gray-500">Administra los accesos de tus colaboradores</p>
                </div>
                <button onClick={abrirModalNuevo} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow-lg">
                    <Plus size={20} /> Invitar Miembro
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rol Asignado</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha de Alta</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {usuarios.map((u) => {
                            const esMiCuenta = u.email === user?.email;
                            return (
                                <tr key={u.id} className={`transition-colors ${esMiCuenta ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase ${esMiCuenta ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-700 capitalize flex items-center gap-2">
                                                    {u.nombre} {esMiCuenta && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">TÚ</span>}
                                                </p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${getColorEtiqueta(u.rolNombre)}`}>
                                            <ShieldCheck size={12} /> {u.rolNombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{u.fechaUnion}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => !esMiCuenta && abrirModalEdicion(u)} className={`p-2 transition-colors ${esMiCuenta ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`} disabled={esMiCuenta}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => !esMiCuenta && handleDelete(u.id)} className={`p-2 transition-colors ${esMiCuenta ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`} disabled={esMiCuenta}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{usuarioEnEdicion ? 'Editar Miembro' : 'Invitar Nuevo Miembro'}</h3>
                            <button onClick={() => { setIsModalOpen(false); reset(); }}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input {...register("nombre")} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input {...register("email")} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Asignar Rol de Acceso</label>
                                <select {...register("rolNombre")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer">
                                    <option value="">Selecciona un rol...</option>
                                    {rolesDisponibles.filter(r => r.nombre !== 'SuperAdmin').map(rol => (
                                        <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            {!usuarioEnEdicion && (
                                <div className="bg-amber-50 p-4 rounded-lg flex gap-3 border border-amber-100">
                                    <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-xs text-amber-800">Se le asignará la contraseña temporal: <strong>Password123*</strong></p>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); reset(); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black">
                                    {usuarioEnEdicion ? 'Actualizar Cambios' : 'Enviar Invitación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;