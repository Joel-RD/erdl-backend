import { jest } from '@jest/globals';
import { AuthRepository } from '../../../src/repository/userAuthRepository';
import { Client } from '@libsql/client';

describe('AuthRepository', () => {
    let repository: AuthRepository;
    let mockExecute: jest.Mock;
    let mockClient: Client;

    beforeEach(() => {
        mockExecute = jest.fn();
        mockClient = {
            execute: mockExecute
        } as unknown as Client;
        repository = new AuthRepository(mockClient);
    });

    describe('findByEmail', () => {
        it('should return user if found', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            mockExecute.mockResolvedValue({ rows: [mockUser] });

            const result = await repository.findByEmail('test@example.com');
            expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining('SELECT * FROM users'),
                args: ['test@example.com']
            }));
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            mockExecute.mockResolvedValue({ rows: [] });

            const result = await repository.findByEmail('notfound@example.com');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should return true on successful creation', async () => {
            mockExecute.mockResolvedValue({ rows: [] }); // Insert usually returns empty rows but succeeds
            const newUser = { username: 'test', email: 'test@test.com', passwordHash: 'hash' };

            const result = await repository.create(newUser);
            expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
                sql: expect.stringContaining('INSERT INTO users'),
                args: ['test', 'test@test.com', 'hash']
            }));
            expect(result).toBe(true);
        });

        it('should return false if creation fails', async () => {
            const error = new Error('DB Error');
            mockExecute.mockRejectedValue(error);

            console.log('Testing creation failure...');
            const result = await repository.create({} as any);
            console.log('Creation failure result:', result);

            expect(result).toBe(false);
        });
    });
});
