/**
 * Auth Page Logic
 */

// --- DOM Constants ---
const UI = {
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    toggleLink: document.getElementById('toggle-link'),
    toggleText: document.getElementById('toggle-text'),
    alertContainer: document.getElementById('alert-container'),
    loginFormElement: document.getElementById('login-form'),
    registerFormElement: document.getElementById('register-form'),
};

// --- State ---
let currentForm = 'login'; // 'login' o 'register'

/**
 * Displays an alert message to the user.
 */
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    UI.alertContainer.innerHTML = '';
    UI.alertContainer.appendChild(alert);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/**
 * Toggles between login and register forms.
 */
function toggleForms() {
    if (currentForm === 'login') {
        UI.loginForm.classList.remove('active');
        UI.loginForm.hidden = true;
        UI.registerForm.classList.add('active');
        UI.registerForm.hidden = false;
        UI.toggleText.innerHTML = '<a href="#" id="toggle-link">¿Ya tienes cuenta? Inicia sesión</a>';
        currentForm = 'register';
    } else {
        UI.registerForm.classList.remove('active');
        UI.registerForm.hidden = true;
        UI.loginForm.classList.add('active');
        UI.loginForm.hidden = false;
        UI.toggleText.innerHTML = '<a href="#" id="toggle-link">¿No tienes cuenta? Regístrate</a>';
        currentForm = 'login';
    }

    UI.alertContainer.innerHTML = '';

    // Re-attach listener as innerHTML replaces the link
    document.getElementById('toggle-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
}

/**
 * Sets button loading state.
 */
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * API Wrapper: Check Authentication Status
 */
async function checkAuthStatus() {
    try {
        const response = await fetch(`/api/v1/auth`, { method: 'GET' });
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            const data = await response.json();
            if (response.ok) return data;
        }
        return null;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
}

/**
 * API Wrapper: Register User
 */
async function register(userData) {
    try {
        const response = await fetch(`/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        return response.ok
            ? { success: true, data }
            : { success: false, error: data.message || 'Error al registrar usuario' };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * API Wrapper: Login User
 */
async function login(credentials) {
    try {
        const response = await fetch(`/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            "credentials": "include",
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        return response.ok
            ? { success: true, data }
            : { success: false, error: data.message || 'Error al iniciar sesión' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

// --- Event Listeners ---

UI.loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

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

    const submitButton = UI.loginFormElement.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await login({ email, password });
    setButtonLoading(submitButton, false);

    if (result.success) {
        showAlert('¡Inicio de sesión exitoso!', 'success');
        UI.loginFormElement.reset();
        window.location.href = `/api/v1/auth/verify-email?token=${result.data.token}`;
    } else {
        showAlert(result.error, 'error');
    }
});

UI.registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

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

    const submitButton = UI.registerFormElement.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await register({ username, email, password });
    setButtonLoading(submitButton, false);

    if (result.success) {
        showAlert('¡Registro exitoso! Iniciando sesión...', 'success');
        UI.registerFormElement.reset();
        setTimeout(() => toggleForms(), 2000);
    } else {
        showAlert(result.error, 'error');
    }
});

UI.toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

document.addEventListener('DOMContentLoaded', async () => {
    const authStatus = await checkAuthStatus();
    if (authStatus) {
        console.log('Usuario ya autenticado:', authStatus);
    }
});
