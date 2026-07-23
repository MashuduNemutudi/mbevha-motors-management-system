/**
 * context/BusinessContext.jsx
 *
 * Fetches business info from GET /api/business once on app mount
 * and makes it available to every component without repeated API calls.
 *
 * Navbar, Footer, HomePage, AboutPage, ServicesPage, PartsPage,
 * GalleryPage, ContactPage, and WhatsAppFloatingButton all read
 * from this single context so the public website always shows
 * the latest data stored in PostgreSQL.
 *
 * When the admin updates business info, calling refresh() re-fetches
 * from the database so changes appear immediately without a page reload.
 *
 * Fallback values are shown while loading or if the API is unreachable,
 * so the public website never shows blank contact info.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getBusinessInfo } from '../api/businessApi';

/* Safe fallback — shown while loading or on API failure */
const FALLBACK = {
  business_name:    'Mbevha Motors (Pty) Ltd',
  motto:            'Notable Hands, We Do Quality.',
  phone:            '071 306 5615',
  email:            '',
  address:          'Dzwerani, Mahematshena, Vuwani Road, Opposite Mavikos',
  about:            '',
  opening_hours:    'Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed',
  whatsapp_number:  '0615188643',
  google_maps_link: '',
};

/**
 * Convert a stored phone number to a WhatsApp-safe international number.
 * Strips spaces/dashes, converts 0XX to 27XX.
 * e.g. "061 518 8643" → "27615188643"
 */
export const toWaNumber = (raw = '') => {
  const digits = String(raw).replace(/[\s\-+]/g, '');
  if (!digits) return '27713065615';
  if (digits.startsWith('27')) return digits;
  if (digits.startsWith('0')) return '27' + digits.slice(1);
  return '27' + digits;
};

export const BusinessContext = createContext(null);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(FALLBACK);
  const [loading, setLoading]   = useState(true);

  const fetchBusiness = async () => {
    try {
      const res = await getBusinessInfo();
      if (res.data?.success && res.data?.data) {
        // Merge with fallback — null/undefined DB values must NOT
        // overwrite fallback strings (null.split() would crash the app)
        const data = res.data.data;
        const safe = { ...FALLBACK };
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            safe[key] = data[key];
          }
        });
        setBusiness(safe);
      }
    } catch {
      // Non-fatal: public website works with fallback values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusiness(); }, []);

  /* Called by BusinessInfoPage after a successful save */
  const refresh = () => fetchBusiness();

  return (
    <BusinessContext.Provider value={{ business, loading, refresh }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used inside BusinessProvider');
  return ctx;
};
