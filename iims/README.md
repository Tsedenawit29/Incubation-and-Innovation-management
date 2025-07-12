# IIMS - Incubation and Innovation Management System

A Spring Boot application for managing incubation and innovation centers with role-based authentication.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Multiple user roles (SUPER_ADMIN, TENANT_ADMIN, STARTUP, etc.)
- **PostgreSQL Database** - Robust data persistence
- **Docker Support** - Easy deployment with Docker and Docker Compose
- **RESTful API** - Clean API endpoints for authentication

## 🛠️ Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL (for local development)

## 📋 Setup Instructions

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iims
   ```

2. **Set up PostgreSQL database**
   - Create a database named `iims`
   - Update `application.properties` with your database credentials

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   cd iims
   mvn clean package
   docker-compose up --build
   ```

## 🔐 Authentication Flow

### 1. Register Super Admin (First Time Only)

```bash
POST /api/auth/register-super-admin
Content-Type: application/json

{
  "email": "admin@iims.com",
  "password": "123456",
  "fullName": "Super Admin"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@iims.com",
  "password": "123456"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Use JWT Token

Include the token in the Authorization header for protected endpoints:
```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure

```
com.iims.iims/
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── JwtService.java
│   ├── JwtAuthFilter.java
│   └── dto/
│       ├── AuthRequest.java
│       ├── AuthResponse.java
│       └── RegisterRequest.java
├── config/
│   └── SecurityConfig.java
├── user/
│   ├── User.java
│   ├── UserRepository.java
│   ├── CustomUserDetailsService.java
│   └── Role.java
└── IimsApplication.java
```

## 👥 User Roles

- **SUPER_ADMIN** - System administrator with full access
- **TENANT_ADMIN** - Tenant-specific administrator
- **STARTUP** - Startup company user
- **MENTOR** - Mentor user
- **COACH** - Coach user
- **FACILITATOR** - Facilitator user
- **INVESTOR** - Investor user
- **ALUMNI** - Alumni user

## 🔧 Configuration

### Application Properties

Key configuration in `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/iims
spring.datasource.username=postgres
spring.datasource.password=postgres

# JWT
jwt.secret=yourSecretKey
jwt.expiration=86400000

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 🧪 Testing

### Using Postman

1. **Register Super Admin**
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/register-super-admin`
   - Body: JSON with email, password, fullName

2. **Login**
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/login`
   - Body: JSON with email and password

3. **Access Protected Endpoints**
   - Add header: `Authorization: Bearer <token>`

## 🐳 Docker Commands

```bash
# Build the application
mvn clean package

# Run with Docker Compose
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📝 API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register-super-admin` | Register super admin | Not required |
| POST | `/api/auth/login` | User login | Not required |

## 🔒 Security

- JWT-based authentication
- Password encryption with BCrypt
- Role-based authorization
- Stateless session management

## 🚀 Next Steps

After setting up the basic authentication:

1. **Tenant Management** - Add tenant registration and management
2. **User Management** - Add user CRUD operations
3. **Role-based Dashboards** - Implement role-specific features
4. **API Documentation** - Add OpenAPI/Swagger documentation

## 📞 Support

For issues and questions, please create an issue in the repository. 