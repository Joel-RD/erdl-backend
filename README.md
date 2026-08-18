# ERDL URL Shortener API

API de acortamiento de URLs con sistema de autenticación completo: registro, verificación de email por código y rutas protegidas mediante JWT en cookies HttpOnly. Construida con **Node.js**, **Express 5**, **TypeScript** y **LibSQL**.

---

## Características

- **Acortamiento de URLs**: genera identificadores únicos de 8 caracteres con `nanoid`
- **Autenticación de 3 pasos**: registro o login → código de verificación por email → cookie JWT firmada
- **Persistencia de datos**: LibSQL (SQLite local en desarrollo, Turso en producción)
- **Protección anti-SSRF**: validación exhaustiva de URLs de destino (sin IPs privadas, sin localhost, sin credenciales)
- **Límite de intentos**: bloqueo automático tras 5 intentos fallidos (email, contraseña o código)
- **Rate limiting**: protección por IP en cada endpoint
- **Seguridad**: Helmet, CORS configurable, cookies HttpOnly/SameSite, bcryptjs (10 rounds)
- **Logging**: Winston estructurado con archivos rotativos (5 MB) y Morgan en desarrollo
- **Manejo centralizado de errores**: `AppError` con códigos de estado y detalles consistentes

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js v18+ (ESM) |
| Lenguaje | TypeScript 5 |
| Framework | Express.js 5 |
| Base de datos | LibSQL (`@libsql/client`) — SQLite local / Turso en producción |
| Autenticación | `jsonwebtoken`, `bcryptjs` |
| Envío de email | `nodemailer` |
| IDs únicos | `nanoid` (8 caracteres) |
| Logging | Winston, Morgan |
| Seguridad | Helmet, `express-rate-limit`, CORS |
| Testing | Jest, Supertest, ts-jest (ESM) |
| Stress testing | autocannon |

---

## Estructura del proyecto

```
erdl-backend/
├── src/
│   ├── main.ts                      # Inicialización de Express, middlewares y rutas
│   ├── run.ts                       # Punto de entrada del servidor
│   ├── config.ts                    # Configuración centralizada desde variables de entorno
│   ├── Database/
│   │   ├── databases.ts             # Cliente LibSQL (SQLite local / Turso)
│   │   ├── databases.db             # Base de datos local (desarrollo)
│   │   └── sheme.sql                # Esquema de la base de datos
│   ├── models/
│   │   └── types.ts                 # Interfaces y tipos TypeScript
│   ├── routers/
│   │   ├── usersRouters.ts          # Rutas de acortamiento y redirección
│   │   ├── userAuthRouter.ts        # Rutas de registro, login y verificación
│   │   └── protectedRoutes.ts       # Rutas protegidas por JWT
│   ├── controllers/
│   │   ├── urlController.ts         # Controlador de URLs
│   │   └── authController.ts        # Controlador de autenticación
│   ├── services/
│   │   ├── urlService.ts            # Lógica de negocio de URLs
│   │   ├── authService.ts           # Lógica de negocio de autenticación
│   │   └── sendEmails.ts            # Servicio de envío de emails (Nodemailer)
│   ├── repository/
│   │   ├── urlRepository.ts         # Acceso a datos de URLs
│   │   └── authRepository.ts        # Acceso a datos de usuarios y verificación
│   ├── Middleware/
│   │   └── authJWT.ts               # Middleware JWT (authJWT, verifySendToEmail)
│   ├── middleware/
│   │   └── errorHandler.ts          # Manejador de errores centralizado
│   └── utils/
│       ├── AppError.ts              # Clase de error personalizada
│       ├── attemptLimiter.ts        # Configuración de límite de intentos
│       ├── codeValidatedEmail.ts    # Generación de código de verificación
│       ├── configEmailTransport.ts  # Transporte Nodemailer
│       ├── jwt.ts                   # Generación de tokens JWT
│       ├── limitClick.ts            # Rate limiting por IP
│       ├── logger.ts                # Winston logger
│       ├── nanoidTool.ts            # Generación de IDs cortos
│       ├── password_encrypt.ts      # Hash y comparación con bcryptjs
│       └── validateUserData.ts      # Validación de email, contraseña, registro y dominios
├── test/
│   ├── setup.ts                     # Configuración global de tests
│   ├── src/                         # Tests unitarios (controllers, services, repository, utils)
│   └── stress/
│       └── stress-tester.ts         # Tests de estrés con autocannon
├── docs/
│   └── ARCHITECTURE.md              # Documentación de arquitectura
├── jest.config.js                   # Configuración de Jest
├── tsconfig.json                    # Configuración de TypeScript
├── nodemon.json                     # Configuración de Nodemon
├── package.json
├── .env.example
└── .gitignore
```

