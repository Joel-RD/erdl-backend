import { AppError } from '../../../src/utils/AppError';

describe('AppError', () => {
    it('should set statusCode, message and name', () => {
        const error = new AppError(404, 'No encontrado');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('No encontrado');
        expect(error.name).toBe('AppError');
    });

    it('should store optional details', () => {
        const details = ['campo inválido'];
        const error = new AppError(400, 'Datos inválidos', details);

        expect(error.details).toEqual(details);
    });

    it('should leave details undefined when not provided', () => {
        const error = new AppError(500, 'Error interno');

        expect(error.details).toBeUndefined();
    });

    it('should be throwable and catchable as Error', () => {
        expect(() => {
            throw new AppError(429, 'Demasiadas peticiones');
        }).toThrow('Demasiadas peticiones');
    });
});