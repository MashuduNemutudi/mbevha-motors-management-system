/**
 * server.js
 * ─────────────────────────────────────────────────────────────
 * Mbevha Motors Management System — Express API Server
 * Entry point. Configures and starts the HTTP server.
 * ─────────────────────────────────────────────────────────────
 */

// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

// ── Internal modules ─────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');

// ── Route modules ────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const quotationRoutes = require('./routes/quotationsRoutes');
const invoiceRoutes   = require('./routes/invoicesRoutes');
const partRoutes      = require('./routes/partsRoutes');
const galleryRoutes   = require('./routes/galleryRoutes');
const messageRoutes   = require('./routes/messagesRoutes');
const businessRoutes   = require('./routes/businessRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');

// ── App initialisation ───────────────────────────────────────
const app = express();

// ── Security headers (Helmet) ────────────────────────────────
// Helmet sets sensible HTTP security headers.
// crossOriginResourcePolicy is relaxed to 'cross-origin' so the
// React frontend (served from Vercel) can load uploaded images
// served by this API.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ─────────────────────────────────────────────────────
// Only the configured CLIENT_URL may make cross-origin requests.
// Credentials are not used (we pass JWT in headers, not cookies).
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// ── HTTP request logging (Morgan) ────────────────────────────
// 'dev' format in development, 'combined' in production
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static file serving — uploaded images ────────────────────
// Uploaded files are served at /uploads/<folder>/<filename>
// Example: GET /uploads/parts/1720000000000-123456-bumper.jpg
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d', // Cache uploaded images for 7 days in the browser
  })
);

// ── Health check ─────────────────────────────────────────────
// Used by Render to verify the service is alive.
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MMMS API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices',   invoiceRoutes);
app.use('/api/parts',      partRoutes);
app.use('/api/gallery',    galleryRoutes);
app.use('/api/messages',   messageRoutes);
app.use('/api/business',   businessRoutes);

// ── 404 handler ──────────────────────────────────────────────
// Catches any request that did not match a defined route.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global error handler ─────────────────────────────────────
// Must be registered AFTER all routes. Catches errors forwarded
// via next(err) from any route or middleware above.
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Mbevha Motors Management System — API     ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Environment : ${(process.env.NODE_ENV || 'development').padEnd(29)}║`);
  console.log(`║  Port        : ${String(PORT).padEnd(29)}║`);
  console.log(`║  Client URL  : ${(process.env.CLIENT_URL || 'http://localhost:5173').padEnd(29)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
