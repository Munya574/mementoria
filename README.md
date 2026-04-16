# Mementoria

A full-stack digital scrapebook application for preserving and reliving personal memories. Users can create interactive scrapebooks with customizable pages, arrange media elements freely using drag-and-drop, and animate pages with realistic 3D flip effects.

---

## Features

- **Scrapebook editor** — Create and organize collections of scrapebooks, each with multiple pages
- **Drag-and-drop canvas** — Freely position text, image, and audio elements on each page
- **Page flip animations** — Realistic 3D page-turn effects powered by Framer Motion and react-pageflip
- **Media uploads** — Supports images (JPEG, PNG, GIF, WebP, SVG) and audio (MP3, WAV, OGG, AAC)
- **Authentication** — Secure session-based login and registration via Better Auth
- **Theme toggle** — Light and dark mode support
- **Health monitoring** — Backend health check endpoint for deployment readiness checks

---

## Tech Stack

### Monorepo

| Tool | Purpose |
|---|---|
| TypeScript | Primary language across the stack |
| Node.js | Runtime |
| pnpm | Package manager |
| Turborepo | Monorepo build orchestration |
| Biome | Linting and formatting |
| Husky | Pre-commit hooks |
| Vitest | Testing framework |

### Frontend (`apps/client`)

| Tool | Purpose |
|---|---|
| React 19 | UI component library |
| Vite | Build tool and dev server |
| TanStack Router | Type-safe, file-based routing |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| Framer Motion | Animations |
| react-draggable | Drag-and-drop canvas interactions |
| react-pageflip | 3D page flip animations |
| Better Auth | Authentication client |
| Sonner | Toast notifications |

### Backend (`apps/server`)

| Tool | Purpose |
|---|---|
| Fastify | High-performance web framework |
| Prisma | Type-safe ORM |
| SQLite / PostgreSQL | Database (env-configurable) |
| Better Auth | Session management and authentication |
| Winston | Structured logging |

---

## Architecture

```
mementoria/
├── apps/
│   ├── client/          # React + Vite frontend
│   └── server/          # Fastify + Prisma backend
├── turbo.json           # Turborepo pipeline config
└── package.json         # Root workspace config
```

### Frontend Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Login and registration |
| `/app` | Protected dashboard — scrapebook collection view |
| `/app/scrapebooks/:id` | Scrapebook editor with page management |
| `/app/settings` | User settings |
| `/app/security` | Security settings |
| `/app/notifications` | Notifications |

### Backend API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check — returns server and database status |
| `GET\|POST /api/auth/*` | Authentication routes (delegated to Better Auth) |

### Database Schema

```
User         — id, name, email, createdAt, updatedAt
Session      — id, token, expiresAt, userId, ipAddress, userAgent
Account      — id, providerId, userId, OAuth + credential fields
Verification — id, identifier, value, expiresAt
```

Storage providers (images, audio) are integrated using dependency injection, enabling straightforward migration to any S3-compatible provider.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Configure environment

Create `.env` files in `apps/client` and `apps/server` as needed. Key variables for the server:

```env
PORT=8080
HOST=localhost
DATABASE_URL=file:./dev.db
CLIENT_ORIGIN=http://localhost:3000
```

### Run in development

```bash
pnpm dev
```

This starts both the frontend (default: `http://localhost:3000`) and backend concurrently via Turborepo.

### Build for production

```bash
pnpm build
```

---

## Team

Originally built as a collaborative team project, then extended independently.

| Name | Role |
|---|---|
| Chilawo Munene | Tech Lead — architecture, full-stack development, continued solo development |
| Jasmine Huang | Backend development |
| Peilu Tu | Frontend development |
| Rita Osi | Backend development |
