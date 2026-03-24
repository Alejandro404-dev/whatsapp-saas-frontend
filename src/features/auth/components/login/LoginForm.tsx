import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// Importamos la función y el tipo de error que acabamos de crear
import { loginToNodeBackend, type LoginError } from '../../../../api/authService';
import './LoginForm.css';

const loginSchema = z.object({
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setAuthError(null);
        try {
            // TypeScript ahora sabe automáticamente que "respuesta" es de tipo LoginResponse
            const respuesta = await loginToNodeBackend(data);
            
            console.log("Respuesta del Backend:", respuesta);
            alert(`¡Bienvenido! Rol: ${respuesta.usuario.rol}`);
            
            navigate('/dashboard');

        } catch (err: unknown) {
            // Le decimos a TypeScript: "Confía en mí, este error tiene la forma de LoginError"
            const errorBackend = err as LoginError;
            
            // Usamos el mensaje que viene del backend, o un texto por defecto por seguridad
            setAuthError(errorBackend.mensaje || "Error de conexión con el servidor");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label className="form-label">Correo</label>
                    <input 
                        {...register("email")} 
                        className="form-input" 
                        placeholder="admin@empresa.com"
                    />
                    {errors.email && <p className="error-msg">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        {...register("password")} 
                        className="form-input" 
                        placeholder="123456"
                    />
                    {errors.password && <p className="error-msg">{errors.password.message}</p>}
                </div>

                {authError && <div className="server-error">{authError}</div>}

                <button type="submit" disabled={isSubmitting} className="btn-submit">
                    {isSubmitting ? 'Conectando con Node...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
};