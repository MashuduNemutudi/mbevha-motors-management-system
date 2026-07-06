import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import WhatsAppFloatingButton from '../common/WhatsAppFloatingButton';

const PublicLayout = () => (
  <div className="public-layout">
    <Navbar />
    <Outlet />
    <Footer />
    <WhatsAppFloatingButton />
  </div>
);

export default PublicLayout;
