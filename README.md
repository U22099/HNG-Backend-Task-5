# User Service API

A robust and scalable user management microservice built with Node.js, Fastify, and Prisma. This service provides a complete solution for user authentication, profile management, and contact preferences through a clean, high-performance RESTful API.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-5.x-black?style=for-the-badge&logo=fastify)
![Prisma](https://img.shields.io/badge/Prisma-6.x-teal?style=for-the-badge&logo=prisma)

## Features

- **Secure Authentication**: Implements JWT-based authentication with access and refresh tokens.
- **User Profile Management**: Endpoints for creating, retrieving, and updating user profiles.
- **Contact Preferences**: Allows users to manage their notification preferences (email, push).
- **High-Performance**: Built on Fastify, a low-overhead web framework, for maximum speed.
- **Type-Safe**: Developed entirely in TypeScript with strict typing for improved reliability.
- **Robust Database Layer**: Uses Prisma ORM for type-safe database access and schema management.

## Technologies Used

| Technology                                    | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| [Node.js](https://nodejs.org/)                | JavaScript runtime environment           |
| [TypeScript](https://www.typescriptlang.org/) | Superset of JavaScript with static typing|
| [Fastify](https://www.fastify.io/)            | High-performance web framework           |
| [Prisma](https://www.prisma.io/)              | Next-generation Node.js and TypeScript ORM|
| [PostgreSQL](https://www.postgresql.org/)     | Open-source relational database          |
| [JWT](https://jwt.io/)                        | Standard for creating access tokens      |
| [Bcrypt](https://www.npmjs.com/package/bcrypt)| Library for hashing passwords            |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- A running PostgreSQL instance

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/U22099/HNG-Backend-Task-5.git
    cd HNG-Backend-Task-5
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Update the variables in the `.env` file with your configuration.

4.  **Sync the database schema**
    This command applies your Prisma schema to the database without generating migration files.
    ```bash
    npx prisma db push
    ```

5.  **Generate the Prisma Client**
    This command generates the type-safe Prisma Client based on your schema.
    ```bash
    npx prisma generate
    ```

### Environment Variables

All required environment variables must be defined in a `.env` file.

| Variable             | Description                                          | Example                                                              |
| -------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`       | Connection string for your PostgreSQL database.      | `postgresql://postgres:password@localhost:5432/userdb?schema=public` |
| `JWT_SECRET`         | Secret key for signing standard JWT access tokens.   | `super-secret-jwt-key-change-in-prod`                                |
| `SERVICE_JWT_SECRET` | Secret key for service-to-service communication.     | `super-secret-service-key`                                           |

### Running the Application

To start the server in development mode, run:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

## API Documentation

### Base URL

All API endpoints are prefixed with `/api`.
`http://localhost:3001/api`

### Health Check

#### GET /health

A simple health check endpoint to verify that the service is running.

**Response**:
```json
{
  "status": "ok"
}
```

### Endpoints

#### Authentication

#### POST /v1/auth/register

Registers a new user in the system.

**Request**:
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone_number": "1234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "email": "jane.doe@example.com",
    "created_at": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: Missing required fields (`email`, `password`, `first_name`, `last_name`).
- `400 Bad Request`: Registration failed (e.g., email already exists).
- `500 Internal Server Error`: An unexpected error occurred on the server.

---

#### POST /v1/auth/login

Authenticates a user and returns JWT access and refresh tokens.

**Request**:
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "token_type": "Bearer",
    "user_id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f"
  }
}
```

**Errors**:

- `400 Bad Request`: Missing `email` or `password`.
- `400 Bad Request`: Invalid credentials.
- `500 Internal Server Error`: An unexpected error occurred on the server.

---

#### POST /v1/auth/refresh

Generates a new access token using a valid refresh token.

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

**Errors**:

- `401 Unauthorized`: The provided refresh token is invalid, expired, or not of type `refresh`.
- `500 Internal Server Error`: An unexpected error occurred on the server.

---

#### User Management

_Note: All user management endpoints require an `Authorization: Bearer <access_token>` header._

#### GET /v1/users/:user_id

Retrieves a user's public profile information.

**Request**:
- No request body required.
- URL parameter `user_id` must be the ID of the user to retrieve.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user_id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "phone_number": "1234567890",
    "is_active": true,
    "email_verified": false,
    "phone_verified": false,
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:

- `401 Unauthorized`: Invalid or missing access token.
- `403 Forbidden`: The authenticated user is not authorized to access this resource.
- `404 Not Found`: User with the specified `user_id` does not exist.
- `500 Internal Server Error`: An unexpected error occurred.

---

#### PUT /v1/users/:user_id

Updates a user's profile information.

**Request**:
```json
{
  "firstName": "Janet",
  "lastName": "Doer",
  "phoneNumber": "0987654321"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "updated_at": "2023-10-27T11:00:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: No data provided for update.
- `401 Unauthorized`: Invalid or missing access token.
- `403 Forbidden`: The authenticated user is not authorized to modify this resource.
- `404 Not Found`: User with the specified `user_id` does not exist.
- `500 Internal Server Error`: An unexpected error occurred.

---

#### GET /v1/users/:user_id/contact

Retrieves a user's contact details and notification preferences.

**Request**:
- No request body required.
- URL parameter `user_id` must be the ID of the user.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user_id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "email": "jane.doe@example.com",
    "phone_number": "1234567890",
    "push_token": null,
    "prefers_email": true,
    "prefers_push": true,
    "push_token_last_updated": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:

- `401 Unauthorized`: Invalid or missing access token.
- `403 Forbidden`: The authenticated user is not authorized to access this resource.
- `404 Not Found`: User with the specified `user_id` does not exist.
- `500 Internal Server Error`: An unexpected error occurred.

---

#### PUT /v1/users/:user_id/contact

Updates a user's notification preferences.

**Request**:
```json
{
  "prefers_email": false,
  "prefers_push": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preference updated successfully",
  "data": {
    "id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "prefers_email": false,
    "prefers_push": true
  }
}
```

**Errors**:

- `400 Bad Request`: No preference data provided for update.
- `401 Unauthorized`: Invalid or missing access token.
- `403 Forbidden`: The authenticated user is not authorized to modify this resource.
- `404 Not Found`: User with the specified `user_id` does not exist.
- `500 Internal Server Error`: An unexpected error occurred.

---

#### PUT /v1/users/:user_id/push_token

Updates a user's push notification token for mobile devices.

**Request**:
```json
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Push token updated successfully",
  "data": {
    "id": "c1f7b5a8-4c1f-4b1f-8c1f-9b1f7c1f8c1f",
    "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "push_token_last_updated": "2023-10-27T12:00:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: `push_token` is required in the request body.
- `401 Unauthorized`: Invalid or missing access token.
- `403 Forbidden`: The authenticated user is not authorized to modify this resource.
- `404 Not Found`: User with the specified `user_id` does not exist.
- `500 Internal Server Error`: An unexpected error occurred.

## License

This project is not licensed.

## Author

- **Name**: Daniel
- **Twitter**: `[@dan_22099]`

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)