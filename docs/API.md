# Referencia de la API

> Base URL: `http://localhost:3000/api/v1`

---

## Resumen de endpoints

### Acortamiento de URLs

| Método | Ruta | Descripción | Rate limit |
|--------|------|-------------|------------|
| `POST` | `/api/v1/short` | Acortar una URL | 5.000/h (prod) |
| `GET` | `/:shortUrl` | Redirigir a la URL original (302) | 50.000/h (prod) |

### Autenticación

| Método | Ruta | Descripción | Protegido | Rate limit |
|--------|------|-------------|-----------|------------|
| `POST` | `/api/v1/auth/register` | Registrar usuario | No | 4/día (prod) |
| `POST` | `/api/v1/auth/login` | Iniciar sesión | No | 4/día (prod) |
| `POST` | `/api/v1/auth/verify-email` | Verificar código de email | Temporal | 4/día (prod) |
| `GET` | `/api/v1/auth/user/profile` | Consultar perfil del usuario | JWT | — |

---

## Acortamiento de URLs

<img src="diagrams/url-flow.svg" width="100%" alt="Flujo de acortado y redirección de URLs: validación anti-SSRF, nanoid, INSERT en LibSQL y redirección 302">

### `POST /api/v1/short` — Acortar una URL

Valida la URL de destino (anti-SSRF), genera un identificador único de 8 caracteres con `nanoid` y lo persiste en LibSQL.

**Cuerpo de la solicitud:**

```json
{ "orig_url": "https://ejemplo.com/un/recurso/muy/largo" }
```

**Respuesta `200 OK`:**

```json
{
  "message": "URL acortada con éxito.",
  "url_acortada": "http://localhost:3000/abc12345"
}
```

### `GET /:shortUrl` — Redirigir a la URL original

Busca la URL acortada y redirige con un `302 Found`. Si no existe o está inactiva, responde `404`.

| Resultado | Respuesta |
|-----------|-----------|
| URL encontrada | `302` con cabecera `Location: <original_url>` |
| URL no encontrada | `404` |

---

## Autenticación

El sistema usa un proceso de **3 pasos** con verificación de email por código:

<img src="diagrams/auth-flow.svg" width="100%" alt="Secuencia de autenticación: registro/login, código por email y cookie JWT de sesión">

1. **Registro o Login** → se envía un código de 6 caracteres por email y se establece la cookie temporal `emailSendToVerifyUser` (JWT, 2 minutos).
2. **Verificación del código** → el cliente envía el código y, si es correcto, se establece la cookie de sesión `authTokenAuthorized` (JWT, 2 días).
3. **Rutas protegidas** → el middleware `authJWT` valida la cookie `authTokenAuthorized` en cada petición.

> **Nota:** si el usuario intenta login o registro mientras tiene un código de verificación activo, recibe un error `429` con el tiempo restante en minutos.

### `POST /api/v1/auth/register` — Registrar usuario

**Cuerpo de la solicitud:**

```json
{
  "username": "mi_usuario",
  "email": "correo@ejemplo.com",
  "password": "MiContraseña123!"
}
```

**Respuesta `201 Created`:**

```json
{ "message": "Usuario creado correctamente, código enviado al email" }
```

> Se establece la cookie `emailSendToVerifyUser` (2 minutos de duración, contiene un JWT temporal).

### `POST /api/v1/auth/login` — Iniciar sesión

**Cuerpo de la solicitud:**

```json
{
  "email": "correo@ejemplo.com",
  "password": "MiContraseña123!"
}
```

**Respuesta `200 OK`:**

```json
{
  "message": "Inicio de sesión correcto, código enviado al email",
  "user": {
    "id": 1,
    "username": "mi_usuario",
    "email": "correo@ejemplo.com"
  }
}
```

> Se establece la cookie `emailSendToVerifyUser` (2 minutos de duración).

### `POST /api/v1/auth/verify-email` — Verificar código de email

Requiere la cookie `emailSendToVerifyUser` previamente establecida (por registro o login).

**Cuerpo de la solicitud:**

```json
{
  "email": "correo@ejemplo.com",
  "code": "aB3xY9"
}
```

**Respuesta `200 OK`:**

```json
{ "message": "Inicio de sesión correcto." }
```

> Se establece la cookie `authTokenAuthorized` (JWT de sesión, 2 días de duración).

### `GET /api/v1/auth/user/profile` — Consultar perfil

Requiere la cookie `authTokenAuthorized`.

**Respuesta `200 OK`:**

```json
{
  "message": "Perfil consultado correctamente",
  "user": {
    "email": "correo@ejemplo.com"
  }
}
```

---

## Formato de respuestas

**Éxito:**

```json
{ "message": "Operación exitosa", ... }
```

**Error de aplicación (`AppError`):**

```json
{ "message": "Descripción del error" }
```

**Error con detalles:**

```json
{
  "message": "Descripción del error",
  "details": { "retryAfterMinutes": 45 }
}
```

**Ruta no encontrada:**

```json
{
  "error": "Not Found",
  "message": "Ruta POST /ruta/inexistente no encontrada"
}
```

**Error interno:**

```json
{
  "error": "Internal Server Error",
  "message": "Ocurrió un error inesperado"
}
```

### Códigos de estado

| Código | Significado |
|--------|-------------|
| `200` / `201` | Operación exitosa |
| `400` | Solicitud incorrecta (validación) |
| `401` | No autorizado (token faltante, expirado o inválido) |
| `403` | Prohibido (token no corresponde al email) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (email ya registrado) |
| `410` | Gone (URL de destino no permitida) |
| `429` | Demasiadas solicitudes (rate limit o límite de intentos) |
| `500` | Error interno del servidor |

---

## Siguientes pasos

- [Guía de inicio rápido](GETTING_STARTED.md) — instalación y variables de entorno
- [Arquitectura del sistema](ARCHITECTURE.md) — patrones, base de datos y flujos internos
- [Seguridad](SECURITY.md) — mecanismos de protección implementados
- [Testing](TESTING.md) — suite de tests y tests de estrés