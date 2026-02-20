/**
 * Verify Email Page Logic
 */

// --- DOM Constants ---
const UI = {
    form: document.getElementById('verify-form'),
    codeField: document.getElementById('code'),
    submitBtn: document.getElementById('submit-verify'),
    alertContainer: document.getElementById('alert-container'),
};

/**
 * Displays an alert message.
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
 * Sets button loading state.
 */
function setButtonLoading(isLoading) {
    if (isLoading) {
        UI.submitBtn.classList.add('loading');
        UI.submitBtn.disabled = true;
    } else {
        UI.submitBtn.classList.remove('loading');
        UI.submitBtn.disabled = false;
    }
}

/**
 * API Wrapper: Verify Email Code
 */
async function verifyEmailCode(code) {
    try {
        const cookieValue = cookieUtils.get('emailSendToVerifyUser');
        if (!cookieValue) {
            throw new Error('Sesión de verificación expirada. Por favor, intenta de nuevo.');
        }

        const { token } = JSON.parse(cookieValue);
        const response = await fetch(`/api/v1/auth/verify-email?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        return response.ok
            ? { success: true, data }
            : { success: false, error: data.message || 'Código de verificación incorrecto.' };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, error: error.message || 'Error de conexión con el servidor.' };
    }
}

// --- Event Listeners ---

UI.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = UI.codeField.value.trim();

    if (!code) {
        showAlert('Por favor ingresa el código de verificación', 'error');
        return;
    }

    if (code.length < 4) {
        showAlert('El código debe tener al menos 4 caracteres', 'error');
        return;
    }

    setButtonLoading(true);
    const result = await verifyEmailCode(code);
    setButtonLoading(false);

    if (result.success) {
        showAlert('¡Verificación exitosa! Redirigiendo...', 'success');
        cookieUtils.delete('emailSendToVerifyUser');
        setTimeout(() => {
            window.location.href = '/api/v1/auth/user/profile';
        }, 3000);
    } else {
        showAlert(result.error, 'error');
        if (result.error.includes('expirada')) {
            cookieUtils.delete('emailSendToVerifyUser');
        }
    }
});