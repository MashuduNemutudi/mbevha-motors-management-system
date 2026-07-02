/**
 * components/public/PublicLayout.jsx
 * Wrapper layout for all public website pages.
 * Renders Navbar at top, page content, Footer at bottom.
 */

import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PublicLayout = () => (
  <div className="public-layout">
    <Navbar />
    <Outlet />
    <Footer />
  </div>
);

export default PublicLayout;
