import { useEffect, useState } from 'react';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { User, Trash2, Edit3, UserPlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface UserData {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

// Hacemos la contraseña opcional permitiendo un string vacío (.or(z.literal('')))
const userSchema = z.object({
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres").or(z.literal('')),
    roleName: z.enum(["Admin", "Agente"])
});

type UserValues = z.infer<typeof userSchema>;

const UserManagement = () => {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<UserData[]>([]);

    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // NUEVO: Estado para saber si estamos editando a alguien
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserValues>({
        resolver: zodResolver(userSchema),
        defaultValues: { roleName: 'Agente', password: '' }
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/users/${user?.tenantId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Error cargando usuarios", error);
            }
        };
        if (user?.tenantId) fetchUsers();
    }, [user?.tenantId]);

    // Función unificada: Sirve para CREAR y para EDITAR
    const onSubmit = async (data: UserValues) => {
        setServerError(null);
        try {
            // Validación extra: Si es usuario nuevo, la contraseña es obligatoria
            if (!editingUser && data.password === '') {
                setServerError("La contraseña es obligatoria para usuarios nuevos");
                return;
            }

            // Si hay 'editingUser', mandamos a la ruta PUT con su ID. Si no, a la POST.
            const url = editingUser
                ? `http://localhost:3000/api/users/${editingUser.id}`
                : 'http://localhost:3000/api/users';

            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    roleName: data.roleName,
                    tenantId: user?.tenantId
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            if (editingUser) {
                // Si editamos, actualizamos esa fila específica en la tabla
                setUsers(users.map(u => u.id === editingUser.id ? result : u));
            } else {
                // Si creamos, lo añadimos al final
                setUsers([...users, result]);
            }

            closeModal();

        } catch (err: unknown) {
            const errorFormateado = err as Error;
            setServerError(errorFormateado.message || "Error de conexión");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
        if (!confirmacion) return;

        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert("Hubo un problema al intentar eliminar el usuario.");
            }
        } catch (error) {
            console.error("Error de conexión", error);
        }
    };

    // NUEVO: Función para abrir el modal listo para editar
    const openEditModal = (u: UserData) => {
        setEditingUser(u);
        // Pre-llenamos el formulario con los datos actuales
        reset({ email: u.email, roleName: u.role as "Admin" | "Agente", password: '' });
        setIsModalOpen(true);
    };

    // Función limpia para cerrar el modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset({ email: '', roleName: 'Agente', password: '' });
        setServerError(null);
    };

    return (
        <div className="p-8 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <p className="text-gray-500">Administra los accesos de tu organización</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); reset({ email: '', roleName: 'Agente', password: '' }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <UserPlus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rol</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha Registro</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{u.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'Admin' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* EL LÁPIZ: Siempre visible. 
                                        Puedes editar a los Agentes, puedes editar a otros Admins (para degradarlos) 
                                        y puedes editarte a ti mismo (para cambiar tu clave). */}
                                        <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <Edit3 size={18} />
                                        </button>

                                        {/* LA BASURA: Visible para todos EXCEPTO para ti mismo. 
                                        Puedes despedir a Agentes y a otros Admins, pero no puedes autodestruirte. */}
                                        {user?.id !== u.id && (
                                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            {/* EL TÍTULO CAMBIA DINÁMICAMENTE */}
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingUser ? 'Editar Miembro' : 'Agregar Miembro'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input {...register("email")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}
                                </label>
                                <input type="password" {...register("password")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder={editingUser ? 'Deja en blanco para no cambiar' : 'Mínimo 6 caracteres'} />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema</label>
                                <select {...register("roleName")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option value="Agente">Agente (Limitado)</option>
                                    <option value="Admin">Admin (Control Total)</option>
                                </select>
                                {errors.roleName && <p className="text-red-500 text-xs mt-1">{errors.roleName.message}</p>}
                            </div>

                            {serverError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{serverError}</div>}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                                    {/* EL BOTÓN CAMBIA DINÁMICAMENTE */}
                                    {isSubmitting ? 'Guardando...' : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
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