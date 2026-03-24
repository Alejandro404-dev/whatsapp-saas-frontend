import { LoginForm } from "../features/auth/components/login/LoginForm";

const Login = () => {
    return (
        // Un contenedor de pantalla completa con un fondo gris suave
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md">
                {/* Aquí podrías poner el logo de la empresa en el futuro */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-600">WhatsApp SaaS</h1>
                    <p className="text-gray-500 mt-2">Gestión de automatización B2B</p>
                </div>

                {/* Renderizamos el componente de lógica que ya creamos */}
                <LoginForm />

                <p className="text-center text-sm text-gray-500 mt-6">
                    ¿No tienes una cuenta? {' '}
                    <a href="/register" className="text-blue-600 font-semibold hover:underline">
                        Registrate
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;