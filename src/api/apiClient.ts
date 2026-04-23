import axios from "axios";

const apiClient = axios.create({
    // Fijamos la base EXACTA para que Axios nunca se confunda y borre partes de la URL
    baseURL: 'http://localhost:3000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;