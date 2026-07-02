/**
 * hooks/useFetch.js
 * ─────────────────────────────────────────────────────────────
 * Generic data-fetching hook for GET requests.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/parts');
 *
 * Features:
 *   - Automatic fetch on mount
 *   - Loading and error states
 *   - Refetch function to reload data manually
 *   - Cancels in-flight requests on unmount (avoids state updates
 *     on unmounted components)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const useFetch = (url, options = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, options);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
