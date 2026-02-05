const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const alertContainer = document.getElementById('alert-container');


const loginFormElement = document.getElementById('login-form');
const registerFormElement = document.getElementById('register-form');

// Estado actual
let currentForm = 'login'; // 'login' o 'register'

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

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`/api/v1/auth`, {
            method: 'GET'
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                console.log('Usuario autenticado:', data);
                return data;
            }
        } else {
            console.log('Respuesta no es JSON (posiblemente HTML de página de login)');
        }

        console.log('No autenticado');
        return null;
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return null;
    }
}

async function register(userData) {
    try {
        const response = await fetch(`/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

async function login(credentials) {
    try {
        const response = await fetch(`/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

    const result = await login({ email: email, password: password });
    setButtonLoading(submitButton, false);

    if (result.success) {

        showAlert('¡Inicio de sesión exitoso!', 'success');

        const data = { token: result.data.token, email: result.data.email };
        cookieStore.set('emailSendToVerifyUser', JSON.stringify(data));
        loginFormElement.reset();

        window.location.href = `/api/v1/auth/verify-email?token=${result.data.token}`;
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
        showAlert('¡Registro exitoso! Iniciando sesión...', 'success');

        // Automáticamente intentamos loguear o dejamos que el usuario lo haga.
        // El backend no devuelve token en registro actualmente, por lo que no guardamos nada.
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

document.addEventListener('DOMContentLoaded', async () => {
    const authStatus = await checkAuthStatus();

    if (authStatus) {
        console.log('Usuario ya autenticado:', authStatus);
    }
});
