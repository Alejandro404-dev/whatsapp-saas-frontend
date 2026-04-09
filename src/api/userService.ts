import apiClient from './apiClient';

// Obtener todos los usuarios de una empresa
export const obtenerUsuarios = async (tenantId: string) => {
    const response = await apiClient.get(`/users/${tenantId}`);
    return response.data;
};

// Crear un nuevo empleado
export const crearUsuario = async (datos: { email: string, password: string, roleName: string, tenantId: string }) => {
    const response = await apiClient.post('/users', datos);
    return response.data;
};

// Eliminar un empleado
export const eliminarUsuario = async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
};


// Editar un empleado
export const editarUsuario = async (id: string, datos: { email: string, password?: string, roleName: string }) => {
    const response = await apiClient.put(`/users/${id}`, datos);
    return response.data;
};