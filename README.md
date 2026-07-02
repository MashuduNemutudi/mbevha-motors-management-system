# Mbevha Motors Management System (MMMS)

A full-stack web application for **Mbevha Motors (Pty) Ltd** — an automotive workshop in Limpopo, South Africa.

## System Overview

| System | Description |
|--------|-------------|
| **Public Website** | Marketing site with home, about, services, used parts, gallery, and contact pages |
| **Admin Dashboard** | Protected management system for quotations, invoices, parts, gallery, messages, and business info |

## Tech Stack

| Layer | Technology | Deployed On |
|-------|------------|-------------|
| Frontend | React 18 + Vite | Vercel |
| Backend | Node.js + Express.js | Render |
| Database | PostgreSQL | Neon |
| Auth | JWT + bcrypt | — |
| File Uploads | Multer | Render disk |
| PDF Generation | PDFKit | — |

---

## Project Structure

```
mmms/
├── client/                    # React 18 frontend (Vite)
│   ├── public/
│   └── src/
│       ├── api/               # Axios instance + per-module API calls
│       ├── components/
│       │   ├── admin/         # Dashboard sidebar, layout, cards
│       │   ├── common/        # Navbar, Footer, Modal, Spinner, ProtectedRoute
│       │   └── public/        # Hero, PartCard, ContactForm, Gallery grid
│       ├── context/           # AuthContext (JWT state)
│       ├── hooks/             # useAuth
│       ├── pages/
│       │   ├── admin/         # Login, Dashboard, Quotations, Invoices...
│       │   └── public/        # Home, About, Services, Parts, Gallery, Contact
│       ├── styles/            # CSS3 variables, global, components, responsive
│       └── utils/             # formatCurrency, formatDate
│
├── server/                    # Node.js + Express API
│   ├── config/                # PostgreSQL pool (db.js)
│   ├── controllers/           # Business logic per module
│   ├── middleware/            # auth, errorHandler, rateLimiter, upload, validate
│   ├── routes/                # Express routers per module
│   ├── services/              # activityService, numberService, pdfService
│   └── uploads/               # Multer destinations
│       ├── gallery/
│       ├── parts/
│       └── pdfs/
│
├── database/
│   ├── schema.sql             # Complete PostgreSQL schema
│   ├── seed.sql               # Default admin + business info
│   ├── generate_hash.js       # bcrypt hash generator helper
│   └── migrations/            # Incremental schema changes
│
└── docs/
    ├── architecture.md        # System design notes
    └── api.md                 # Full API reference
```

---

## Quick Start

### Prerequisites
- Node.js >= 18
- A [Neon](https://neon.tech) PostgreSQL database
- Git

---

### 1. Clone and install

```bash
git clone <your-repo-url>
cd mmms
```

**Install backend dependencies:**
```bash
cd server
npm install
```

**Install frontend dependencies:**
```bash
cd ../client
npm install
```

---

### 2. Set up the database

Open your Neon dashboard, copy your connection string, then run:

```bash
psql <your_neon_connection_string> -f database/schema.sql
```

Generate a bcrypt password hash:
```bash
cd database
node generate_hash.js
```

Copy the printed hash into `database/seed.sql`, update the business info values, then run:

```bash
psql <your_neon_connection_string> -f database/seed.sql
```

---

### 3. Configure environment variables

**Backend:**
```bash
cd server
cp .env.example .env
# Edit .env with your values
```

Required server variables:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_64_char_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

**Frontend:**
```bash
cd client
cp .env.example .env
# Only needed for production builds
```

---

### 4. Start development servers

**Backend** (runs on port 5000):
```bash
cd server
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd client
npm run dev
```

The Vite dev server proxies `/api` and `/uploads` requests to `localhost:5000`
so you never deal with CORS in development.

Open `http://localhost:5173` for the public website.
Open `http://localhost:5173/admin/login` for the admin dashboard.

---

## Default Admin Credentials

After running seed.sql:
- **Username:** `mbevha_admin`
- **Password:** the password you hashed in `generate_hash.js`

> **Change your password immediately after first login via Settings.**

---

## Development Phases

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Database Schema + Server Foundation | ✅ Complete |
| 2 | Authentication (Login, JWT, Protected Routes) | ✅ Complete |
| 3 | Public Website (all 6 pages) | 🔲 Pending |
| 4 | Parts Management (admin CRUD + image upload) | 🔲 Pending |
| 5 | Gallery Management | 🔲 Pending |
| 6 | Messages (contact form + admin inbox) | 🔲 Pending |
| 7 | Quotations (CRUD + PDF generation) | 🔲 Pending |
| 8 | Invoices (CRUD + PDF generation) | 🔲 Pending |
| 9 | Business Info + Settings | 🔲 Pending |
| 10 | Dashboard (stats + activity feed) | 🔲 Pending |
| 11 | Polish (responsive, loading states, error states) | 🔲 Pending |

---

## Deployment

### Backend → Render
1. Push `server/` to a GitHub repo
2. Create a new Render Web Service connected to the repo
3. Set environment variables in Render dashboard
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → Vercel
1. Push `client/` to a GitHub repo
2. Import into Vercel
3. Set `VITE_API_URL` environment variable to your Render API URL
4. Deploy

---

## Business Rules

- No customer accounts — customers contact the workshop by phone, WhatsApp, or contact form
- No online bookings
- No online payments
- Quotations and invoices are created by administrators only and printed or shared as PDF
- Quotation number format: `QT-2026-0001`
- Invoice number format: `INV-2026-0001`

---

## Author

**Mashudu Nemutudi**  
Mbevha Motors (Pty) Ltd — Limpopo, South Africa

---

*Mbevha Motors Management System — Version 1.0*
