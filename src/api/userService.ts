import type { UserData } from '../types/user.types';
import apiClient from './apiClient';

export const obtenerUsuarios = async (tenantId: string) => {
    const response = await apiClient.get(`/api/users/${tenantId}`);
    return response.data;
};

export const crearUsuario = async (datos: { email: string, password: string, roleName: string, tenantId: string }) => {
    const response = await apiClient.post('/api/users', datos);
    return response.data;
};

export const eliminarUsuario = async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
};

export const editarUsuario = async (id: string, datos: { email: string, password?: string, roleName: string }) => {
    const response = await apiClient.put(`/api/users/${id}`, datos);
    return response.data;
};

export const cambiarEstadoUsuario = async (id: string): Promise<UserData> => {
    const response = await apiClient.patch<UserData>(`/api/users/${id}/toggle-status`);
    return response.data;
};