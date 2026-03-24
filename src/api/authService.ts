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
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (data.email === "admin@empresa.com" && data.password === "123456") {
                resolve({
                    existe: true,
                    usuario: {
                        id: "usr_001",
                        email: data.email,
                        rol: "Súper Administrador", 
                        accesos: ["dashboard", "flujos", "campañas"],
                        tenantId: "tenant_001"
                    },
                    token: "fake-jwt-node-token"
                });
            } else {
                reject({
                    existe: false,
                    mensaje: "El correo o contraseña está mal, verificar los datos ingresados"
                });
            }
        }, 1000); 
    });
};

export const registerInNodeBackend = async (data: RegisterData): Promise<LoginResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulamos que Node creó el Tenant en PostgreSQL y nos devuelve los datos
            // Generamos un tenantId falso basado en el nombre de la empresa
            const newTenantId = data.companyName.toLowerCase().replace(/\s+/g, '_') + "_001";
            
            resolve({
                existe: true,
                usuario: {
                    id: "usr_999",
                    email: data.email,
                    rol: "Súper Administrador", // El que registra la empresa es el dueño/admin [cite: 31]
                    accesos: ["dashboard", "flujos", "campañas", "configuracion"],
                    tenantId: newTenantId
                },
                token: "fake-jwt-register-token" // Token de Meta/Sistema simulado [cite: 28, 46]
            });
        }, 1000); 
    });
};