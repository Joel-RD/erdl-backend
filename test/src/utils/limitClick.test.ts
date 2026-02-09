import { redirectShort, url_Short, limitAuthButton } from '../../../src/utils/limitClick';

describe('Rate Limit Utils', () => {
    it('should export middleware functions', () => {
        expect(typeof redirectShort).toBe('function');
        expect(typeof url_Short).toBe('function');
        expect(typeof limitAuthButton).toBe('function');
    });
});
