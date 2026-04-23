import type { LoginCredentials, LoginResponse, RegisterData } from '../types/auth.types';
import apiClient from './apiClient';

export const loginToNodeBackend = async (data: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const dataReal = await response.json();

    if (!response.ok) {
        throw { existe: false, mensaje: dataReal.error };
    }

    return dataReal;
};

export const registerInNodeBackend = async (data: RegisterData): Promise<LoginResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Error en el servidor");
    }

    const dataReal = await response.json();
    return dataReal;
};


export const cambiarPasswordObligatorio = async (userId: string, newPassword: string) => {
    // Usamos apiClient para que la ruta sea perfecta: http://localhost:3000/api/auth/change-password
    const response = await apiClient.patch('/api/auth/change-password', {
        userId,
        newPassword
    });
    return response.data; // Devuelve { mensaje, usuario }
};