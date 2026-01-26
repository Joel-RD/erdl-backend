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
        alert('✅ URL copiada al portapapeles');
    }).catch(() => {
        alert('❌ No se pudo copiar la URL');
    });
}

let qrcodeInstance = null;

document.getElementById('shorten-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error');
    const qrcodeEl = document.getElementById('qrcode');
    const submitBtn = document.getElementById('submit-btn');

    // Limpiar resultados previos
    qrcodeEl.innerHTML = '';
    qrcodeEl.style.display = 'none';
    resultEl.textContent = '';
    resultEl.classList.remove('show');
    errorEl.textContent = '';
    errorEl.classList.remove('show');
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
    submitBtn.textContent = '⏳ Acortando...';

    try {
        const res = await fetch(`http://localhost:3000/api/v1/short?id_short=${machineId}`, {
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
        } else if (data.url_acortada) {
            resultEl.innerHTML = `
                        <strong>✅ URL acortada:</strong><br>
                        <a href="${data.url_acortada}" target="_blank">${data.url_acortada}</a><br>
                        <button class="copy-btn" onclick="copyToClipboard('${data.url_acortada}')">📋 Copiar URL</button>
                    `;
            resultEl.classList.add('show');

            // Generar código QR
            qrcodeEl.style.display = 'block';
            qrcodeInstance = new QRCode(qrcodeEl, {
                text: data.url_acortada,
                width: 200,
                height: 200,
                colorDark: "#667eea",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else if (data.error) {
            errorEl.textContent = `❌ ${data.error}`;
            errorEl.classList.add('show');
        } else if (data.message) {
            errorEl.textContent = `❌ ${data.message}`;
            errorEl.classList.add('show');
        } else {
            errorEl.textContent = '❌ Error desconocido al procesar la solicitud.';
            errorEl.classList.add('show');
        }
    } catch (err) {
        errorEl.textContent = '❌ Error al conectar con el servidor. Verifica tu conexión.';
        errorEl.classList.add('show');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = '✨ Acortar URL';
    }
});