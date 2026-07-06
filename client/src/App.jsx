import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout  from './components/public/PublicLayout';
import AdminLayout   from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import HomePage     from './pages/public/HomePage';
import AboutPage    from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import PartsPage    from './pages/public/PartsPage';
import GalleryPage  from './pages/public/GalleryPage';
import ContactPage  from './pages/public/ContactPage';

// Admin pages
import LoginPage         from './pages/admin/LoginPage';
import DashboardPage     from './pages/admin/DashboardPage';
import QuotationsPage    from './pages/admin/QuotationsPage';
import QuotationFormPage from './pages/admin/QuotationFormPage';
import InvoicesPage      from './pages/admin/InvoicesPage';
import InvoiceFormPage   from './pages/admin/InvoiceFormPage';
import PartsAdminPage    from './pages/admin/PartsAdminPage';
import GalleryAdminPage  from './pages/admin/GalleryAdminPage';
import MessagesPage      from './pages/admin/MessagesPage';
import BusinessInfoPage  from './pages/admin/BusinessInfoPage';
import SettingsPage      from './pages/admin/SettingsPage';

const NotFoundPage = () => (
  <div className="not-found-page">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>← Back to Home</a>
  </div>
);

const App = () => (
  <Routes>
    {/* Public website */}
    <Route element={<PublicLayout />}>
      <Route path="/"         element={<HomePage />}     />
      <Route path="/about"    element={<AboutPage />}    />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/parts"    element={<PartsPage />}    />
      <Route path="/gallery"  element={<GalleryPage />}  />
      <Route path="/contact"  element={<ContactPage />}  />
    </Route>

    {/* Admin login (public) */}
    <Route path="/admin/login" element={<LoginPage />} />

    {/* Admin dashboard (protected) */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard"             element={<DashboardPage />}     />
      <Route path="quotations"            element={<QuotationsPage />}    />
      <Route path="quotations/new"        element={<QuotationFormPage />} />
      <Route path="quotations/:id/edit"   element={<QuotationFormPage />} />
      <Route path="invoices"              element={<InvoicesPage />}      />
      <Route path="invoices/new"          element={<InvoiceFormPage />}   />
      <Route path="invoices/:id/edit"     element={<InvoiceFormPage />}   />
      <Route path="parts"                 element={<PartsAdminPage />}    />
      <Route path="gallery"               element={<GalleryAdminPage />}  />
      <Route path="messages"              element={<MessagesPage />}      />
      <Route path="business-info"         element={<BusinessInfoPage />}  />
      <Route path="settings"              element={<SettingsPage />}      />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
