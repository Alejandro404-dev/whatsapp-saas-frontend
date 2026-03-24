import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginToNodeBackend, type LoginError } from '../../../../api/authService';
import { useAuthStore } from '../../store/useAuthStore';
import './LoginForm.css';

const loginSchema = z.object({
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setAuthError(null);
        try {
            // 1. Tocamos la puerta de Node y PostgreSQL
            const respuesta = await loginToNodeBackend(data);
            
            // 2. ¡EL PASO CRÍTICO QUE FALTABA! Adaptamos los datos para Zustand
            const usuarioAdaptado = {
                id: respuesta.usuario.id,
                email: respuesta.usuario.email,
                tenantId: respuesta.usuario.tenantId,
                role: respuesta.usuario.rol // Traducimos 'rol' a 'role' para que TypeScript no se queje
            };

            // 3. Le damos el "Pase VIP" a nuestra memoria global
            login(usuarioAdaptado, respuesta.token);
            
            // 4. Ahora sí, mostramos la alerta y entramos al Dashboard
            alert(`¡Bienvenido! Rol: ${respuesta.usuario.rol}`);
            navigate('/dashboard');

        } catch (err: unknown) {
            const errorBackend = err as LoginError;
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