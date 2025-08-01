# Authentication System Setup

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tulisin_db
DB_USER=postgres
DB_PASSWORD=password
DB_POOL_SIZE=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
```

## Database Setup

1. Create your PostgreSQL database
2. Run the migration script to create the users table:

```sql
-- Run the contents of database/migrations/001_create_users_table.sql
```

## API Endpoints

The authentication system provides the following endpoints under `/api/v1/auth`:

- **POST** `/api/v1/auth/register` - Register a new user
- **POST** `/api/v1/auth/login` - User login
- **POST** `/api/v1/auth/logout` - User logout (requires authentication)
- **GET** `/api/v1/auth/me` - Get current user information (requires authentication)

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Usage Examples

### Register a new user

```json
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Login

```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Get current user (requires authentication)

```
GET /api/v1/auth/me
Authorization: Bearer <jwt-token>
```

### Logout (requires authentication)

```
POST /api/v1/auth/logout
Authorization: Bearer <jwt-token>
```
