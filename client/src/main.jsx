import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import './styles/variables.css';
import './styles/global.css';
import './styles/spinner.css';
import './styles/buttons.css';
import './styles/navbar.css';
import './styles/public.css';
import './styles/admin.css';
import './styles/responsive.css';

import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
