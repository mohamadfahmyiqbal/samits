import { useState, useEffect } from 'react';

export const useTableData = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (typeof fetchData === 'function') {
      fetchData();
    }
  };

  return {
    data,
    loading,
    error,
    setData,
    fetchData,
    refreshData
  };
};
