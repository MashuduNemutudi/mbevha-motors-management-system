# MMMS — Architecture Notes

## System Overview

Mbevha Motors Management System (MMMS) is a full-stack web application with:
- **Public Website** — marketing site visible to all visitors
- **Admin Dashboard** — protected management interface for administrators only

## Tech Stack

| Layer        | Technology           | Hosted On  |
|--------------|----------------------|------------|
| Frontend     | React 18 + Vite      | Vercel     |
| Backend      | Node.js + Express.js | Render     |
| Database     | PostgreSQL           | Neon       |
| Auth         | JWT (8h expiry)      | —          |
| File Uploads | Multer               | Render disk|
| PDF          | PDFKit               | —          |

## Request Flow

```
Browser (React SPA)
    │
    │  HTTPS + JSON
    ▼
Express API (Render)
    │  JWT verified by authMiddleware on protected routes
    │
    ├── Public routes (no auth):
    │     GET /api/business
    │     GET /api/parts
    │     GET /api/gallery
    │     POST /api/messages   ← rate limited (10/15min/IP)
    │
    └── Protected routes (JWT required):
          /api/auth/me
          /api/quotations/*
          /api/invoices/*
          /api/parts (POST/PUT/DELETE)
          /api/gallery (POST/PATCH/DELETE)
          /api/messages (GET/PATCH/DELETE)
          /api/business (PUT)
    │
    ▼
PostgreSQL (Neon)
    SSL connection via pg Pool (max 5 connections)
```

## Authentication Flow

1. Admin submits username + password to `POST /api/auth/login`
2. Server fetches admin record by username
3. bcrypt compares password against stored hash
4. On success: JWT signed with `{ id, username }`, expires in 8h
5. Token stored in `localStorage` on the client
6. Axios request interceptor attaches `Authorization: Bearer <token>` to every request
7. `authMiddleware.protect` verifies token on all protected routes
8. Axios response interceptor catches 401 → clears storage → redirects to `/admin/login`

## Folder Structure

```
mmms/
├── client/          React frontend (Vite)
├── server/          Express API
├── database/        SQL files and migrations
└── docs/            Architecture and API documentation
```

## Environment Variables

See `server/.env.example` and `client/.env.example` for all required variables.

## Upload Organisation

Uploaded files are stored under `server/uploads/`:
```
uploads/
├── gallery/    Workshop images (public gallery)
├── parts/      Part images (public parts page)
└── pdfs/       Generated PDF documents (future caching)
```

Files are served as static assets at `/uploads/<folder>/<filename>`.
