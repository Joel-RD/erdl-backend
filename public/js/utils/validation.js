/**
 * Valida si un email es válido y pertenece a dominios permitidos
 * @param {string} email - Email a validar
 * @returns {object} objeto con isValid y mensaje de error si aplica
 */
function validateEmail(email) {
    // Lista de dominios permitidos (proveedores más importantes del mundo)
    const allowedDomains = [
        'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
        'icloud.com', 'protonmail.com', 'aol.com', 'zoho.com',
        'mail.com', 'gmx.com', 'yandex.com', 'live.com',
        'msn.com', 'me.com', 'mac.com'
    ];

    // Validar que el email no esté vacío
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'El email no puede estar vacío' };
    }

    // Expresión regular robusta para validar formato de email
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Formato de email inválido' };
    }

    // Extraer el dominio del email
    const domain = email.split('@')[1].toLowerCase();

    // Verificar que el dominio esté en la lista permitida
    if (!allowedDomains.includes(domain)) {
        return {
            isValid: false,
            error: `Dominio no permitido. Solo se aceptan: ${allowedDomains.join(', ')}`
        };
    }

    // Validaciones adicionales de seguridad
    if (email.length > 254) {
        return { isValid: false, error: 'El email excede la longitud máxima permitida' };
    }

    const localPart = email.split('@')[0];
    if (localPart.length > 64) {
        return { isValid: false, error: 'La parte local del email es demasiado larga' };
    }

    // Verificar que no tenga puntos consecutivos
    if (email.includes('..')) {
        return { isValid: false, error: 'El email no puede contener puntos consecutivos' };
    }

    // Verificar que no empiece o termine con punto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return { isValid: false, error: 'El email no puede empezar o terminar con punto' };
    }

    return { isValid: true };
}

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {object} objeto con isValid, strength y errores si aplica
 */
function validatePassword(password) {
    const errors = [];
    let score = 0;

    // Requisitos mínimos
    const minLength = 12;
    const maxLength = 128;

    // Validar que la contraseña no esté vacía
    if (!password || password.trim() === '') {
        return {
            isValid: false,
            strength: 'débil',
            errors: ['La contraseña no puede estar vacía']
        };
    }

    // Validar longitud mínima
    if (password.length < minLength) {
        errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    } else {
        score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 20) score += 1;
    }

    // Validar longitud máxima
    if (password.length > maxLength) {
        errors.push(`La contraseña no puede exceder ${maxLength} caracteres`);
    }

    // Validar al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
        errors.push('Debe contener al menos una letra minúscula');
    } else {
        score += 1;
    }

    // Validar al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener al menos una letra mayúscula');
    } else {
        score += 1;
    }

    // Validar al menos un número
    if (!/\d/.test(password)) {
        errors.push('Debe contener al menos un número');
    } else {
        score += 1;
    }

    // Validar al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Debe contener al menos un carácter especial (!@#$%^&*...)');
    } else {
        score += 2;
    }

    // Validar que no contenga espacios
    if (/\s/.test(password)) {
        errors.push('La contraseña no debe contener espacios');
    }

    // Validar que no sea una contraseña común
    const commonPasswords = [
        'password', '12345678', 'qwerty', 'abc123', 'password123',
        'admin123', 'letmein', 'welcome', 'monkey', '1234567890'
    ];

    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('La contraseña contiene patrones comunes y predecibles');
        score = Math.max(0, score - 2);
    }

    // Validar que no tenga caracteres repetidos consecutivos (más de 2)
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Evita usar el mismo carácter más de 2 veces consecutivas');
    }

    // Validar secuencias numéricas o alfabéticas
    if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(password)) {
        errors.push('Evita secuencias predecibles de números o letras');
    }

    // Determinar fortaleza basada en el puntaje
    let strength;
    if (score <= 3) {
        strength = 'débil';
    } else if (score <= 5) {
        strength = 'media';
    } else if (score <= 7) {
        strength = 'fuerte';
    } else {
        strength = 'muy fuerte';
    }

    return {
        isValid: errors.length === 0,
        strength,
        errors
    };
}
