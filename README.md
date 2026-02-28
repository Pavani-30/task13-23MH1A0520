# task13-23MH1A0520

# 🔐 RESTful Authentication Service

A production-ready RESTful Authentication Service built using Node.js, Express, PostgreSQL, Redis, Docker, JWT, OAuth 2.0, and RBAC.

This project implements secure authentication and authorization mechanisms suitable for modern web and mobile applications.

---

## 🚀 Features

### 🔑 Authentication
- Local Authentication (Email & Password)
- OAuth 2.0 Login (Google, GitHub)
- JWT Access Token (Short-lived)
- JWT Refresh Token (Long-lived)
- Secure HttpOnly Refresh Cookies
- Redis-based Session Management

### 🛡 Authorization
- Role-Based Access Control (RBAC)
- Protected Profile Routes
- Admin-only Endpoints

### 🔒 Security
- Password hashing using bcrypt
- Rate limiting (Brute-force protection)
- Input validation & sanitization
- Secure HTTP headers (Helmet)
- Structured error handling
- CORS configuration
- Redis session storage
- Token expiration & invalidation

### 🐳 DevOps
- Fully Dockerized setup
- PostgreSQL container
- Redis container
- Health checks
- Automatic database seeding

---

## 🏗 Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Backend Runtime |
| Express.js | REST API Framework |
| PostgreSQL | Primary Database |
| Redis | Session & Token Store |
| JWT | Stateless Authentication |
| bcrypt | Password Hashing |
| Docker | Containerization |
| OAuth 2.0 | Social Login |
| Helmet | Security Headers |
| express-validator | Input Validation |

---

## 📁 Project Structure
auth-service/
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── seeds/
│ └── init.sql
│
└── src/
├── app.js
├── server.js
│
├── config/
│ └── redis.js
│
├── controllers/
│ ├── auth.controller.js
│ └── user.controller.js
│
├── services/
│ └── auth.service.js
│
├── routes/
│ ├── auth.routes.js
│ └── user.routes.js
│
├── middleware/
│ ├── auth.middleware.js
│ ├── rbac.middleware.js
│ ├── rateLimiter.middleware.js
│ ├── validation.middleware.js
│ └── error.middleware.js
│
├── utils/
│ ├── jwt.js
│ └── response.js
│
└── validators/
├── auth.validator.js
└── user.validator.js


---

## Authentication Flow

### 🔹 Login Process

1. User logs in via email/password or OAuth
2. Server generates:
   - Access Token (15 minutes)
   - Refresh Token (7 days)
3. Access token returned in JSON response
4. Refresh token stored in HttpOnly cookie
5. Refresh token stored in Redis

---

### Accessing Protected Routes

Client sends:

Authorization: Bearer <access_token>


Server verifies JWT → Grants access.

---

###  Token Refresh Flow

1. Access token expires
2. Client calls `/api/auth/refresh`
3. Server validates refresh token
4. New access token generated

---

### Logout

1. Refresh token removed from Redis
2. Cookie cleared
3. Session terminated

---

## RBAC (Role-Based Access Control)

Roles Supported:
- USER
- ADMIN
- SUPER_ADMIN

### Example:

| Endpoint | Access |
|----------|--------|
| GET /api/profile | Authenticated Users |
| PUT /api/profile | Authenticated Users |
| GET /api/users | ADMIN Only |

RBAC is enforced via middleware.

---

## Database Schema

### Tables

- roles
- users
- auth_providers

### Relationships

- One Role → Many Users
- One User → Many OAuth Providers

---

##  Running with Docker

### 1️. Clone Repository


git clone <your-repo-url>
cd auth-service


---

### 2️. Create Environment File


cp .env.example .env


Update values inside `.env`.

---

### 3️. Start Application


docker compose up --build


---

### 4️. Verify Health

Open:


http://localhost:8080/health


Expected:


{
"status": "OK"
}


---

## API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| POST | /api/auth/refresh | Refresh Access Token |
| POST | /api/auth/logout | Logout User |
| GET | /api/auth/google | Google OAuth |
| GET | /api/auth/github | GitHub OAuth |

---

### 👤 User Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/profile | Authenticated |
| PUT | /api/profile | Authenticated |
| GET | /api/users | Admin Only |

---

## Security Best Practices Implemented

- JWT expiration
- Refresh token rotation
- Redis session validation
- HttpOnly cookies
- Strict CORS
- Rate limiting on auth endpoints
- Input validation
- Structured error responses
- Secure headers with Helmet
- Password hashing (bcrypt)

---

## Production-Level Features

- Stateless authentication
- Session invalidation
- OAuth account linking
- Role-based authorization
- Centralized error handling
- Consistent API response format
- Dockerized environment
- Database auto-seeding

---

## Testing

Use Postman or Thunder Client.

Example login request:


POST /api/auth/login
{
"email": "user@example.com
",
"password": "password123"
}


---

## Future Improvements

- Email verification
- Password reset flow
- Account lockout policy
- Audit logging
- API documentation (Swagger)
- Token blacklisting

---

## Learning Outcomes

This project demonstrates:

- RESTful API design
- OAuth 2.0 implementation
- JWT-based stateless authentication
- Secure session management
- Role-Based Access Control (RBAC)
- Production-ready backend architecture
- Docker containerization
- Secure coding practices