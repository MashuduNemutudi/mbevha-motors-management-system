/**
 * hooks/useAuth.js
 * Convenience hook — import this instead of useContext(AuthContext) directly.
 *
 * Usage:
 *   const { admin, login, logout, loading } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default useAuth;
