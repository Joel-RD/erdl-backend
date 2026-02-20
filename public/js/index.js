/**
 * URL Shortener Frontend Logic
 */

// --- DOM Constants ---
const UI = {
    form: document.getElementById('shorten-form'),
    input: document.getElementById('orig_url'),
    submitBtn: document.getElementById('submit-btn'),
    resultSection: document.getElementById('result'),
    errorEl: document.getElementById('error'),
    qrcodeEl: document.getElementById('qrcode'),
};

// --- State ---
let currentShortUrl = '';
let resetTimeout = null;

/**
 * Validates if a string is a valid HTTPS URL using modern URL API.
 */
function validateURL(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Generates or retrieves a session-based machine ID.
 */
function getMachineId() {
    let machineId = sessionStorage.getItem('machineId');
    if (!machineId) {
        machineId = crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        sessionStorage.setItem('machineId', machineId);
    }
    return machineId;
}

/**
 * Reverts the UI to its initial state.
 */
function resetToNormal() {
    UI.input.value = '';
    UI.input.removeAttribute('readonly');
    UI.input.style.cursor = '';

    UI.submitBtn.type = 'submit';
    UI.submitBtn.onclick = null;
    UI.submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
        <span>Acortar Url</span>
    `;

    UI.resultSection.classList.remove('show');
    UI.qrcodeEl.classList.remove('show');
    UI.qrcodeEl.innerHTML = '';
    currentShortUrl = '';
}

/**
 * Copies the shortened URL to the clipboard.
 */
async function copyToClipboard() {
    if (!currentShortUrl) return;

    try {
        await navigator.clipboard.writeText(currentShortUrl);
        UI.submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>¡Copiado!</span>
        `;

        if (resetTimeout) clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
            resetToNormal();
            resetTimeout = null;
        }, 3000);
    } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('No se pudo copiar la URL');
    }
}

/**
 * Updates the UI once a URL has been successfully shortened.
 */
function setShortened(shortUrl) {
    UI.input.value = shortUrl;
    UI.input.setAttribute('readonly', true);
    UI.input.style.cursor = 'default';

    UI.submitBtn.type = 'button';
    UI.submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <span>Copiar Url</span>
    `;
    UI.submitBtn.onclick = copyToClipboard;
}

/**
 * Form Submission Handler
 */
UI.form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Reset transient UI state
    UI.qrcodeEl.innerHTML = '';
    UI.qrcodeEl.classList.remove('show');
    UI.errorEl.classList.remove('show');
    UI.errorEl.textContent = '';
    currentShortUrl = '';

    const orig_url = UI.input.value.trim();

    if (!validateURL(orig_url)) {
        UI.errorEl.textContent = 'Ingresa una URL válida que comience con https://';
        UI.errorEl.classList.add('show');
        return;
    }

    const machineId = getMachineId();

    // Loading State
    UI.submitBtn.disabled = true;
    UI.submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        <span>Acortando...</span>
    `;

    try {
        const res = await fetch(`/api/v1/short?id_short=${machineId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orig_url })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const messages = {
                429: 'Has alcanzado el límite semanal de URLs acortadas.',
                500: 'Error al conectar con el servidor.',
                400: 'Error al acortar la URL.',
            };
            UI.errorEl.textContent = data.message || messages[res.status] || 'Error inesperado.';
            UI.errorEl.classList.add('show');
            return;
        }

        if (data.url_acortada) {
            currentShortUrl = data.url_acortada;
            UI.resultSection.classList.add('show');
            setShortened(data.url_acortada);

            UI.qrcodeEl.classList.add('show');
            new QRCode(UI.qrcodeEl, {
                text: data.url_acortada,
                width: 114,
                height: 114,
                colorDark: "#222222",
                colorLight: "#c8d2c8",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    } catch (err) {
        console.error('Fetch error:', err);
        UI.errorEl.textContent = 'Error al conectar con el servidor. Verifica tu conexión.';
        UI.errorEl.classList.add('show');
    } finally {
        UI.submitBtn.disabled = false;
        if (!currentShortUrl) {
            UI.submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
                <span>Acortar Url</span>
            `;
        }
    }
});