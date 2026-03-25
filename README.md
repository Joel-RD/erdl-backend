# 🔗 Shortener URL API

A robust and scalable URL shortener API built with **Node.js**, **Express**, and **LibSQL (Turso)**. It features a custom **Snowflake ID** generator for unique, sortable IDs and includes a full user authentication system with email verification.

---

## 🚀 Features

- **Custom ID Generation**: Uses a Snowflake algorithm (Timestamp + Machine ID + Sequence) combined with Base62 encoding for short, unique URLs (e.g., `a7X2k`).
- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies.
  - Register & Login.
  - Email Verification (Nodemailer).
  - Protected Routes.
- **Data Persistence**: LibSQL (SQLite compatibility) on Turso.
- **Security**:
  - Rate Limiting (prevents abuse).
  - CORS configuration.
  - Password Hashing (bcryptjs).
- **Architecture**: Clean separation of concerns (Controllers, Repositories, Services, Routers).

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [LibSQL / Turso](https://turso.tech/)
- **Authentication**: [JWT](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Utilities**: [Morgan](https://www.npmjs.com/package/morgan) (Logging)

---

## 📂 Project Structure

```text
src/
├── controllers/    # Request handlers (Auth, User logic)
├── models/         # TypeScript interfaces and types
├── routers/        # API Documentation & Route definitions
├── repository/     # Database access layer
├── services/       # Business logic (e.g., Email Service)
├── middleware/     # Auth checks, Rate limiting
├── utils/          # Helpers (Snowflake Generator, validation)
├── database/       # DB connection setup
├── config.ts       # Environment configuration
├── main.ts         # App initialization & Middleware setup
└── run.ts          # Server entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- A Turso database URL and Auth Token (or local SQLite file)
- Gmail account (for email sending) or SMTP credentials

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Joel-RD/shortener-url.git
    cd shortener-url
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Configure Environment**:
    Copy the example file and fill in your details:

    ```bash
    cp .env.example .env
    ```

    **Required Variables** in `.env`:
    - `DB_TURSO_URL`: Your database connection string.
    - `DB_TURSO_AUTH_TOKEN`: Your database auth token.
    - `JWT_SECRET`: Secret key for signing tokens.
    - `EMAIL_USER` / `EMAIL_PASS`: Credentials for sending verification emails.

4. **Run Development Server**:

    ```bash
    npm run dev
    ```

    The server will start at `http://localhost:3000`.

---

## 📡 API Reference

All endpoints return JSON responses.

### 🔗 URL Shortener

| Method | Endpoint        | Description                              | Body Example                         |
| :----- | :-------------- | :--------------------------------------- | :----------------------------------- |
| `POST` | `/api/v1/short` | Shorten a new URL                        | `{ "orig_url": "https://google.com"}` |
| `GET`  | `/:shortUrl`    | Redirect to original URL (e.g. `/a7X2k`) | N/A                                  |

**Response Examples:**

```json
// POST /api/v1/short
// Success (201)
{
  "message": "URL acortada con éxito.",
  "url_acortada": "http://localhost:3000/a7X2k"
}

// GET /:shortUrl
// Redirects to the original URL (302)
```

### 🔐 Authentication

| Method | Endpoint              | Description                                      |
| :----- | :-------------------- | :----------------------------------------------- |
| `POST` | `/api/v1/auth/register` | Register a new user                              |
| `POST` | `/api/v1/auth/login`    | Login and receive HttpOnly cookie                |
| `POST` | `/api/v1/auth/verify-email` | Verify email with code                    |
| `GET`  | `/api/v1/auth/user/profile` | **Protected**. Get user profile        |

**Request/Response Examples:**

```json
// POST /api/v1/auth/register
// Request
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response (201)
{
  "message": "User created successfully."
}

// POST /api/v1/auth/login
// Request
{
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response (200)
{
  "message": "Login successful."
}

// GET /api/v1/auth/user/profile
// Headers: Cookie: authTokenAuthorized=<token>
// Response (200)
{
  "message": "Profile accessed successfully",
  "user": {
    "email": "john@example.com"
  }
}
```

### ❌ Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Descriptive error message"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🧪 Scripts

- `npm run dev`: Start development server with Nodemon.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm start`: Run the built application.
- `npm run snowflake`: Run a demo of the Snowflake ID generator.
- `npm test`: Run test suite.

---

## 📄 License

This project is licensed under the ISC License.
