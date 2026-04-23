import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; 
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { cambiarPasswordObligatorio } from '../api/authService';

const passwordSchema = z.object({
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

const UpdatePassword = () => {
    const navigate = useNavigate();
    const { user, token, login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (data: PasswordValues) => {
        if (!user || !token) return;
        
        try {
            setIsLoading(true);
            toast.loading("Actualizando seguridad...", { id: "pwd" });

            // 1. Llamamos al backend para cambiar la clave y quitar el bloqueo
            const response = await cambiarPasswordObligatorio(user.id, data.newPassword);

            // 2. Sobrescribimos el usuario en Zustand con el nuevo (que ya trae requirePasswordChange: false)
            login(response.usuario, token);

            toast.success("¡Contraseña actualizada! Bienvenido.", { id: "pwd" });
            
            // 3. Lo mandamos al Dashboard triunfalmente
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error(error);
            toast.error("Hubo un problema al actualizar la contraseña.", { id: "pwd" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                    <ShieldCheck size={32} className="text-blue-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Seguridad Requerida</h2>
                <p className="text-slate-500 text-center text-sm mb-8">
                    Hola <strong>{user?.email}</strong>, por políticas de seguridad debes crear una contraseña propia para reemplazar la temporal.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                {...register("newPassword")} 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                {...register("confirmPassword")} 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Repite tu nueva contraseña"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 mt-4"
                    >
                        {isLoading ? 'Actualizando...' : 'Guardar y Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;