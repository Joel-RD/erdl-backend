# Testing

> Suite de tests unitarios y tests de estrés de **ERDL URL Shortener API**.

---

## Tests unitarios

### Ejecutar

```bash
npm test
```

### Configuración

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Jest con preset ESM (`ts-jest/presets/default-esm`) |
| **Entorno** | Node.js |
| **Setup** | `test/setup.ts` establece `NODE_ENV=test`, `JWT_SECRET` y `STRESS_TEST=true` |
| **HTTP tests** | Supertest |
| **Cobertura** | Habilitada, directorio `coverage/` |
| **Module mapping** | `*.js` → extensión eliminada para compatibilidad ESM |

### Estructura de tests

Cada módulo de `src/` tiene su contraparte en `test/src/`:

```
test/
├── setup.ts                          # Variables de entorno para tests
├── src/
│   ├── controllers/                  # authController, urlController
│   ├── services/                     # authService, urlService, sendEmails
│   ├── repository/                   # urlRepository, userAuthRepository
│   ├── Middleware/                   # authJWT
│   ├── middleware/                   # errorHandler
│   └── utils/                        # AppError, attemptLimiter, codeValidatedEmail,
│                                     # jwt, limitClick, nanoidTool, password_encrypt,
│                                     # validateUserData
└── stress/
    └── stress-tester.ts              # Tests de estrés con autocannon
```

---

## Tests de estrés

### Ejecutar

```bash
npm run stress        # Modo desarrollo (rate limits deshabilitados)
npm run stress:full   # Modo producción
```

### Características

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | autocannon |
| **Configuración** | 500 conexiones, pipelining 1, 60 segundos |
| **Flujo encadenado** | POST (crear URL con ID aleatorio) → GET (redirección) |
| **Métricas** | Peticiones totales/segundo, latencia promedio/máxima, distribución 2xx/3xx/4xx/5xx |
| **Modos** | Desarrollo (`npm run stress`) y producción (`npm run stress:full`) |
| **En modo stress** | Rate limits de URLs deshabilitados y logging a archivos silenciado |

---

## Siguientes pasos

- [Guía de inicio rápido](GETTING_STARTED.md) — instalación y variables de entorno
- [Referencia de la API](API.md) — endpoints, cuerpos y formatos de respuesta
- [Arquitectura del sistema](ARCHITECTURE.md) — patrones, base de datos y flujos internos
- [Seguridad](SECURITY.md) — mecanismos de protección implementados