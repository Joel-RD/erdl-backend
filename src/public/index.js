function validateURL(url) {
    if (!url) return false;
    const pattern = /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(url);
}

function getMachineId() {
    let machineId = sessionStorage.getItem('machineId');
    if (!machineId) {
        machineId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        sessionStorage.setItem('machineId', machineId);
    }
    return machineId;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Cambiar temporalmente el texto del botón
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado';
        btn.style.background = '#1a4d32';
        btn.style.borderColor = '#2a6d42';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(() => {
        alert('❌ No se pudo copiar la URL');
    });
}

let qrcodeInstance = null;

document.getElementById('shorten-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const resultSeccion = document.getElementById('result-section');
    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error-seccion');
    const qrcodeEl = document.getElementById('qrcode');
    const submitBtn = document.getElementById('submit-btn');

    // Limpiar resultados previos
    qrcodeEl.innerHTML = '';
    qrcodeEl.classList.remove('show');
    resultEl.innerHTML = '';
    resultEl.classList.remove('show');
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    resultSeccion.classList.remove('active');
    qrcodeInstance = null;

    const orig_url = document.getElementById('orig_url').value.trim();

    if (!validateURL(orig_url)) {
        errorEl.textContent = '❌ Ingresa una URL válida que comience con https://';
        errorEl.classList.add('show');
        return;
    }

    const machineId = getMachineId();

    // Deshabilitar botón durante la petición
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
        const res = await fetch(`/api/v1/short?id_short=${machineId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orig_url })
        });

        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            data = {};
        }

        if (res.status === 429) {
            errorEl.textContent = `❌ ${data.message || 'Has alcanzado el límite semanal de URLs acortadas.'}`;
            errorEl.classList.add('show');
            return;
        }

        if (res.status === 500) {
            errorEl.textContent = `❌ ${data.message || 'Error al conectar con el servidor.'}`;
            errorEl.classList.add('show');
            return;
        }

        if (res.status === 400) {
            errorEl.textContent = `❌ ${data.message || 'Error al acortar la URL.'}`;
            errorEl.classList.add('show');
            return;
        }

        if (data.url_acortada) {
            resultSeccion.classList.add('active');
            
            resultEl.innerHTML = `
                <strong>✓ Url acortada</strong>
                <a href="${data.url_acortada}" target="_blank">${data.url_acortada}</a>
                <button class="copy-btn" onclick="copyToClipboard('${data.url_acortada}')">Copiar</button>
            `;
            resultEl.classList.add('show');

            // Generar código QR
            qrcodeEl.classList.add('show');
            qrcodeInstance = new QRCode(qrcodeEl, {
                text: data.url_acortada,
                width: 128,
                height: 128,
                colorDark: "#0a0a0a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            return;
        }

    } catch (err) {
        errorEl.textContent = '❌ Error al conectar con el servidor. Verifica tu conexión.';
        errorEl.classList.add('show');
        return;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'acortar';
    }
});