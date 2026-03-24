// src/api/authService.ts

// 1. Definimos qué recibe la función
export interface LoginCredentials {
    email: string;
    password: string;
}

// 2. Definimos qué devuelve el backend al tener éxito
export interface LoginResponse {
    existe: boolean;
    usuario: {
        id: string;
        email: string;
        rol: string;
        accesos: string[];
        tenantId: string;
    };
    token: string;
}

// 3. Definimos qué devuelve el backend si hay error
export interface LoginError {
    existe: boolean;
    mensaje: string;
}

export interface RegisterData {
    companyName: string;
    email: string;
    password: string;
}

export const loginToNodeBackend = async (data: LoginCredentials): Promise<LoginResponse> => {
    // 1. Tocamos la puerta del backend real
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const dataReal = await response.json();

    // 2. Si el backend nos mandó un error (ej. status 401)
    if (!response.ok) {
        // Lanzamos el error con el formato que nuestro LoginForm espera
        throw { existe: false, mensaje: dataReal.error };
    }

    // 3. Si fue exitoso, devolvemos los datos al LoginForm
    return dataReal;
};

export const registerInNodeBackend = async (data: RegisterData): Promise<LoginResponse> => {
    // ¡Hacemos una petición HTTP real a nuestro backend de Node en el puerto 3000!
    const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Error en el servidor");
    }

    const dataReal = await response.json();
    return dataReal;
};