import { RegisterForm } from '../features/auth/components/register/RegisterForm';

const Register = () => {
    return (
        // Fondo gris suave que ocupa toda la pantalla
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-md">
                
                {/* Cabecera de la página */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-600">WhatsApp SaaS</h1>
                    <p className="text-gray-500 mt-2">Registro de nueva organización (Tenant)</p>
                </div>

                {/* Aquí inyectamos todo nuestro formulario robusto con Zod */}
                <RegisterForm />

                {/* Enlace para volver al login si el usuario se equivocó */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    ¿Ya tienes una cuenta registrada? {' '}
                    <a href="/login" className="text-blue-600 font-semibold hover:underline">
                        Inicia sesión aquí
                    </a>
                </p>
                
            </div>
        </div>
    );
};

export default Register;