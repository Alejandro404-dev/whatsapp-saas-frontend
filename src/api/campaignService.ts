import apiClient from './apiClient';

export const obtenerCampanas = async (tenantId: string) => {
    const response = await apiClient.get(`/api/campaigns/${tenantId}`);
    return response.data;
};

export const crearCampana = async (datos: { 
    name: string; 
    message: string; 
    startDate: string; 
    endDate: string; 
    tenantId: string;
    totalContacts: number; // Mandamos la cantidad solo como dato informativo por ahora
}) => {
    const response = await apiClient.post('/api/campaigns', datos);
    return response.data;
};