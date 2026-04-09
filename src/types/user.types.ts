export interface UserData {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

// Molde de lo que necesita nuestra tabla para pintar la interfaz
export interface TableUser {
    id: string;
    nombre: string;
    email: string;
    rolNombre: string;
    fechaUnion: string;
}