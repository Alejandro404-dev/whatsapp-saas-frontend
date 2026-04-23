import apiClient from './apiClient';
import type { Role } from '../types/role.types';

export const obtenerRoles = async (tenantId: string): Promise<Role[]> => {
    const response = await apiClient.get(`/api/roles/${tenantId}`);
    return response.data;
};

export const crearRol = async (datos: { nombre: string, permisos: string[], tenantId: string }) => {
    const response = await apiClient.post('/api/roles', datos);
    return response.data;
};

export const editarRol = async (id: string, datos: { nombre: string, permisos: string[] }) => {
    const response = await apiClient.put(`/api/roles/${id}`, datos);
    return response.data;
};

export const eliminarRol = async (id: string) => {
    const response = await apiClient.delete(`/api/roles/${id}`);
    return response.data;
};