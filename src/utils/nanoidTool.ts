import { nanoid } from 'nanoid';

/**
 * Genera un ID corto usando nanoid.
 * Por defecto genera 8 caracteres para ser compatible con el sistema anterior.
 * 
 * @param size El tamaño del ID (default: 8)
 * @returns Un ID alfanumérico
 */
export const generateShortId = (size: number = 8): string => {
    return nanoid(size);
};