---

## Primeros pasos

### Requisitos

- Node.js v18 o superior
- npm
- Cuenta en Turso (producción) o SQLite local (desarrollo)
- Credenciales SMTP para envío de emails de verificación

### Instalación

```bash
git clone https://github.com/Joel-RD/erdl-backend.git
cd erdl-backend
npm install
```

### Configuración

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores. Consulta la sección [Variables de entorno](#variables-de-entorno) para el detalle completo.

### Ejecutar

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno: `development` o `production` | `development` |
| `DB_TURSO_URL` | URL de la base de datos Turso (solo producción) | Ruta SQLite local |
| `DB_TURSO_AUTH_TOKEN` | Token de autenticación de Turso (solo producción) | — |
| `JWT_SECRET` | Secreto para firmar JWT (obligatorio en producción) | Secreto aleatorio de desarrollo |
| `DOMAIN_FOR_FRONTEND` | Origen permitido por CORS | `http://localhost:3000` |
| `HTTP_ONLY` | Flag HttpOnly para cookies | `true` |
| `SECURE` | Flag Secure para cookies (solo producción) | `true` en producción |
| `SAME_SITE` | Política SameSite de cookies | `lax` |
| `MAX_AGE` | Tiempo de vida de cookies (milisegundos) | 7 días (`604800000`) |
| `COOKIE_PATH` | Ruta de las cookies | `/` |
| `EMAIL_HOST` | Host SMTP (ej: `smtp.gmail.com`) | — |
| `EMAIL_PORT` | Puerto SMTP | — |
| `EMAIL_SECURE` | Usar TLS para SMTP | — |
| `EMAIL_USER` | Email/usuario SMTP | — |
| `EMAIL_PASS` | Contraseña SMTP | — |

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload (Nodemon) |
| `npm run build` | Compilar TypeScript a JavaScript en `dist/` |
| `npm start` | Ejecutar build de producción |
| `npm test` | Ejecutar suite de tests con Jest |
| `npm run stress` | Tests de estrés en modo desarrollo |
| `npm run stress:full` | Tests de estrés en modo producción |

---

## Referencia API

Base URL: `http://localhost:3000/api/v1`

### Acortamiento de URLs

| Método | Ruta | Descripción | Rate Limit |
|--------|------|-------------|------------|
| `POST` | `/api/v1/short` | Acortar una URL | 5.000/h (prod) |
| `GET` | `/:shortUrl` | Redirigir a la URL original (302) | 50.000/h (prod) |

**POST /api/v1/short**

Cuerpo de la solicitud:
```json
{ "orig_url": "https://ejemplo.com/un/recurso/muy/largo" }
```

Respuesta (200):
```json
{
  "message": "URL acortada con éxito.",
  "url_acortada": "http://localhost:3000/abc12345"
}
```

### Autenticación

| Método | Ruta | Descripción | Protegido | Rate Limit |
|--------|------|-------------|-----------|------------|
| `POST` | `/api/v1/auth/register` | Registrar usuario | No | 4/día (prod) |
| `POST` | `/api/v1/auth/login` | Iniciar sesión | No | 4/día (prod) |
| `POST` | `/api/v1/auth/verify-email` | Verificar código de email | Temporal | 4/día (prod) |
| `GET` | `/api/v1/auth/user/profile` | Consultar perfil del usuario | JWT | — |

**POST /api/v1/auth/register**

Cuerpo:
```json
{
  "username": "mi_usuario",
  "email": "correo@ejemplo.com",
  "password": "MiContraseña123!"
}
```

Respuesta (201):
```json
{ "message": "Usuario creado correctamente, código enviado al email" }
```
> Se establece la cookie `emailSendToVerifyUser` (2 minutos de duración, contiene un JWT temporal).

**POST /api/v1/auth/login**

Cuerpo:
```json
{
  "email": "correo@ejemplo.com",
  "password": "MiContraseña123!"
}
```

Respuesta (200):
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

**POST /api/v1/auth/verify-email**

Cuerpo:
```json
{
  "email": "correo@ejemplo.com",
  "code": "aB3xY9"
}
```
> Requiere la cookie `emailSendToVerifyUser` previamente establecida (por registro o login).

Respuesta (200):
```json
{ "message": "Inicio de sesión correcto." }
```
> Se establece la cookie `authTokenAuthorized` (JWT de sesión, 2 días de duración).

**GET /api/v1/auth/user/profile**

> Requiere la cookie `authTokenAuthorized`.

Respuesta (200):
```json
{
  "message": "Perfil consultado correctamente",
  "user": {
    "email": "correo@ejemplo.com"
  }
}
```

---

## Flujo de autenticación

El sistema utiliza un proceso de 3 pasos con verificación de email:

1. **Registro o Login** → se envía un código de 6 caracteres por email y se establece una cookie temporal (`emailSendToVerifyUser`, JWT con 2 minutos de duración).

2. **Verificación del código** → el cliente envía el código recibido. Se valida contra la cookie temporal y el cuerpo de la solicitud. Si es correcto, se establece la cookie de sesión (`authTokenAuthorized`, JWT con 2 días de duración).

3. **Rutas protegidas** → el middleware `authJWT` valida la cookie `authTokenAuthorized` en cada petición a rutas protegidas.

> Si el usuario intenta login o registro mientras tiene un código de verificación activo, recibe un error 429 con el tiempo restante en minutos.

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

## Seguridad

| Mecanismo | Detalle |
|-----------|---------|
| **Helmet** | Cabeceras HTTP seguras (CSP y cross-origin en producción) |
| **CORS** | Solo permite el origen configurado en `DOMAIN_FOR_FRONTEND` |
| **Rate limiting** | Por IP: 5.000/h shorten, 50.000/h redirect, 4/día auth (producción) |
| **Bloqueo de intentos** | 5 intentos máximos → bloqueo de 2 h (email/contraseña) o 1 h (código) |
| **Cookies HttpOnly** | JWT almacenado en cookies HttpOnly, SameSite, Secure en producción |
| **Contraseñas** | Bcryptjs con 10 rounds; mínimo 12 caracteres, mayúscula, minúscula, número y carácter especial |
| **Validación de URLs** | Anti-SSRF: solo http/https, sin IPs privadas/localhost, sin credenciales, TLD válido |
| **JWT de dos tipos** | Temporal (2 min, para verificación) y de sesión (2 días, para autenticación) |
| **Entorno** | `JWT_SECRET` obligatorio en producción; en desarrollo se genera uno aleatorio |

---

## Testing

```bash
npm test
```

- **Framework**: Jest con preset ESM (`ts-jest`)
- **HTTP tests**: Supertest
- **Cobertura**: directorio `coverage/`
- **Configuración global**: `test/setup.ts` (establece `NODE_ENV=test`, `JWT_SECRET`, `STRESS_TEST=true`)
- **Ubicación**: `test/src/` (unitarios de controllers, services, repository, middleware, utils)

### Tests de estrés

```bash
npm run stress        # Modo desarrollo (rate limits deshabilitados)
npm run stress:full   # Modo producción
```

- **Herramienta**: autocannon
- **Configuración**: 500 conexiones, 60 segundos, flujo encadenado POST → GET
- **Mide**: peticiones/seg, latencia promedio/máxima, respuestas 2xx/3xx/4xx/5xx

---

## Licencia

Este proyecto está bajo la licencia ISC.
