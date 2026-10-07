# Inventory Management System

Full-stack inventory management project with a Spring Boot backend and Angular frontend.

## Project Structure

```text
inventory-management/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/         # Java source code
│   ├── src/main/resources/    # Spring configuration files
│   ├── pom.xml                # Maven dependencies and build config
│   └── mvnw                   # Maven wrapper
├── frontend/                 # Angular application
│   ├── src/                   # Angular source code
│   ├── angular.json           # Angular build config
│   ├── package.json           # npm scripts and dependencies
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Requirements

- Java 17 or newer
- Maven wrapper included in `backend/`
- Node.js and npm
- MySQL Server for the default database profile

## Database Setup

The default backend configuration uses MySQL:

```text
Database: latest_db
Host: localhost
Port: 3306
```

Create the database before starting the backend:

```sql
CREATE DATABASE latest_db;
```

You can set database and mail values through environment variables:

```bash
export DB_URL="jdbc:mysql://localhost:3306/latest_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME="root"
export DB_PASSWORD="your_mysql_password"
export JWT_SECRET="change-this-to-a-long-random-secret"
export MAIL_USERNAME="your_email@example.com"
export MAIL_PASSWORD="your_app_password"
export MAIL_FROM="your_email@example.com"
```

An example file is available at `backend/.env.example`.

## Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

If macOS blocks direct wrapper execution, use:

```bash
sh ./mvnw spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

Swagger/OpenAPI:

```text
http://localhost:8080/swagger-ui.html
http://localhost:8080/api-docs
```

## Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```text
http://localhost:4200
```

The frontend development environment calls:

```text
http://localhost:8080/api
```

## Optional Local H2 Profile

For quick testing without MySQL, the backend also includes a `local` profile using H2 in-memory database:

```bash
cd backend
sh ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

H2 console:

```text
http://localhost:8080/h2-console
```

JDBC URL:

```text
jdbc:h2:mem:inventory_local
```

## Build Commands

Backend:

```bash
cd backend
sh ./mvnw test
```

Frontend:

```bash
cd frontend
npm run build
```

## Notes

- Do not commit real passwords, email app passwords, database credentials, or JWT secrets.
- Use environment variables for production credentials.
- `node_modules`, Angular `dist`, backend `target`, logs, uploads, and IDE files are ignored by Git.
