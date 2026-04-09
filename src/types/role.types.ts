export interface Role {
    id: string;
    nombre: string;
    descripcion?: string;
    permisos: string[];
    usuariosActivos: number;
    protegido: boolean;
}