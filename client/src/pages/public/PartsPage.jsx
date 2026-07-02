/**
 * pages/public/PartsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Public Used Parts page.
 *
 * Features (Phase 3):
 *   - Grid of PartCard components
 *   - Filter by category (dropdown)
 *   - Search by part name
 *   - Each card: image, name, description, price, availability
 *   - WhatsApp enquiry button on each card
 *   - Pagination or load more
 *
 * Data: GET /api/parts?category=&search=&page=
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 3): Implement parts grid, filters, and PartCard.
 */

const PartsPage = () => (
  <main style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h1>Used Parts</h1>
    <p style={{ marginTop: 8, color: '#adb5bd', fontSize: 14 }}>— Coming in Phase 3 —</p>
  </main>
);

export default PartsPage;
