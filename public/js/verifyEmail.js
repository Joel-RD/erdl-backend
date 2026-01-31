const verifyEmailForm = document.getElementById('verifyEmailForm');
const alertContainer = document.getElementById('alert-container');

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
 * Guarda el token en localStorage
 */
function saveToken(token) {
    window.api.removeToken();
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
 * Verifica el código de email
 */
async function verifyEmailCode(code) {
    try {
        const response = await window.api.fetch(`/api/v1/auth/verify-email`, {
            method: 'POST',
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Error al verificar el código' };
        }
    } catch (error) {
        console.error('Error en verificación:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

// ===== MANEJADORES DE EVENTOS =====

verifyEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = document.getElementById('code').value.trim();

    if (!code) {
        showAlert('Por favor ingresa el código de verificación', 'error');
        return;
    }

    // Validación básica del código (ajusta según tu formato)
    if (code.length < 4) {
        showAlert('El código debe tener al menos 4 caracteres', 'error');
        return;
    }

    const submitButton = verifyEmailForm.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await verifyEmailCode(code);

    setButtonLoading(submitButton, false);

    if (result.success) {
        // Guardar token si existe
        if (result.token) {
            saveToken(result.token);
        }

        showAlert('¡Verificación exitosa!', 'success');

        verifyEmailForm.reset();

        // Redirigir al usuario después de la verificación
        setTimeout(() => {
            console.log('Email verificado:', result.data);
            // Puedes redirigir a otra página aquí
            // window.location.href = '/dashboard';
        }, 1500);
    } else {
        showAlert(result.error, 'error');
    }
});

// ===== INICIALIZACIÓN =====

/**
 * Verifica si el usuario ya está autenticado al cargar la página
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de verificación de email cargada');
});
