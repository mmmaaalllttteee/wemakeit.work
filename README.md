# WMIW Platform - We Make IT Work

A modern, full-stack platform for the music industry with collaborative tools, analytics, and AI-powered features.

## 🎯 Overview

WMIW is a comprehensive platform designed for music industry professionals including labels, artists, management companies, and booking agencies. It combines project management, analytics, content planning, and AI-powered insights in one unified system.

### Key Features

#### Phase 0 - Foundation

- ✅ **Authentication System**: JWT-based auth with registration, login, password reset
- ✅ **Organization Management**: Multi-tenant architecture with role-based access control (RBAC)
- ✅ **Project Management**: Create and manage multiple projects per organization
- ✅ **Kanban Boards**: Drag & drop task management with customizable columns
- ✅ **Task Management**: Create, update, move, and delete tasks with assignments and due dates
- ✅ **Liquid Glass Design**: Apple-inspired frosted glass UI with dynamic theming
- ✅ **Auto Theme Switching**: Automatic dark/light mode based on time of day

#### Phase 1 - Files & Collaboration

- ✅ **File Management**: Upload, organize, and share files with S3-compatible storage
- ✅ **File Sharing**: Internal and external share links with expiration
- ✅ **Dashboard**: Comprehensive overview with recent activity and quick actions

#### Phase 2 - Moodboards

- ✅ **Visual Moodboards**: Create mood/vision boards with media
- ✅ **Media Embeds**: Support for YouTube, Spotify, Instagram, TikTok
- ✅ **Image Uploads**: Direct image uploads with MinIO storage
- ✅ **oEmbed Integration**: Automatic rich media previews

#### Phase 3 - Analytics & OAuth

- ✅ **OAuth Connectors**: Google Analytics, Meta Business, YouTube, Spotify, Apple Music, TikTok, Instagram
- ✅ **Analytics Dashboard**: Unified metrics from multiple platforms
- ✅ **Metric Syncing**: Automatic background sync with configurable intervals
- ✅ **Token Management**: Automatic OAuth token refresh

#### Phase 4 - Contracts & Templates

- ✅ **Contract Templates**: Create reusable contract templates with variables
- ✅ **PDF Generation**: Generate PDFs using Puppeteer
- ✅ **Digital Signatures**: Multi-party signature workflow with tracking
- ✅ **Variable Substitution**: Handlebars-based template rendering

#### Phase 5 - Real-time Collaboration

- ✅ **WebSocket Gateway**: Socket.IO for real-time communication
- ✅ **Presence Tracking**: See who's online and where they're working
- ✅ **Live Cursors**: Real-time cursor positions on boards and moodboards
- ✅ **Typing Indicators**: See when collaborators are typing

#### Phase 6 - CMS Integration

- ✅ **Strapi Integration**: Headless CMS for blog and pages
- ✅ **Content Management**: Blog posts, pages, categories, tags, authors
- ✅ **Media Handling**: Image uploads and transformations
- ✅ **Search**: Full-text search across content

#### Phase 7 - Advanced Features

- ✅ **Team Invitations**: Token-based invitation system with role assignment
- ✅ **Audit Logging**: Comprehensive action tracking for compliance
- ✅ **Project Info Pages**: Public project showcase pages with custom URLs
- ✅ **Notification Preferences**: Granular control over email, push, and in-app notifications
- ✅ **Activity Feed**: Organization-wide activity tracking and timeline

#### Phase 8 - Testing & Hardening

- ✅ **Unit Tests**: Comprehensive test coverage for services
- ✅ **Integration Tests**: API endpoint testing with Supertest
- ✅ **E2E Tests**: Complete user flow testing
- ✅ **Security Hardening**: Rate limiting, CORS, helmet, input validation
- ✅ **Performance Optimization**: Caching, query optimization, compression
- ✅ **Monitoring Setup**: Health checks, metrics collection, logging

## 🏗️ Architecture

### Monorepo Structure

```
wmiw-platform/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── web/          # Next.js 14 Frontend
├── packages/
│   ├── config/       # Shared configurations
│   └── types/        # Shared TypeScript types & Zod schemas
├── infra/            # Infrastructure configs
└── docker-compose.yml
```

### Tech Stack

**Backend (apps/api)**

- NestJS (TypeScript)
- TypeORM + PostgreSQL
- JWT Authentication
- Swagger/OpenAPI documentation
- BullMQ + Redis (job queues)
- MinIO/S3 (file storage)

**Frontend (apps/web)**

- Next.js 14 (App Router)
- React 18
- TailwindCSS (Liquid Glass design)
- Framer Motion (animations)
- React Query (data fetching)
- Zustand (state management)

**Infrastructure**

- Docker Compose (local development)
- PostgreSQL 16
- Redis 7
- MinIO (S3-compatible storage)
- Mailhog (email testing)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone and setup**

```bash
cd /home/claude/wmiw-platform
pnpm install
```

2. **Start infrastructure**

```bash
pnpm docker:up
```

This starts:

- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- Mailhog (ports 1025, 8025)

3. **Start development servers**

In separate terminals:

```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Web
pnpm dev:web
```

### Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001
- **Mailhog**: http://localhost:8025

### Default Credentials

**MinIO:**

- User: `wmiw_minio`
- Password: `wmiw_minio_pass`

**Database:**

- Host: `localhost:5432`
- Database: `wmiw_dev`
- User: `wmiw_user`
- Password: `wmiw_dev_pass`

## 📁 Project Structure

### Backend API (apps/api/src)

