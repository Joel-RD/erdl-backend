
const API_BASE_URL = 'http://localhost:3000';


const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const alertContainer = document.getElementById('alert-container');


const loginFormElement = document.getElementById('login-form');
const registerFormElement = document.getElementById('register-form');

// Estado actual
let currentForm = 'login'; // 'login' o 'register'


/**
 * Muestra una alerta en la interfaz
 */
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/**
 * Alterna entre el formulario de login y registro
 */
function toggleForms() {
    if (currentForm === 'login') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        toggleText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="toggle-link">Inicia sesión aquí</a>';
        currentForm = 'register';
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        toggleText.innerHTML = '¿No tienes cuenta? <a href="#" id="toggle-link">Regístrate aquí</a>';
        currentForm = 'login';
    }

    alertContainer.innerHTML = '';

    // Re-asignar el evento al nuevo link
    document.getElementById('toggle-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
}

// Las funciones isValidEmail e isStrongPassword han sido reemplazadas por 
// validateEmail y validatePassword definidas en /static/js/utils/validation.js



/**
 * Guarda el token en localStorage
 */
function saveToken(token) {
    window.api.removeToken(); // Limpiar previo si existe
    localStorage.setItem('authToken', token);
}

/**
 * Obtiene el token de localStorage
 */
function getToken() {
    return window.api.getToken();
}

/**
 * Elimina el token de localStorage
 */
function removeToken() {
    window.api.removeToken();
}

/**
 * Añade estado de carga a un botón
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ===== PETICIONES A LA API =====

/**
 * Verifica el estado de autenticación
 */
async function checkAuthStatus() {
    try {
        const token = getToken();

        const response = await window.api.fetch(`/api/v1/auth`, {
            method: 'GET'
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Usuario autenticado:', data);
            return data;
        } else {
            console.log('No autenticado');
            return null;
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return null;
    }
}

/**
 * Registra un nuevo usuario
 */
async function register(userData) {
    try {
        const response = await window.api.fetch(`/api/v1/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Error al registrar usuario' };
        }
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Inicia sesión
 */
async function login(credentials) {
    try {
        const response = await window.api.fetch(`/api/v1/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Error al iniciar sesión' };
        }
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

// ===== MANEJADORES DE EVENTOS =====

loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (!email || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        showAlert(emailValidation.error, 'error');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showAlert(passwordValidation.errors[0], 'error');
        return;
    }

    const submitButton = loginFormElement.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await login({ email, password });

    setButtonLoading(submitButton, false);

    if (result.success) {
        // Guardar token si existe
        if (result.data.token) {
            saveToken(result.data.token);
        }

        showAlert('¡Inicio de sesión exitoso!', 'success');

        loginFormElement.reset();

        window.location.href = '/api/v1/auth/verify-email';
        setTimeout(() => {
            console.log('Usuario logueado:', result.data);
        }, 1500);
    } else {
        showAlert(result.error, 'error');
    }
});

registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;

    if (!username || !email || !password || !confirmPassword) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        showAlert(emailValidation.error, 'error');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showAlert(passwordValidation.errors[0], 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }

    if (!termsAccepted) {
        showAlert('Debes aceptar los términos y condiciones', 'error');
        return;
    }

    const submitButton = registerFormElement.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await register({ username, email, password });

    setButtonLoading(submitButton, false);

    if (result.success) {
        showAlert('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');

        registerFormElement.reset();

        setTimeout(() => {
            toggleForms();
        }, 2000);
    } else {
        showAlert(result.error, 'error');
    }
});

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

// ===== INICIALIZACIÓN =====

/**
 * Verifica si el usuario ya está autenticado al cargar la página
 */
document.addEventListener('DOMContentLoaded', async () => {
    const authStatus = await checkAuthStatus();

    if (authStatus) {
        console.log('Usuario ya autenticado:', authStatus);
    }
});

window.authAPI = {
    login,
    register,
    checkAuthStatus,
    saveToken,
    getToken,
    removeToken
};