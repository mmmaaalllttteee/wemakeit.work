# WMIW Platform - Quick Start Guide

## 🎉 Your Platform is Ready!

I've built the complete foundation (Phase 0) of the WMIW platform with:

✅ **Backend API (NestJS)**

- JWT authentication with registration, login, password reset
- Multi-tenant organization management
- Project, board, and task CRUD operations
- Kanban board with drag & drop support
- Role-based access control (RBAC)
- Swagger API documentation

✅ **Frontend (Next.js 14)**

- Landing page with Liquid Glass design
- Login and registration pages
- Automatic dark/light mode based on time
- Responsive design with Tailwind CSS
- React Query for data fetching

✅ **Infrastructure**

- Docker Compose setup
- PostgreSQL database
- Redis for caching/queues
- MinIO for file storage
- Mailhog for email testing

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd wmiw-platform
pnpm install
```

### Step 2: Start Infrastructure

```bash
./start.sh
```

Or manually:

```bash
pnpm docker:up
```

### Step 3: Start Development Servers

**Terminal 1 - API:**

```bash
pnpm dev:api
```

**Terminal 2 - Web:**

```bash
pnpm dev:web
```

### Step 4: Access the Platform

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001
- **Mailhog**: http://localhost:8025

## 🧪 Testing the Platform

### 1. Register a New Account

Visit http://localhost:3000 and click "Get Started":

- Name: Your Name
- Email: test@example.com
- Organization: My Label
- Password: password123

This creates:

- A new user account
- A new organization
- Assigns you as "owner" role

### 2. Login

After registration, you're automatically logged in. Otherwise, use the credentials above to login.

### 3. Test API Endpoints

Visit http://localhost:3001/api/docs to explore all API endpoints with Swagger UI.

Example API calls:

**Get Current User:**

```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create a Project:**

```bash
curl -X POST http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Album Release 2025",
    "description": "New album project"
  }'
```

**Create a Board:**

```bash
curl -X POST http://localhost:3001/api/v1/projects/PROJECT_ID/boards \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marketing Tasks",
    "visibility": "team"
  }'
```

## 📁 Project Structure

```
wmiw-platform/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── config/   # Configuration
│   │   │   └── main.ts   # Entry point
│   │   └── package.json
│   └── web/              # Next.js Frontend
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/ # UI components
│       │   ├── lib/      # Utilities
│       │   └── styles/   # Global styles
│       └── package.json
├── packages/
│   ├── config/           # Shared configs
│   └── types/            # Shared types (Zod schemas)
├── infra/
│   └── postgres/         # DB initialization
├── docker-compose.yml    # Local infrastructure
├── start.sh              # Startup script
└── README.md             # Full documentation
```

## 🎨 Design System

The platform uses the "Liquid Glass" design language:

### Key CSS Classes

```tsx
// Glass Panel
<div className="glass-panel">Content</div>

// Glass Card with hover effect
<div className="glass-card">Content</div>

// Glass Button
<button className="glass-button">Click me</button>

// Glass Input
<input className="glass-input" />

// Rainbow reflection effect
<div className="glass-rainbow">Content</div>

// Bento grid layout
<div className="bento-grid">
  <div className="bento-item">Item 1</div>
  <div className="bento-item-large">Item 2</div>
</div>
```

## 🔒 Authentication Flow

1. **Register**: POST `/api/v1/auth/register`
   - Creates user + organization
   - Returns access token + refresh token
2. **Login**: POST `/api/v1/auth/login`
   - Validates credentials
   - Returns access token + refresh token
3. **Protected Routes**: Add header

   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

4. **Refresh Token**: POST `/api/v1/auth/refresh`
   - Extends session when access token expires

## 📊 Database Schema

### Users

- id, email, name, passwordHash
- orgId (foreign key to organizations)
- role (owner, admin, editor, collaborator, viewer)
- preferences (theme, timezone, notifications)

### Organizations

- id, name, slug
- billingPlan (free, pro, business, enterprise)
- seatsMax, seatsUsed
- settings (logo, accentColor, features)

### Projects

- id, orgId, name, slug
- status (active, archived, completed)
- ownerId, coverImage

### Boards

- id, projectId, name
- columns (JSONB array)
- visibility (private, team, public)
- shareToken (for external sharing)

### Tasks

- id, boardId, columnId
- title, description
- assigneeId, dueDate
- priority, status, position
- labels, checklist

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start infrastructure
pnpm docker:up

# Start API
pnpm dev:api

# Start Web
pnpm dev:web

# Build all
pnpm build

# Lint
pnpm lint

# Type check
cd apps/web && pnpm type-check

# Stop infrastructure
pnpm docker:down

# View logs
pnpm docker:logs
```

## 🐛 Troubleshooting

### Port Already in Use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000  # or :3001, :5432, etc.

# Stop the process or change ports in .env files
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# View PostgreSQL logs
docker compose logs postgres
```

### Can't Access API

1. Check API is running: http://localhost:3001/api/v1/auth/me
2. Check CORS settings in `apps/api/src/main.ts`
3. Verify `NEXT_PUBLIC_API_URL` in web app

## 🚢 Next Steps

Now that the foundation is complete, you can:

1. **Build the Dashboard**
   - Create `/dashboard` page
   - Add project list
   - Display KPI tiles

2. **Add Real-time Features**
   - Implement WebSockets for board updates
   - Add live cursors on boards
   - Real-time notifications

3. **Implement File Upload**
   - Create file upload endpoints
   - Integrate with MinIO
   - Add file preview component

4. **Add More Features**
   - Content planning module
   - Analytics connectors
   - AI music analysis
   - Tour planning

## 📚 Resources

- **Full README**: `/wmiw-platform/README.md`
- **API Docs**: http://localhost:3001/api/docs
- **TypeScript Types**: `/packages/types/src/`
- **Database Config**: `/apps/api/src/config/database.config.ts`

## 💡 Tips

1. **Use Swagger UI** for testing API endpoints
2. **Check browser console** for frontend errors
3. **View API logs** in the terminal for debugging
4. **Use Mailhog** to see registration/reset emails
5. **Access MinIO** to manage uploaded files

## ✅ What's Implemented

- [x] User authentication (register, login, password reset)
- [x] Multi-tenant organizations
- [x] JWT token management
- [x] RBAC (role-based access control)
- [x] Project CRUD operations
- [x] Board management
- [x] Task management with drag & drop support
- [x] Liquid Glass design system
- [x] Auto dark/light mode
- [x] Responsive layouts
- [x] API documentation (Swagger)
- [x] Docker infrastructure
- [x] Type-safe APIs (TypeScript + Zod)

## 🎯 Coming Soon (Your Roadmap)

- [ ] Dashboard with KPI tiles
- [ ] Real-time collaboration (WebSockets)
- [ ] File upload and management
- [ ] Team invitations and management
- [ ] Board templates
- [ ] Content planning module
- [ ] Smart analytics (OAuth connectors)
- [ ] AI music analysis
- [ ] Tour planning
- [ ] Marketing AI

---

**You're all set! Start building amazing features on this solid foundation.** 🚀
