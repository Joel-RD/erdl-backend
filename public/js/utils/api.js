/**
 * Wrapper para fetch que maneja automáticamente el token JWT
 * e intercepta errores de autenticación (401/403).
 */

const API_BASE_URL = 'http://localhost:3000';

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

async function authenticatedFetch(endpoint, options = {}) {
    const token = getToken();

    // Preparar headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Añadir token si existe
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Intercepción de errores 401 (No autorizado) y 403 (Prohibido)
        if (response.status === 401 || response.status === 403) {
            console.warn('Sesión inválida o expirada. Redirigiendo al login...');
            removeToken();
            window.location.href = '/api/v1/auth';
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// Exportar para uso global
window.api = {
    fetch: authenticatedFetch,
    getToken,
    removeToken
};
