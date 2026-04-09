import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerInNodeBackend } from '../../../../api/authService';
import { useAuthStore } from '../../store/useAuthStore';
import './RegisterForm.css';

// 1. El contrato: Zod valida que las contraseñas sean idénticas
const registerSchema = z.object({
    companyName: z.string().min(3, "El nombre de la empresa debe tener al menos 3 letras"),
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // El error se mostrará en el campo de confirmar
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login); // Usamos la misma función login de Zustand para iniciar sesión tras el registro

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setServerError(null);
        try {
            // 1. Mandamos los datos a Node
            const respuesta = await registerInNodeBackend({
                companyName: data.companyName,
                email: data.email,
                password: data.password
            });

            // 2. Pasamos el usuario DIRECTO del backend al Store
            login(respuesta.usuario, respuesta.token);

            // 3. Mostramos éxito y redirigimos
            alert(`¡Empresa registrada con éxito! Tu rol es: ${respuesta.usuario.role}`);
            navigate('/dashboard');

        } catch (error) {
            // Usamos 'error' imprimiéndolo en consola para que TS no se queje
            console.error(error);
            setServerError("Ocurrió un error al intentar crear la cuenta.");
        }
    };

    return (
        <div className="register-container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>Crear Cuenta de Empresa</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label className="form-label">Nombre de la Empresa</label>
                    <input
                        {...register("companyName")}
                        className="form-input"
                        placeholder="Ej: Tech Solutions B2B"
                    />
                    {errors.companyName && <p className="error-msg">{errors.companyName.message}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Correo Administrativo</label>
                    <input
                        {...register("email")}
                        className="form-input"
                        placeholder="admin@tuempresa.com"
                    />
                    {errors.email && <p className="error-msg">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input
                        type="password"
                        {...register("password")}
                        className="form-input"
                        placeholder="Mínimo 6 caracteres"
                    />
                    {errors.password && <p className="error-msg">{errors.password.message}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                        type="password"
                        {...register("confirmPassword")}
                        className="form-input"
                        placeholder="Repite tu contraseña"
                    />
                    {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
                </div>

                {serverError && <div className="error-msg" style={{ padding: '0.5rem', backgroundColor: '#fee2e2' }}>{serverError}</div>}

                <button type="submit" disabled={isSubmitting} className="btn-submit">
                    {isSubmitting ? 'Creando Tenant...' : 'Registrar Empresa'}
                </button>
            </form>
        </div>
    );
};