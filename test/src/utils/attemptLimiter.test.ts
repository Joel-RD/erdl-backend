import { MAX_ATTEMPTS, BLOCK_DURATION_HOURS, AttemptScope } from '../../../src/utils/attemptLimiter';

describe('attemptLimiter constants', () => {
    it('should define MAX_ATTEMPTS as 5', () => {
        expect(MAX_ATTEMPTS).toBe(5);
    });

    it('should define a block duration for each scope', () => {
        expect(BLOCK_DURATION_HOURS).toEqual({
            email: 2,
            password: 2,
            code: 1
        });
    });

    it('should export valid AttemptScope keys matching block durations', () => {
        const scopes: AttemptScope[] = ['email', 'password', 'code'];
        for (const scope of scopes) {
            expect(BLOCK_DURATION_HOURS[scope]).toBeGreaterThan(0);
        }
    });
});