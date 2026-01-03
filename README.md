# 🚀 JCoder - Developer Portfolio Platform

A modern, full-featured platform for developers to create, manage, and showcase their professional portfolios. Built with cutting-edge technologies and designed for both developers and recruiters.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Portfolio Sections](#-portfolio-sections)
- [Administrative Features](#-administrative-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Development](#-development)
- [Project Structure](#-project-structure)

## 🎯 Overview

JCoder is a comprehensive portfolio platform that allows developers to:
- Create beautiful, customizable portfolio pages
- Manage professional information and projects
- Track portfolio views and engagement
- Receive and manage messages from visitors
- Generate professional resume PDFs
- Showcase technologies, applications, and achievements

Each developer gets a unique portfolio URL (`/username`) that displays their professional profile in a modern, responsive interface.

## ✨ Features

### 🌐 Public Portfolio Page
- **Unique URL**: Each user has a personalized portfolio at `/username`
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **3D Visual Effects**: Interactive WebGL components powered by Three.js
- **Portfolio Analytics**: Track views and engagement metrics
- **Contact Form**: Visitors can send messages directly to portfolio owners

### 📊 Administrative Dashboard
- **Real-time Statistics**: View portfolio performance, views, and engagement
- **Analytics Charts**: Visual representation of portfolio metrics
- **Message Management**: Read and manage messages from portfolio visitors
- **Content Management**: Full CRUD operations for all portfolio sections

### 👤 User Management
- **Profile Customization**: Upload profile images, set bio, and personal information
- **Authentication**: Secure JWT-based authentication system
- **User Components**: Modular system for managing different portfolio sections

### 🛠️ Technology Management
- **Technology Library**: Add and manage technologies with expertise levels
- **Visual Display**: Showcase tech stack with custom icons and descriptions
- **Categorization**: Organize technologies by type and proficiency

### 📱 Application Management
- **Project Showcase**: Create detailed project entries with images and descriptions
- **Multiple Types**: Support for web, mobile, API, and library projects
- **Component System**: Flexible component structure for different project types
- **Image Uploads**: Upload and manage project images

### 💬 Messaging System
- **Visitor Messages**: Receive messages from portfolio visitors
- **Conversation Management**: Organize and track conversations
- **Read/Unread Status**: Manage message status and responses

### 📄 Resume Generation
- **PDF Export**: Generate professional resume PDFs from portfolio data
- **Multiple Templates**: Choose from different resume templates
- **Complete Data**: Includes all portfolio sections (education, experience, certificates, etc.)

## 📑 Portfolio Sections

Each portfolio page includes the following sections:

1. **Hero Section** 🎨
   - 3D animated background
   - Profile image and name
   - Quick navigation buttons

2. **About Me** 👤
   - Rich text description
   - Highlight cards with emojis
   - Call-to-action buttons

3. **Professional Experience** 💼
   - Company history
   - Position details with dates
   - Location and employment type
   - Current position indicators

4. **Projects & Applications** 🚀
   - Interactive carousel of projects
   - Project details and images
   - Technology tags
   - Links to live projects and repositories

5. **Technologies & Stacks** ⚙️
   - 3D interactive technology cards
   - Expertise levels
   - Technology icons and descriptions

6. **Education & Certifications** 🎓
   - Educational background
   - Certificate gallery
   - Institution details and dates

7. **References** 📝
   - Professional references
   - Contact information
   - Relationship details

8. **Contact** 📧
   - Message form for visitors
   - Social media links
   - Contact information

## 🔧 Administrative Features

### Dashboard
- Portfolio view statistics
- Engagement metrics
- Recent activity overview
- Performance charts

### Content Management
- **Applications**: Create, update, reorder, and delete projects
- **Technologies**: Manage technology library and expertise levels
- **User Components**: Edit About Me, Education, Experience, Certificates, References
- **Images**: Upload and manage profile images, project images, and certificates
- **Messages**: View and manage visitor messages

### User Settings
- Profile information
- Account management
- Portfolio visibility settings

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: MySQL 8.0 with TypeORM
- **Authentication**: JWT (Passport.js)
- **API Documentation**: Swagger/OpenAPI with Scalar
- **Caching**: Redis
- **File Upload**: Multer with Sharp for image processing
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js with React Three Fiber
- **Charts**: Recharts
- **PDF Generation**: jsPDF with html2canvas
- **HTTP Client**: Axios
- **Markdown**: react-markdown

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.4 or higher
- pnpm (package manager)
- Docker and Docker Compose (for containerized setup)
- MySQL 8.0 (or use Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JCoder
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   make up
   # Or manually:
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001/api/v1`
   - API Docs: `http://localhost:3001/docs`

### Local Development Setup

1. **Setup environment**
   ```bash
   make env
   ```

2. **Start database**
   ```bash
   make up.d
   ```

3. **Start backend** (in one terminal)
   ```bash
   make start.b
   # Or manually:
   cd backend
   pnpm install
   pnpm run start:dev
   ```

4. **Start frontend** (in another terminal)
   ```bash
   make start.f
   # Or manually:
   cd frontend
   pnpm install
   pnpm run dev
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_user
DATABASE_NAME=jcoder
DATABASE_PASSWORD=your_password
BACKEND_SYNCHRONIZE_DATABASE=false

# Backend
BACKEND_PORT=3001
BACKEND_JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_FRONTEND_PORT=3000
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3001/api/v1

# Initial Admin User
DATABASE_INITIAL_EMAIL_ADMIN=admin@example.com
DATABASE_INITIAL_PASSWORD_ADMIN=your_admin_password

# Email (optional, for production)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

### Database Migrations

Run migrations to set up the database schema:

```bash
cd backend
pnpm run migration:run
```

Generate a new migration:

```bash
pnpm run migration:generate src/migrations/MigrationName
```

## 💻 Development

### Backend Commands

```bash
cd backend

# Install dependencies
pnpm install

# Development mode
pnpm run start:dev

# Build
pnpm run build

# Production mode
pnpm run start:prod

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e

# Lint and format
pnpm run lint
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build
pnpm run build

# Production mode
pnpm run start
```

### Docker Commands

```bash
# Start all services
make up

# Start individual services
make up.d  # Database
make up.b  # Backend
make up.f  # Frontend

# Stop all services
make down

# Stop individual services
make down.d  # Database
make down.b  # Backend
make down.f  # Frontend

# Rebuild and restart
make up.b  # Rebuilds backend
make up.f  # Rebuilds frontend
```

## 📁 Project Structure

```
JCoder/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── @common/        # Shared modules (database, guards, interceptors)
│   │   ├── administration-by-user/  # Main business logic
│   │   │   ├── applications/        # Project management
│   │   │   ├── auth/                # Authentication
│   │   │   ├── dashboard/           # Analytics and stats
│   │   │   ├── images/              # Image upload and management
│   │   │   ├── messages/            # Messaging system
│   │   │   ├── technologies/        # Technology management
│   │   │   └── users/               # User management
│   │   ├── email/                   # Email service
│   │   ├── health/                  # Health checks
│   │   ├── portfolio-view/          # Portfolio view tracking
│   │   └── migrations/              # Database migrations
│   ├── test/                        # E2E tests
│   └── package.json
│
├── frontend/                # Next.js frontend application
│   ├── app/                 # Next.js App Router
│   │   ├── [username]/      # Dynamic portfolio pages
│   │   ├── register/        # Registration page
│   │   └── sign-in/         # Login page
│   ├── components/          # React components
│   │   ├── applications/    # Project components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── profile/         # Profile components
│   │   ├── resume/          # Resume generation
│   │   └── webgl/           # 3D WebGL components
│   ├── services/            # API service layer
│   ├── types/               # TypeScript type definitions
│   └── package.json
│
├── docker-compose.yml       # Docker Compose configuration
├── Makefile                 # Development shortcuts
└── README.md               # This file
```

## 📝 Additional Notes

- The platform includes comprehensive error handling and validation
- All API endpoints are protected with authentication and rate limiting
- Image uploads are automatically optimized using Sharp
- Portfolio views are tracked for analytics purposes
- The platform supports multiple resume templates
- All user data can be exported as PDF resumes

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ for developers by developers**
