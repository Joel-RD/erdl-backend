# 🔗 ERDL URL Shortener API
A robust and scalable URL shortener API built with **Node.js**, **Express 5**, **TypeScript**, and **LibSQL**. Features JWT-based authentication with email verification, interactive Swagger documentation, and secure cookie handling.

---

## ✨ Features
- **Short URL Generation**: Uses `nanoid` to generate unique, secure 8-character short identifiers
- **User Authentication**: Complete auth system with registration, login, email verification, and protected routes using JWT stored in HttpOnly cookies
- **Data Persistence**: LibSQL (Turso for production, local SQLite for development)
- **Security**: Helmet for HTTP headers, CORS configuration, rate limiting, bcryptjs password hashing
- **API Documentation**: Swagger UI available at `/api-docs` with OpenAPI 3.0 specs
- **Logging**: Winston structured logging with environment-aware output
- **Error Handling**: Centralized error middleware for consistent responses

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (v18+) & TypeScript 5
- **Framework**: Express.js 5
- **Database**: LibSQL (SQLite-compatible, Turso for production)
- **Authentication**: `jsonwebtoken`, `bcryptjs`
- **Email**: Nodemailer
- **Utilities**: `nanoid`, Winston, Morgan, Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Security**: Helmet, `express-rate-limit`, CORS

---

## 📂 Project Structure
```
src/
├── main.ts                 # App initialization, middleware setup, route mounting
├── run.ts                  # Server entry point with error handling
├── config.ts               # Centralized environment configuration
├── Database/               # Database layer
│   ├── databases.ts        # LibSQL client initialization
│   ├── databases.db        # Local SQLite database (development)
│   └── sheme.sql          # Database schema (note: typo in filename)
├── models/                 # TypeScript interfaces and types
├── routers/                # API route definitions
├── controllers/            # Request handlers (HTTP logic)
├── repository/             # Data access layer (DB queries)
├── services/               # Business logic (email sending)
├── Middleware/             # Custom middleware (auth JWT)
├── utils/                  # Helper utilities (nanoid, logger, JWT, validation)
└── docs/                   # Swagger/OpenAPI configuration
```

---

## 🚀 Getting Started
### Prerequisites
- Node.js v18 or higher
- npm or pnpm
- Turso account (for production) or local SQLite
- SMTP credentials (for email verification)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Joel-RD/shortener-url.git
   cd shortener-url
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the example file and fill in your details:
   ```bash
   cp .env.example .env
   ```

   **Required variables** (see [Environment Variables](#environment-variables) for full list):
   - `DB_TURSO_URL` / `DB_TURSO_AUTH_TOKEN`: For production Turso database
   - `JWT_SECRET`: Required in production for signing JWTs
   - `EMAIL_*`: SMTP credentials for sending verification emails

4. Run the development server:
   ```bash
   npm run dev
   ```
   The server starts at `http://localhost:3000`. Swagger docs available at `http://localhost:3000/api-docs`.

---

## 🔐 Environment Variables
Copy `.env.example` to `.env` and configure the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server listening port | 3000 |
| `NODE_ENV` | `development` or `production` | `development` |
| `DB_TURSO_URL` | Turso database URL (production only) | Local SQLite path |
| `DB_TURSO_AUTH_TOKEN` | Turso authentication token (production only) | - |
| `JWT_SECRET` | Secret key for signing JWTs (required in production) | Random dev secret |
| `DOMAIN_FOR_FRONTEND` | Allowed CORS origin for frontend requests | `http://localhost:3000` |
| `HTTP_ONLY` | HttpOnly flag for auth cookies | `true` |
| `SECURE` | Secure flag for cookies (requires HTTPS) | `true` |
| `SAME_SITE` | SameSite cookie policy | `lax` |
| `MAX_AGE` | Cookie max age in milliseconds | 7 days (604800000) |
| `PATH` | Cookie path | `/` |
| `EMAIL_HOST` | SMTP host (e.g., `smtp.gmail.com`) | - |
| `EMAIL_PORT` | SMTP port | - |
| `EMAIL_SECURE` | Use TLS for SMTP | - |
| `EMAIL_USER` | SMTP username/email | - |
| `EMAIL_PASS` | SMTP password/app password | - |

---

## 📜 Available Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Nodemon hot-reload |
| `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `npm start` | Run production build from `dist/` |
| `npm test` | Run Jest test suite with experimental VM modules |
| `npm run stress` | Run stress tests in development mode |
| `npm run stress:full` | Run stress tests in production mode |

---

## 📡 API Reference
Base URL: `http://localhost:3000/api/v1`

### URL Shortener Endpoints
| Method | Endpoint | Description | Body Example |
|--------|----------|-------------|--------------|
| `POST` | `/short` | Shorten a new URL | `{"orig_url": "https://example.com"}` |
| `GET` | `/:shortUrl` | Redirect to original URL (302 status) | N/A |

### Authentication Endpoints
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|------------|
| `POST` | `/auth/register` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login and set HttpOnly auth cookie | ❌ |
| `POST` | `/auth/verify-email` | Verify email with verification code | ❌ |
| `GET` | `/auth/user/profile` | Get authenticated user profile | ✅ |

### Response Format
All API responses follow a consistent JSON format:
- **Success**:
  ```json
  {
    "message": "Operation successful",
    "data": { ... }
  }
  ```
- **Error**:
  ```json
  {
    "error": "Error Type",
    "message": "Descriptive error message"
  }
  ```

### Common Status Codes
- `200` / `201`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## 📚 Swagger API Documentation
Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```
Generated using Swagger JSDoc and served with `swagger-ui-express`. Configuration is in `src/docs/swagger.ts`.

---

## 🧪 Testing
Run the test suite:
```bash
npm test
```
Uses Jest with Supertest for integration testing. Test files are located in the `test/` directory.

---

## 🔒 Security Practices
- **Helmet**: Sets secure HTTP headers to prevent common vulnerabilities
- **CORS**: Configured to only allow trusted frontend origins
- **Rate Limiting**: Prevents abuse of URL shortening endpoints
- **HttpOnly Cookies**: JWT tokens are stored in HttpOnly, Secure, SameSite cookies to prevent XSS
- **Password Hashing**: Uses bcryptjs to hash passwords before storage
- **Environment Validation**: Throws errors if required production variables are missing

---

## 📄 License
This project is licensed under the ISC License.
