# Architecture and Project Structure Planning

This document details the architecture and structure planning for the application portfolio project, which will be composed of a backend in NestJS with DDD architecture, a frontend in React, and will use PostgreSQL as the database, all orchestrated via Docker Compose.

## 1. Project Folder Structure

The main folder structure will be organized as follows:

```
.
├── backend/          # NestJS Application (API)
├── frontend/         # React Application (User Interface)
├── docker/           # Docker configuration files (docker-compose.yml, Dockerfiles)
└── README.md         # General project documentation
```

## 2. Backend (NestJS with DDD Architecture)

The backend will be developed using NestJS, a progressive Node.js framework for building efficient, scalable, and reliable applications. The Domain-Driven Design (DDD) architecture will be applied to ensure a clear separation of responsibilities and facilitate system maintenance and evolution.

### 2.1. DDD Architecture Layers

- **Domain:** Contains the core business logic, entities, value objects, aggregates, repositories (interfaces), and domain services. It is independent of any infrastructure technology.
- **Application:** Orchestrates domain logic to perform specific use cases. Contains DTOs (Data Transfer Objects) and application services that coordinate operations.
- **Infrastructure:** Implements interfaces defined in the domain (repositories), handles data persistence (PostgreSQL), external communication (APIs), and other technical concerns.
- **Presentation (Presentation/API):** Entry layer that exposes API endpoints. Contains controllers that receive HTTP requests, validate DTOs, and call application services.

### 2.2. Main Modules

The main backend modules will include:

- **Auth:** Authentication and authorization management (login, registration, JWT).
- **Applications:** CRUD for portfolio applications/services.
- **Users:** User management (especially admin).

### 2.3. Authentication and Authorization

An authentication system based on JWT (JSON Web Tokens) will be implemented. Only users with `admin` profile will have permission to register new applications.

## 3. Frontend (React)

The frontend will be built with React, a JavaScript library for building user interfaces. It will be a Single Page Application (SPA).

### 3.1. Main Components

- **Home Page:** List of registered applications, similar to a marketplace.
- **Application Details:** Display of detailed application information (URL, documentation, description, redirection).
- **Admin Dashboard:** Interface for administrators to register, edit, and remove applications.
- **Login:** Login page for administrators.

### 3.2. State Management

Context API or Redux (if complexity justifies) will be used for global state management.

## 4. Database (PostgreSQL)

PostgreSQL will be the relational database used to store application and user information.

## 5. Docker Compose

Docker Compose will be used to orchestrate backend, frontend, and database services, facilitating development, testing, and deployment.

### 5.1. Services

- `backend`: Container for the NestJS application.
- `frontend`: Container for the React application (serving static files).
- `db`: Container for the PostgreSQL database.

## 6. Next Steps

1. Configure Docker and PostgreSQL environment.
2. Start NestJS backend development.
3. Start React frontend development.
4. Integrate and test the system.
5. Package the project.