```
src/
├── modules/
│   ├── auth/           # Authentication (register, login, JWT)
│   │   ├── entities/   # User entity
│   │   ├── dto/        # DTOs for auth operations
│   │   ├── strategies/ # JWT strategy
│   │   └── guards/     # Auth guards
│   ├── organization/   # Organization management
│   └── project/        # Projects, boards, tasks
│       ├── entities/   # Project, Board, Task entities
│       ├── dto/        # DTOs for CRUD operations
│       └── controllers/# REST API endpoints
├── config/            # Database and app configuration
└── main.ts            # Application bootstrap
```

### Frontend (apps/web/src)

```
src/
├── app/
│   ├── (auth)/         # Auth pages (login, register)
│   ├── dashboard/      # Dashboard page
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── lib/               # Utilities and API clients
└── styles/
    └── globals.css     # Global styles with Liquid Glass
```

## 🎨 Design System - Liquid Glass

The platform uses Apple's "Liquid Glass" design language:

### Key Components

```tsx
// Glass Panel
<div className="glass-panel">...</div>

// Glass Card (with hover effects)
<div className="glass-card">...</div>

// Glass Button
<button className="glass-button">...</button>

// Glass Input
<input className="glass-input" />

// Rainbow Reflection
<div className="glass-rainbow">...</div>
```

### Theme System

The platform features automatic theme switching:

- **Light Mode**: 7 AM - 7 PM
- **Dusk Mode**: 7 PM - 10 PM (increased opacity and blur)
- **Dark Mode**: 10 PM - 7 AM

Users can override with manual light/dark toggle (to be implemented).

## 📡 API Endpoints

### Authentication

```
POST   /api/v1/auth/register        # Register new user + org
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/forgot-password # Request password reset
POST   /api/v1/auth/reset-password  # Reset password
POST   /api/v1/auth/refresh         # Refresh access token
GET    /api/v1/auth/me              # Get current user
```

### Projects

```
POST   /api/v1/projects              # Create project
GET    /api/v1/projects              # List projects
GET    /api/v1/projects/:id          # Get project
PATCH  /api/v1/projects/:id          # Update project
DELETE /api/v1/projects/:id          # Delete project
```

### Boards

```
POST   /api/v1/projects/:id/boards   # Create board
GET    /api/v1/projects/:id/boards   # List project boards
GET    /api/v1/projects/boards/:id   # Get board with tasks
PATCH  /api/v1/projects/boards/:id   # Update board
DELETE /api/v1/projects/boards/:id   # Delete board
```

### Tasks

```
POST   /api/v1/projects/boards/:id/tasks  # Create task
GET    /api/v1/projects/tasks/:id         # Get task
PATCH  /api/v1/projects/tasks/:id         # Update task
POST   /api/v1/projects/tasks/:id/move    # Move task (drag & drop)
DELETE /api/v1/projects/tasks/:id         # Delete task
```

### Organization

```
GET    /api/v1/organization          # Get current organization
PATCH  /api/v1/organization          # Update organization
GET    /api/v1/organization/members  # List members
```

## 🔐 Authentication & Authorization

### JWT Tokens

The platform uses JWT tokens with:

- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry

Tokens are stored in localStorage on the frontend.

### Role-Based Access Control (RBAC)

**Roles:**

- `owner` - Full access, created on org registration
- `admin` - Manage organization and all projects
- `editor` - Create and edit content
- `collaborator` - View and comment
- `viewer` - Read-only access

**Seat Limits by Plan:**

- Free: 1 seat
- Pro: 3 seats (to be implemented)
- Business: 11 seats (to be implemented)
- Enterprise: Custom (to be implemented)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# API tests
pnpm --filter @wmiw/api test

# Frontend tests
pnpm --filter @wmiw/web test
```

## 📦 Database Schema

### Core Tables

- `users` - User accounts
- `organizations` - Multi-tenant organizations
- `projects` - Projects within organizations
- `boards` - Kanban boards within projects
- `tasks` - Tasks within boards

### Relationships

- Organization → Users (one-to-many)
- Organization → Projects (one-to-many)
- Project → Boards (one-to-many)
- Board → Tasks (one-to-many)
- User → Tasks (one-to-many, via assignee)

## 🚢 Deployment

### Production Environment Variables

**API (.env)**

```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key
S3_ENDPOINT=your-s3-endpoint
```

**Web (.env.local)**

```bash
NEXT_PUBLIC_API_URL=https://api.wmiw.app/api/v1
```

### Deployment Targets

- **Frontend**: Vercel (recommended)
- **Backend**: Render, Fly.io, or AWS ECS
- **Database**: Neon, RDS, or managed PostgreSQL
- **Storage**: AWS S3, Wasabi, or Backblaze

## 📈 Roadmap

### Phase 1 (Next)

- [ ] Dashboard with KPI tiles
- [ ] Real-time collaboration (WebSockets)
- [ ] File upload and management
- [ ] Team invitations

### Phase 2

- [ ] Smart Analytics (OAuth connectors)
- [ ] Content Planning module
- [ ] AI Music Analysis
- [ ] Board templates

### Phase 3

- [ ] Tour Planning
- [ ] Marketing AI
- [ ] Knowledge Center (Strapi CMS)
- [ ] Mobile app

## 🤝 Contributing

This is a proprietary project. For development:

1. Create feature branches from `main`
2. Follow TypeScript strict mode
3. Use conventional commits
4. Test thoroughly before PR

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:

- Check API docs: http://localhost:3001/api/docs
- Review this README
- Contact the development team

---

**Built with ❤️ for the music industry**
