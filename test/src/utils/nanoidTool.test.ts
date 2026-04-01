import { generateShortId } from '../../../src/utils/nanoidTool';

describe('nanoidTool', () => {
    describe('generateShortId', () => {
        it('debe devolver un string', () => {
            const id = generateShortId();
            expect(typeof id).toBe('string');
        });

        it('debe tener una longitud de 8 caracteres por defecto', () => {
            const id = generateShortId();
            expect(id.length).toBe(8);
        });

        it('debe permitir especificar una longitud personalizada', () => {
            const length = 12;
            const id = generateShortId(length);
            expect(id.length).toBe(length);
        });

        it('debe generar IDs únicos en múltiples llamadas', () => {
            const ids = new Set();
            const iterations = 1000;
            
            for (let i = 0; i < iterations; i++) {
                ids.add(generateShortId());
            }
            
            expect(ids.size).toBe(iterations);
        });

        it('debe contener solo caracteres alfanuméricos válidos (nanoid)', () => {
            const id = generateShortId(100);
            // El set por defecto de nanoid incluye A-Z, a-z, 0-9, -, _
            const nanoidRegex = /^[A-Za-z0-9_-]+$/;
            expect(nanoidRegex.test(id)).toBe(true);
        });

        it('no debe fallar en una carga moderada (stress test ligero)', () => {
            const generateMany = () => {
                for (let i = 0; i < 5000; i++) {
                    generateShortId();
                }
            };
            expect(generateMany).not.toThrow();
        });

        it('debe manejar correctamente el parámetro de tamaño cero entregando un string vacío', () => {
            // Dependiendo de la implementación de nanoid, esto podría ser un string vacío o un error.
            // nanoid(0) suele devolver "".
            const id = generateShortId(0);
            expect(id).toBe("");
        });
    }); 
});
   