import { useState } from 'react';
import { Plus, Users, Edit2, Trash2, X, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Esquema de validacion para el usuario
const usuarioSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email invalido"),
    rolId: z.string().min(1, "Debes asignar un rol"),
});

type UsuarioValues = z.infer<typeof usuarioSchema>;

// Lista de roles (En el futuro esto vendra de la base de datos o estado global)
const ROLES_DISPONIBLES = [
    { id: '1', nombre: 'Administrador', descripcion: 'Acceso total a la empresa' },
    { id: '2', nombre: 'Operador de Ventas', descripcion: 'Solo envios y dashboard' },
    { id: '3', nombre: 'Soporte Tecnico', descripcion: 'Configuracion de canal' },
    { id: '4', nombre: 'Invitado', descripcion: 'Solo lectura' },
];

const UserManagement = () => {
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: "Juan Perez", email: "juan@empresa.com", rolId: '1', fechaUnion: "01/04/2026" },
        { id: 2, nombre: "Maria Gomez", email: "maria@empresa.com", rolId: '2', fechaUnion: "05/04/2026" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioValues>({
        resolver: zodResolver(usuarioSchema)
    });

    // Funcion para obtener el nombre del rol segun el ID
    const getNombreRol = (id: string) => {
        return ROLES_DISPONIBLES.find(r => r.id === id)?.nombre || 'Sin Rol';
    };

    const onSubmit = (data: UsuarioValues) => {
        const nuevoUsuario = {
            id: usuarios.length + 1,
            nombre: data.nombre,
            email: data.email,
            rolId: data.rolId,
            fechaUnion: new Date().toLocaleDateString()
        };

        setUsuarios([nuevoUsuario, ...usuarios]);
        setIsModalOpen(false);
        reset();
        toast.success(`Usuario ${data.nombre} invitado correctamente`);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Equipo</h2>
                    <p className="text-gray-500">Administra los accesos de tus colaboradores</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Invitar Miembro
                </button>
            </div>

            {/* TABLA DE USUARIOS */}
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
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                            {u.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700">{u.nombre}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max
                                        ${u.rolId === '1' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                        <ShieldCheck size={12} />
                                        {getNombreRol(u.rolId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {u.fechaUnion}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 text-gray-400">
                                        <button className="hover:text-blue-600"><Edit2 size={18} /></button>
                                        <button className="hover:text-red-600"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE INVITACION */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Invitar Nuevo Miembro</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input {...register("nombre")} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Juan Perez" />
                                </div>
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input {...register("email")} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@empresa.com" />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Asignar Rol de Acceso</label>
                                <select 
                                    {...register("rolId")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                                >
                                    <option value="">Selecciona un rol...</option>
                                    {ROLES_DISPONIBLES.map(rol => (
                                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                    ))}
                                </select>
                                {errors.rolId && <p className="text-red-500 text-xs mt-1">{errors.rolId.message}</p>}
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg flex gap-3 border border-amber-100">
                                <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                                <p className="text-xs text-amber-800">
                                    Al invitar a este miembro, tendrá acceso inmediato a las funciones definidas por su rol. Asegúrate de revisar sus permisos.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-all">Enviar Invitación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;