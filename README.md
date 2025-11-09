# User Service API

## Overview
This project is a high-performance user management and authentication API built with TypeScript. It leverages the Fastify framework for speed and the Prisma ORM for robust database interactions with a PostgreSQL database.

## Features
- **Fastify**: Provides a high-performance, low-overhead web framework for building efficient APIs.
- **Prisma**: Serves as a next-generation ORM for type-safe database access and management.
- **TypeScript**: Ensures code quality and scalability with static typing.
- **JWT Authentication**: Implements secure, token-based authentication using JSON Web Tokens for protected routes.
- **Password Hashing**: Uses `bcrypt` to securely hash and store user passwords.

## Getting Started
### Installation
Follow these steps to set up and run the project locally.

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
    Create a `.env` file in the root directory and copy the contents of `.env.example`.
    ```bash
    cp .env.example .env
    ```
    Update the variables in the `.env` file with your configuration.

4.  **Sync the database schema**
    This command pushes the Prisma schema to your database.
    ```bash
    npm run updatedb
    ```

5.  **Run the development server**
    This command builds the project and starts the server.
    ```bash
    npm run dev
    ```
    The server will be running at `http://localhost:3001`.

### Environment Variables
The following environment variables are required for the application to run.

-   `DATABASE_URL`: The connection string for your PostgreSQL database.
    -   Example: `postgresql://postgres:password@localhost:5432/userdb?schema=public`
-   `JWT_SECRET`: A secret key for signing JWT access and refresh tokens.
    -   Example: `super-secret-jwt-key-change-in-prod`
-   `SERVICE_JWT_SECRET`: A secret key for internal service-to-service communication (if applicable).
    -   Example: `super-secret-service-key`

## API Documentation
### Base URL
`http://localhost:3001`

### Endpoints
#### POST /v1/auth/register
Registers a new user in the system.

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "strongPassword123",
  "phone_number": "1234567890"
}
```
*Required fields: `first_name`, `last_name`, `email`, `password`*

**Response**:
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user_id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "email": "john.doe@example.com",
        "created_at": "2023-10-27T10:00:00.000Z"
    }
}
```

**Errors**:
- `500 Internal Server Error`: If required fields are missing or registration fails for other reasons.

---
#### POST /v1/auth/login
Authenticates a user and returns access and refresh tokens.

**Request**:
```json
{
  "email": "john.doe@example.com",
  "password": "strongPassword123"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 3600,
        "token_type": "Bearer",
        "user_id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a"
    }
}
```

**Errors**:
- `500 Internal Server Error`: If credentials are invalid or required fields are missing.

---
#### POST /v1/auth/refresh
Generates a new access token using a valid refresh token.

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
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
- `500 Internal Server Error`: If the refresh token is invalid or expired.

---
#### GET /v1/users/:user_id
Retrieves the profile information for a specific user. This is a protected route and requires authentication.

**Request**:
-   **Headers**: `Authorization: Bearer <access_token>`
-   **URL Params**: `user_id` (string)

**Response**:
```json
{
    "success": true,
    "data": {
        "user_id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
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
- `401 Unauthorized`: If the token is missing, invalid, or expired.
- `403 Forbidden`: If the authenticated user is trying to access another user's data.
- `404 Not Found`: If the user with the specified `user_id` does not exist.

---
#### GET /v1/users/:user_id/contact
Retrieves the contact preferences and details for a specific user. This is a protected route.

**Request**:
-   **Headers**: `Authorization: Bearer <access_token>`
-   **URL Params**: `user_id` (string)

**Response**:
```json
{
    "success": true,
    "data": {
        "user_id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "email": "john.doe@example.com",
        "phone_number": "1234567890",
        "push_token": null,
        "prefers_email": true,
        "prefers_push": true,
        "push_token_last_updated": "2023-10-27T10:00:00.000Z"
    }
}
```

**Errors**:
- `401 Unauthorized`: If the token is missing, invalid, or expired.
- `403 Forbidden`: If the authenticated user is trying to access another user's data.
- `404 Not Found`: If the user with the specified `user_id` does not exist.

---
#### PUT /v1/users/:user_id
Updates a user's profile information. This is a protected route.

**Request**:
-   **Headers**: `Authorization: Bearer <access_token>`
-   **URL Params**: `user_id` (string)
-   **Body**:
    ```json
    {
      "firstName": "Jonathan",
      "lastName": "Doer",
      "phoneNumber": "0987654321"
    }
    ```
    *All fields are optional.*

**Response**:
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "updated_at": "2023-10-27T11:00:00.000Z"
    }
}
```

**Errors**:
- `400 Bad Request`: If no data is provided in the request body.
- `401 Unauthorized`: If the token is missing, invalid, or expired.
- `403 Forbidden`: If the authenticated user is trying to access another user's data.
- `404 Not Found`: If the user with the specified `user_id` does not exist.

---
#### PUT /v1/users/:user_id/contact
Updates a user's contact preferences. This is a protected route.

**Request**:
-   **Headers**: `Authorization: Bearer <access_token>`
-   **URL Params**: `user_id` (string)
-   **Body**:
    ```json
    {
      "prefers_email": false,
      "prefers_push": true
    }
    ```
    *All fields are optional.*

**Response**:
```json
{
    "success": true,
    "message": "Preference updated successfully",
    "data": {
        "id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "prefers_email": false,
        "prefers_push": true
    }
}
```

**Errors**:
- `400 Bad Request`: If no data is provided in the request body.
- `401 Unauthorized`: If the token is missing, invalid, or expired.
- `403 Forbidden`: If the authenticated user is trying to access another user's data.
- `404 Not Found`: If the user with the specified `user_id` does not exist.

---
#### PUT /v1/users/:user_id/push_token
Updates a user's push notification token. This is a protected route.

**Request**:
-   **Headers**: `Authorization: Bearer <access_token>`
-   **URL Params**: `user_id` (string)
-   **Body**:
    ```json
    {
      "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    }
    ```

**Response**:
```json
{
    "success": true,
    "message": "Push token updated successfully",
    "data": {
        "id": "c1f7b5c0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
        "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        "push_token_last_updated": "2023-10-27T12:00:00.000Z"
    }
}
```

**Errors**:
- `400 Bad Request`: If `push_token` is not provided in the request body.
- `401 Unauthorized`: If the token is missing, invalid, or expired.
- `403 Forbidden`: If the authenticated user is trying to access another user's data.
- `404 Not Found`: If the user with the specified `user_id` does not exist.

---
#### GET /health
A health check endpoint to verify that the service is running.

**Request**:
None

**Response**:
```json
{
  "status": "ok"
}
```

**Errors**:
- None