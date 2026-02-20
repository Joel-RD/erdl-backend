/**
 * Utility functions for managing cookies
 * Replaces the experimental cookieStore API for better browser compatibility
 */

const cookieUtils = {
    /**
     * Set a cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Number of days until expiration (optional)
     * @param {string} path - Path where cookie is valid (default: '/')
     */
    set: (name, value, days = 7, path = '/') => {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (encodeURIComponent(value) || '') + expires + '; path=' + path + '; SameSite=Lax';
    },

    /**
     * Get a cookie by name
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null if not found
     */
    get: (name) => {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    },

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     * @param {string} path - Path (default: '/')
     */
    delete: (name, path = '/') => {
        document.cookie = name + '=; Max-Age=-99999999; path=' + path;
    }
};
