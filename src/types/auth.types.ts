export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    existe: boolean;
    usuario: {
        id: string;
        email: string;
        role: string;         
        accesos: string[];    
        tenantId: string;
        nombreEmpresa: string;
        requirePasswordChange: boolean;
    };
    token: string;
}

export interface LoginError {
    existe: boolean;
    mensaje: string;
}

export interface RegisterData {
    companyName: string;
    email: string;
    password: string;
}