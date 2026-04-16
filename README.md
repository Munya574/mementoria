# Mementoria

**A full-stack digital scrapbook application for preserving and reliving personal memories.**

Mementoria lets users build richly interactive scrapbooks: drag-and-drop media onto freeform canvases, flip through pages with realistic 3D animations, and keep collections of memories organized in one place.

---

## Demo

> Live demo and screenshots coming soon.

---

## Features

| Feature | Details |
|---|---|
| Scrapbook editor | Create named scrapbooks, each containing multiple pages |
| Freeform canvas | Drag, drop, and reposition text, image, and audio elements anywhere on a page |
| 3D page-flip animations | Realistic book-turn effects using Framer Motion |
| Media uploads | Images (JPEG, PNG, GIF, WebP, SVG) and audio (MP3, WAV, OGG, AAC) |
| Authentication | Secure session-based login and registration via Better Auth |
| Route protection | Unauthenticated users are redirected before any protected content loads |
| Light / dark mode | Persistent theme toggle available across the app |
| Health endpoint | `/api/health` for deployment readiness checks and uptime monitoring |

---

## Tech Stack

### Monorepo

| Tool | Purpose |
|---|---|
| TypeScript | Primary language across the full stack |
| Node.js | Runtime |
| pnpm | Workspace-aware package manager |
| Turborepo | Parallelized build orchestration with remote caching |
| Biome | Unified linting and formatting (replaces ESLint + Prettier) |
| Husky | Pre-commit quality enforcement |
| Vitest | Unit and integration testing |
| GitHub Actions | CI pipeline on every push and pull request |

### Frontend (`apps/client`)

| Tool | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite 6 | Build tool and dev server with HMR |
| TanStack Router | Type-safe, file-based routing with automatic code splitting |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible, headless component primitives (Radix UI) |
| Framer Motion | Page flip and transition animations |
| react-draggable | Canvas drag-and-drop interactions |
| react-pageflip | 3D page-flip component |
| Better Auth | Client-side session management |
| Sonner | Toast notification system |

### Backend (`apps/server`)

| Tool | Purpose |
|---|---|
| Fastify | High-performance, low-overhead HTTP framework |
| Prisma | Type-safe ORM with schema-first migrations |
| SQLite / PostgreSQL | Database — SQLite for development, PostgreSQL for production |
| Better Auth | Server-side session handling and credential authentication |
| Winston | Structured, colorized logging |

---

## Architecture

```
mementoria/
├── apps/
│   ├── client/          # React 19 + Vite frontend
│   │   └── src/
│   │       ├── routes/      # File-based TanStack Router pages
│   │       ├── components/  # Shared UI and canvas components
│   │       ├── hooks/       # Session and responsive layout hooks
│   │       └── lib/         # Auth client, utilities
│   └── server/          # Fastify + Prisma backend
│       ├── src/
│       │   └── main/
│       │       ├── routes/  # API route handlers
│       │       └── lib/     # Auth, logger, Prisma, Fastify setup
│       └── prisma/
│           └── schema.prisma
├── turbo.json           # Turborepo pipeline configuration
└── pnpm-workspace.yaml  # Workspace definition
```

### Frontend Routes

| Route | Description |
|---|---|
| `/` | Landing page with theme toggle and navigation |
| `/auth` | Tabbed login and registration |
| `/app` | Protected dashboard — scrapebook collection view |
| `/app/scrapebooks/:id` | Canvas editor with page management |
| `/app/settings` | User profile and account management |
| `/app/security` | Security settings |
| `/app/notifications` | Notifications |

### Backend API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server status, database connectivity, and timestamp |
| `GET \| POST` | `/api/auth/*` | Authentication routes delegated to Better Auth |

### Database Schema

```
User         — id, name, email, emailVerified, image
Session      — id, token, expiresAt, userId, ipAddress, userAgent
Account      — id, providerId, accountId, userId, OAuth + credential fields
Verification — id, identifier, value, expiresAt
```

Storage providers are integrated via dependency injection, enabling straightforward migration to any S3-compatible service without changing application logic.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 10 or later

### Installation

```bash
git clone https://github.com/ChilawoM/mementoria.git
cd mementoria
pnpm install
```

### Environment Configuration

Create `.env` files in `apps/client` and `apps/server`.

**`apps/server/.env`**
```env
PORT=4000
HOST=localhost
DATABASE_URL=file:./dev.db
CLIENT_ORIGIN=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:4000
```

**`apps/client/.env`**
```env
VITE_SERVER_URL=http://localhost:4000
```

### Database Setup

```bash
cd apps/server
pnpm prisma migrate dev
```

### Development

```bash
# From the repo root — starts both frontend and backend concurrently
pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

### Production Build

```bash
pnpm build
```

---

## Notable Technical Decisions

- **Turborepo** — Tasks across both apps run in parallel with output caching, keeping CI fast and local builds incremental.
- **TanStack Router** — File-based routing generates a fully type-safe route tree at build time; `beforeLoad` guards enforce authentication without runtime overhead.
- **Better Auth** — Full-stack auth library with a Prisma adapter handles session creation, credential verification, and token signing without rolling custom middleware.
- **Biome over ESLint + Prettier** — Single-tool linting and formatting with significantly faster parse times and zero config conflicts between the two apps.
- **Dependency-injected storage** — The file upload layer is designed against an interface rather than a concrete provider, making the switch from local storage to S3 a one-file change.

---

## Team

Mementoria was built as a collaborative team project, then extended and maintained independently.

| Name | Role |
|---|---|
| **Chilawo Munene** | Tech Lead — architecture, full-stack development, ongoing solo development |
| **Jasmine Huang** | Backend development |
| **Peilu Tu** | Frontend development |
| **Rita Osi** | Backend development |
