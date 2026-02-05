const verifyEmailForm = document.getElementById('verifyEmailForm');
const alertContainer = document.getElementById('alert-container');

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

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

async function verifyEmailCode(code) {
    try {
        const cookie = await cookieStore.get('emailSendToVerifyUser');
        const dataCookies = JSON.parse(cookie.value)
        const response = await fetch(`/api/v1/auth/verify-email?token=${dataCookies.token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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


verifyEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = document.getElementById('code').value.trim();

    if (!code) {
        showAlert('Por favor ingresa el código de verificación', 'error'); 
        return;
    }

    if (code.length < 4) {
        showAlert('El código debe tener al menos 4 caracteres', 'error');
        return;
    }

    const submitButton = verifyEmailForm.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const result = await verifyEmailCode(code);

    setButtonLoading(submitButton, false);

    if (result.success) {
        
        showAlert('¡Verificación exitosa!', 'success');
        verifyEmailForm.reset();

        await cookieStore.delete('emailSendToVerifyUser');
        setTimeout(() => {
            window.location.href = '/api/v1/auth/protected/profile';
        }, 3000);
        return;
    }

    if (result.error) {
        window.location.href = '/api/v1/auth';
        return;
    }
    showAlert(result.error, 'error');
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de verificación de email cargada');
});

