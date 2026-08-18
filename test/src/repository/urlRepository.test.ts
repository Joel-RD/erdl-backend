import { jest } from '@jest/globals';
import { Client } from '@libsql/client';

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

type UrlRepositoryModule = typeof import('../../../src/repository/urlRepository.js');
type LoggerModule = typeof import('../../../src/utils/logger.js');

let UrlRepository: UrlRepositoryModule['UrlRepository'];
let mockedLogger: { error: jest.Mock; info: jest.Mock; warn: jest.Mock };

beforeAll(async () => {
    ({ UrlRepository } = await import('../../../src/repository/urlRepository.js'));
    mockedLogger = (await import('../../../src/utils/logger.js')).default as unknown as { error: jest.Mock; info: jest.Mock; warn: jest.Mock };
});

describe('UrlRepository (URL Shortener)', () => {
    let repository: InstanceType<UrlRepositoryModule['UrlRepository']>;
    let mockExecute: jest.Mock;
    let mockClient: Client;

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecute = jest.fn();
        mockClient = {
            execute: mockExecute
        } as unknown as Client;
        repository = new UrlRepository(mockClient);
    });

    describe('findById (find original url by short code)', () => {
        it('should return original url if found', async () => {
            const mockRow = { original_url: 'http://google.com' };
            mockExecute.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findById('short123');
            expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining('SELECT original_url FROM urls'),
                args: ['short123']
            }));
            expect(result).toBe('http://google.com');
        });

        it('should return null if not found', async () => {
            mockExecute.mockResolvedValue({ rows: [] });

            const result = await repository.findById('notfound');
            expect(result).toBeNull();
        });

        it('should return null if rows property is undefined', async () => {
            mockExecute.mockResolvedValue({});

            const result = await repository.findById('notfound');
            expect(result).toBeNull();
        });

        it('should throw on database error', async () => {
            mockExecute.mockRejectedValue(new Error('DB Error'));

            await expect(repository.findById('short123')).rejects.toThrow('Error buscando la URL en el repositorio');
            expect(mockedLogger.error).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return short_url on success and pass args in the right order', async () => {
            mockExecute.mockResolvedValue({ rows: [] });

            const result = await repository.create('short123', 'http://google.com');

            expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining('INSERT INTO urls'),
                args: ['http://google.com', 'short123']
            }));
            expect(result).toBe('short123');
        });

        it('should throw on failure', async () => {
            mockExecute.mockRejectedValue(new Error('DB Error'));

            await expect(repository.create('short123', 'http://google.com')).rejects.toThrow('Error creando la URL');
            expect(mockedLogger.error).toHaveBeenCalled();
        });
    });
});