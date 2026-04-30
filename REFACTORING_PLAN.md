# Plan de Refactorización - ERDL Backend (URL Shortener)

> **Fecha**: Abril 2026  
> **Objetivo**: Mejorar calidad, seguridad, mantenibilidad y rendimiento del código  
> **Alcance**: Proyecto completo (URL Shortener API)

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Niveles de Urgencia](#niveles-de-urgencia)
   - [🔴 Crítico (Inmediato)](#🔴-crítico--inmediato-)
   - [🟠 Alto (1-2 semanas)](#🟠-alto--1-2-semanas-)
   - [🟡 Medio (2-4 semanas)](#🟡-medio--2-4-semanas-)
   - [🟢 Bajo (1-2 meses)](#🟢-bajo--1-2-meses-)
3. [Detalles por Categoría](#detalles-por-categoría)
4. [Plan de Implementación](#plan-de-implementación)
5. [Métricas de Éxito](#métricas-de-éxito)

---

## Resumen Ejecutivo

El proyecto es una API de acortamiento de URLs construida con Node.js, Express y TypeScript. Aunque funcional, presenta varios problemas:

- **Seguridad**: Secretos con valores por defecto inseguros, inconsistencia en configuración de cookies
- **Calidad de código**: Uso excesivo de `any`, manejo inconsistente de errores, mezcla de responsabilidades
- **Arquitectura**: Falta inyección de dependencias, capa de servicios incompleta
- **Testing**: Cobertura limitada, tests de integración faltantes

---

## Niveles de Urgencia

### 🔴 Crítico (Inmediato)

> **Impacto**: Riesgo de seguridad, fallos en producción, pérdida de datos

#### 1. Seguridad - Secretos y Configuración

**Problema**: `config.ts` línea 13 tiene un secreto JWT por defecto inseguro
```typescript
jwtSecret: JWT_SECRET || "default_secret_key_for_development_only",
```

**Riesgo**: Si `JWT_SECRET` no está configurado en producción, el sistema usa un secreto conocido.

**Solución**:
```typescript
// config.ts
jwtSecret: (() => {
  if (!JWT_SECRET) {
    if (NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    console.warn('WARNING: Using development JWT secret - DO NOT USE IN PRODUCTION');
    return 'dev_only_secret_' + Math.random().toString(36);
  }
  return JWT_SECRET;
})(),
```

**Archivos a modificar**:
- `src/config.ts`
- Agregar validación en `src/run.ts`

---

#### 2. Seguridad - Configuración de Cookies Inconsistente

**Problema**: En `userAuthController.ts` líneas 131-137, las cookies se configuran con valores hardcoded en lugar de usar la configuración centralizada.

**Actual**:
```typescript
res.cookie("authTokenAuthorized", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
});
```

**Solución**: Usar `configCookiesParams` del archivo de configuración.

**Archivos a modificar**:
- `src/controllers/userAuthController.ts`
- `src/config.ts` (agregar `maxAge` para auth token)

---

#### 3. Seguridad - Bug en Verificación de Entorno

**Problema**: `src/utils/logger.ts` línea 10 compara con `'Production'` (con P mayúscula) pero en `config.ts` se usa `'production'` (minúsculas).

```typescript
// logger.ts - INCORRECTO
const isProduction = process.env.NODE_ENV === 'Production';

// config.ts - CORRECTO
isProduction: NODE_ENV === "production" ? true : false,
```

**Solución**: Estandarizar a minúsculas en todas partes.

**Archivos a modificar**:
- `src/utils/logger.ts`

---

#### 4. Manejo de Errores Inconsistente

**Problema**: Mezcla de `console.error` y `log.error` en todo el código.

| Archivo | Líneas con console.error |
|---------|-------------------------|
| `userAuthController.ts` | 21, 55, 107, 141 |
| `userAuthRepository.ts` | 28, 45, 59, 73, 87 |
| `main.ts` | 42 |

**Solución**: Estandarizar uso de Winston logger en toda la aplicación.

**Archivos a modificar**:
- `src/controllers/userAuthController.ts`
- `src/repository/userAuthRepository.ts`
- `src/main.ts`
- Crear utilidad de manejo de errores centralizado

---

#### 5. Validación de Datos de Entrada Faltante

**Problema**: En `userControllers.ts` línea 16-18, solo valida que `orig_url` exista y sea string, pero no valida que sea una URL válida.

**Solución**: Agregar validación de URL usando `URL` constructor o regex.

```typescript
// utils/validateUrl.ts (nuevo archivo)
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

**Archivos a modificar**:
- `src/controllers/userControllers.ts`
- Crear `src/utils/validateUrl.ts`

---

### 🟠 Alto (1-2 semanas)

> **Impacto**: Problemas de mantenibilidad, bugs potenciales, deuda técnica

#### 6. Refactorización de Tipos TypeScript - Eliminar `any`

**Problema**: Uso extensivo de `any` en:
- `userAuthRepository.ts`: `findByEmail` retorna `any`
- `types.ts`: `IUserAuthRepository` usa `any`
- `userAuthController.ts`: manejo de usuario sin tipo definido

**Solución**: Definir interfaces apropiadas.

```typescript
// models/types.ts - Agregar
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name?: string;
  last_name?: string;
  email_verified: boolean;
  account_active: boolean;
  subscription_active: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationCode {
  id: number;
  user_id?: number;
  email: string;
  code: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
}
```

**Archivos a modificar**:
- `src/models/types.ts`
- `src/repository/userAuthRepository.ts`
- `src/controllers/userAuthController.ts`

---

#### 7. Inyección de Dependencias y Arquitectura

**Problema**: En `userAuthController.ts` línea 11, el repositorio se instancia dentro del controlador:

```typescript
const authControllerRepository = new AuthRepository(turso);
```

Esto hace difícil testing y acopla el controlador a la implementación.

**Solución**: Usar inyección de dependencias como en `userControllers.ts`.

```typescript
// userAuthController.ts - Cambiar clase
export class userAuthController {
    constructor(private authControllerRepository: AuthRepository) { }
}
```

Y en la configuración de rutas:
```typescript
// routers/userAuthRouter.ts
const authRepository = new AuthRepository(turso);
const authController = new userAuthController(authRepository);
```

**Archivos a modificar**:
- `src/controllers/userAuthController.ts`
- `src/routers/userAuthRouter.ts`
- `src/routers/userProtectedAuthorized.ts` (verificar consistencia)

---

#### 8. Base de Datos - Top-Level Await

**Problema**: `src/Database/databases.ts` usa top-level await que puede causar problemas en algunos entornos.

```typescript
const turso_connect = await config.db_turso(local_db_path);
```

**Solución**: Envolver en una función async o usar un patrón de inicialización.

```typescript
// Database/databases.ts
import { createClient } from "@libsql/client"
import { config } from "../config.js";
import { log } from "../utils/logger.js"
import path from "path"

const local_db_path = `file:${path.join(process.cwd(), "src", "Database", "databases.db")}`;

export async function initDatabase() {
  const turso_connect = await config.db_turso(local_db_path);
  
  if (!turso_connect.url) {
    throw new Error("Database URL is not configured");
  }

  const turso = createClient(turso_connect);

  try {
    await turso.execute("PRAGMA journal_mode=WAL;");
    await turso.execute("PRAGMA synchronous=NORMAL;");
    await turso.execute("PRAGMA cache_size=-64000;");
    await turso.execute("PRAGMA temp_store=MEMORY;");
    await turso.execute("PRAGMA mmap_size=268435456;");
  } catch (err) {
    log.error("Error al configurar base de datos:", err);
  }

  return turso;
}
```

**Archivos a modificar**:
- `src/Database/databases.ts`
- `src/run.ts` (agregar inicialización)
- Todos los archivos que importan `turso` directamente

---

#### 9. Sistema de Migraciones de Base de Datos

**Problema**: El esquema se aplica manualmente via `sheme.sql`. No hay control de versiones de base de datos.

**Solución**: Implementar sistema de migraciones.

```
src/Database/
├── databases.ts
├── sheme.sql
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_indexes.sql
    └── index.ts (runner)
```

**Archivos a crear**:
- `src/Database/migrations/` (directorio)
- `src/Database/migrations/001_initial_schema.sql`
- `src/Database/migrationRunner.ts`

---

#### 10. Validación de Variables de Entorno

**Problema**: `config.ts` no valida tipos de variables de entorno.

**Solución**: Usar biblioteca como `zod` o validación manual.

```typescript
// config.ts - Agregar validación
const parseNumber = (value: string | undefined, defaultVal: number): number => {
  if (!value) return defaultVal;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const config = {
  port: parseNumber(PORT, 3000),
  // ... resto
}
```

**Archivos a modificar**:
- `src/config.ts`

---

### 🟡 Medio (2-4 semanas)

> **Impacto**: Mejoras de rendimiento, mantenibilidad a largo plazo

#### 11. Capa de Servicios Completa

**Problema**: La lógica de negocio está mezclada en controladores. Falta una capa de servicios apropiada.

**Solución**: Crear servicios para encapsular lógica de negocio.

```
src/services/
├── urlService.ts         # Lógica de acortamiento de URLs
├── authService.ts        # Lógica de autenticación
└── emailService.ts       # (existente, expandir)
```

**Ejemplo de `urlService.ts`**:
```typescript
export class UrlService {
  constructor(private urlRepository: UserRepository) {}

  async shortenUrl(originalUrl: string, userId?: number) {
    // Validar URL
    // Generar short ID único (con reintentos si hay colisión)
    // Guardar en base de datos
    // Retornar URL acortada
  }

  async redirectUrl(shortUrl: string) {
    // Buscar en cache/base de datos
    // Incrementar contador de vistas
    // Retornar URL original
  }
}
```

**Archivos a crear**:
- `src/services/urlService.ts`
- `src/services/authService.ts`

**Archivos a modificar**:
- `src/controllers/userControllers.ts`
- `src/controllers/userAuthController.ts`

---

#### 12. Estrategia de Caché Mejorada

**Problema**: `urlShortAnonimusRepository.ts` tiene un caché básico en memoria sin TTL ni invalidación.

**Mejoras**:
- Agregar TTL (Time To Live) a entradas de caché
- Invalidación cuando se elimina/desactiva una URL
- Considerar usar Redis para producción

```typescript
interface CacheEntry {
  url: string;
  timestamp: number;
  ttl: number; // ms
}

class UrlCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 3600000; // 1 hora

  set(shortUrl: string, originalUrl: string, ttl?: number) {
    // ... implementación
  }

  get(shortUrl: string): string | null {
    // Verificar TTL antes de retornar
  }
}
```

**Archivos a modificar**:
- `src/repository/urlShortAnonimusRepository.ts`

---

#### 13. Manejo Centralizado de Errores

**Problema**: No hay un manejo centralizado de errores con tipos de error personalizados.

**Solución**: Crear sistema de errores personalizados.

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(errors: string[]) {
    super(400, 'Validation failed', true);
    this.errors = errors;
  }
  errors: string[];
}
```

**Archivos a crear**:
- `src/utils/AppError.ts`

**Archivos a modificar**:
- `src/main.ts` (middleware de errores)
- Todos los controladores

---

#### 14. Tests de Integración

**Problema**: Solo hay tests unitarios, falta testing de endpoints completos.

**Solución**: Agregar tests de integración con Supertest.

```typescript
// test/integration/auth.test.ts
describe('Auth API Integration', () => {
  beforeAll(async () => {
    // Setup test database
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(201);
  });
});
```

**Archivos a crear**:
- `test/integration/` (directorio)
- `test/integration/auth.test.ts`
- `test/integration/url.test.ts`
- `test/helpers/` (utilidades para tests)

---

#### 15. Rate Limiting Dinámico

**Problema**: El rate limiting está configurado en `limitClick.ts` pero no es dinámico por usuario.

**Mejora**: Implementar rate limiting basado en usuario autenticado vs anónimo.

```typescript
// utils/limitClick.ts - Mejorar
export const createDynamicRateLimit = (options: {
  windowMs: number;
  max: (req: Request) => number;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    // ...
  });
};
```

**Archivos a modificar**:
- `src/utils/limitClick.ts`

---

### 🟢 Bajo (1-2 meses)

> **Impacto**: Mejoras cosméticas, documentación, características adicionales

#### 16. Documentación API con OpenAPI/Swagger

**Solución**: Agregar documentación automática de la API.

```typescript
// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERDL URL Shortener API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

**Archivos a crear**:
- `src/docs/swagger.ts`
- `src/docs/schemas/` (definiciones de esquemas)

---

#### 17. Logging Estructurado y Monitoreo

**Mejora**: Agregar más contexto a los logs y métricas.

```typescript
// utils/logger.ts - Mejorar
export const log = {
  info: (message: string, meta?: Record<string, unknown>) => 
    logger.info(message, { ...meta, timestamp: new Date().toISOString() }),
  // ...
};
```

Considerar integrar con servicios como Datadog, New Relic, o Prometheus.

---

#### 18. Normalización de Nombres y Estilo

**Problema**: Inconsistencia en nombres de clases y archivos.

| Actual | Sugerido |
|--------|----------|
| `userAuthController.ts` | `authController.ts` |
| `userAuthRepository.ts` | `authRepository.ts` |
| `urlShortAnonimusRepository.ts` | `urlRepository.ts` |
| `userControllers.ts` | `urlController.ts` |
| `userProtectedAuthorized.ts` | `protectedRoutes.ts` |

**Nota**: Esto requiere cambios extensivos y debe hacerse con cuidado.

---

#### 19. Esquema de Base de Datos - Limpieza

**Problema**: `subscription_active` y `subscription_tier` parecen redundantes en la tabla `users`.

**Solución**: Evaluar si ambos son necesarios o unificar.

```sql
-- Opción: Eliminar subscription_active, usar solo subscription_tier
ALTER TABLE users DROP COLUMN subscription_active;
```

---

#### 20. API Response Estandarización

**Problema**: Las respuestas de la API no siguen un formato consistente.

**Solución**: Crear formato estándar.

```typescript
// utils/apiResponse.ts
export const successResponse = (data: any, message?: string) => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, errors?: any) => ({
  success: false,
  message,
  errors,
});
```

**Archivos a crear**:
- `src/utils/apiResponse.ts`

---

## Detalles por Categoría

### Seguridad

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 1 | JWT Secret por defecto | 🔴 Crítico | `config.ts` |
| 2 | Cookies inconsistentes | 🔴 Crítico | `userAuthController.ts` |
| 3 | Bug en logger (Production) | 🔴 Crítico | `logger.ts` |
| - | CORS configuración | 🟡 Medio | `main.ts`, `config.ts` |
| - | Headers de seguridad (Helmet) | 🟢 Bajo | Nuevo middleware |

### Calidad de Código

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 4 | Manejo errores inconsistente | 🔴 Crítico | Múltiples |
| 5 | Validación URL faltante | 🔴 Crítico | `userControllers.ts` |
| 6 | Tipos `any` | 🟠 Alto | `types.ts`, repositorios |
| 13 | Errores personalizados | 🟡 Medio | Nuevo archivo |
| 18 | Nombres inconsistentes | 🟢 Bajo | Múltiples |

### Arquitectura

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 7 | Inyección dependencias | 🟠 Alto | Controladores, rutas |
| 8 | Top-level await DB | 🟠 Alto | `databases.ts` |
| 11 | Capa de servicios | 🟡 Medio | Nuevos archivos |
| 12 | Estrategia caché | 🟡 Medio | `urlShortAnonimusRepository.ts` |

### Base de Datos

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 9 | Migraciones | 🟠 Alto | Nuevo sistema |
| 19 | Limpieza esquema | 🟢 Bajo | `sheme.sql` |

### Testing

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 14 | Tests integración | 🟡 Medio | Nuevos tests |
| - | Cobertura mayor al 80% | 🟡 Medio | Tests existentes |
| - | Mocks apropiados | 🟠 Alto | Tests existentes |

### Documentación

| # | Issue | Prioridad | Archivos |
|---|-------|-----------|---------|
| 16 | OpenAPI/Swagger | 🟢 Bajo | Nuevos archivos |
| - | JSDoc en funciones | 🟢 Bajo | Archivos existentes |
| - | README actualizado | 🟢 Bajo | `README.md` |

---

## Plan de Implementación

### Fase 1: Seguridad y Estabilidad (Semanas 1-2)

1. **Día 1-2**: Corregir configuración JWT y validación de entorno
2. **Día 3-4**: Estandarizar manejo de errores (eliminar `console.error`)
3. **Día 5**: Validación de URLs en `userControllers.ts`
4. **Semana 2**: Corregir configuración de cookies y CORS

### Fase 2: Refactorización de Tipos y Arquitectura (Semanas 3-4)

1. **Semana 3**: Eliminar todos los tipos `any`, definir interfaces apropiadas
2. **Semana 4**: Implementar inyección de dependencias consistente, refactorizar `userAuthController.ts`

### Fase 3: Base de Datos y Rendimiento (Semanas 5-6)

1. **Semana 5**: Sistema de migraciones, refactorizar `databases.ts`
2. **Semana 6**: Mejorar estrategia de caché, agregar TTL

### Fase 4: Testing y Calidad (Semanas 7-8)

1. **Semana 7**: Tests de integración, mejorar cobertura
2. **Semana 8**: Capa de servicios, errores personalizados

### Fase 5: Mejoras y Documentación (Semanas 9-12)

1. **Semanas 9-10**: Documentación API, Swagger
2. **Semanas 11-12**: Monitoreo, logging avanzado, limpieza de código

---

## Métricas de Éxito

### Antes de Refactorización

- Cobertura de tests: ~30-40%
- Tipos `any`: 15+ ocurrencias
- `console.error`: 8 ocurrencias
- Archivos con errores de TypeScript: N/A (no verificado)

### Objetivos Después de Refactorización

- Cobertura de tests: >80%
- Tipos `any`: 0 ocurrencias
- `console.error`: 0 ocurrencias (usar logger)
- Errores de TypeScript: 0
- Documentación API: Completa (Swagger)
- Vulnerabilidades de seguridad: 0 (scan con `npm audit`)

### Herramientas de Medición

```bash
# Cobertura de tests
npm test -- --coverage

# Linting
npm run lint  # (agregar eslint si no existe)

# TypeScript errors
npx tsc --noEmit

# Security audit
npm audit

# Bundle size (si aplica)
npm run build && du -sh dist/
```

---

## Apéndice A: Comandos Útiles

```bash
# Verificar errores TypeScript
npx tsc --noEmit

# Ejecutar tests con cobertura
npm test -- --coverage

# Auditoría de seguridad
npm audit --omit=dev

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json && npm install

# Verificar tamaño del bundle
npm run build && du -sh dist/

# Ejecutar con variables de entorno de producción
NODE_ENV=production npm start
```

---

## Apéndice B: Dependencias Sugeridas para Refactorización

```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-config-standard": "^17.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "dependencies": {
    "zod": "^3.24.0",  // Validación de esquemas
    "helmet": "^8.0.0",  // Seguridad headers
    "express-validator": "^7.0.0",  // Validación requests
    "swagger-ui-express": "^5.0.0",  // Documentación
    "yamljs": "^0.3.0"
  }
}
```

---

## Conclusión

Este plan aborda los problemas más críticos primero, asegurando que la aplicación sea segura y estable antes de proceder con mejoras arquitectónicas. La implementación gradual permite entregar valor continuo mientras se reduce la deuda técnica.

**Recomendación**: Comenzar con la Fase 1 inmediatamente, ya que los problemas de seguridad (JWT secret, cookies) representan riesgos reales en producción.
