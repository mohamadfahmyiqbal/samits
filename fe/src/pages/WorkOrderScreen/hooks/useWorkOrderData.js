import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchWorkOrders,
  fetchTechnicians,
  fetchWorkOrderStats,
  deleteWorkOrder,
  startWorkOrder,
  completeWorkOrder,
} from '../service/WorkOrderService.js';
import { statusConfig } from '../constants/workOrderConstants.js';

export const useWorkOrderData = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [technicians, setTechnicians] = useState([]);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    technician: 'all',
    dateRange: '30d'
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, techRes, statsRes] = await Promise.all([
        fetchWorkOrders(filters),
        fetchTechnicians(),
        fetchWorkOrderStats()
      ]);

      setWorkOrders(ordersRes.data || []);
      setTechnicians(techRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filtered & searched work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Status filter
      if (filters.status !== 'all' && wo.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority !== 'all' && wo.priority !== filters.priority) return false;
      
      // Technician filter
      if (filters.technician !== 'all' && wo.assignedTo !== filters.technician) return false;
      
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return wo.id.toLowerCase().includes(term) ||
               wo.title.toLowerCase().includes(term) ||
               wo.assetId.toLowerCase().includes(term);
      }
      
      return true;
    });
  }, [workOrders, filters, searchTerm]);

  // Status badge config
  const getStatusConfig = (status) => statusConfig[status] || statusConfig.default;

  // Refresh handler
  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Delete function
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteWorkOrder(id);
      refreshData();
    } catch (err) {
      throw new Error(err.message);
    }
  }, [refreshData]);

  const handleStart = useCallback(
    async (id, payload = {}) => {
      try {
        await startWorkOrder(id, payload);
        refreshData();
      } catch (err) {
        throw new Error(err.message);
      }
    },
    [refreshData, startWorkOrder],
  );

  const handleComplete = useCallback(
    async (id, payload = {}) => {
      try {
        await completeWorkOrder(id, payload);
        refreshData();
      } catch (err) {
        throw new Error(err.message);
      }
    },
    [refreshData, completeWorkOrder],
  );

  return {
    workOrders: filteredWorkOrders,
    technicians,
    stats,
    loading,
    error,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    refreshData,
    getStatusConfig,
    deleteWorkOrder: handleDelete,
    startWorkOrder: handleStart,
    completeWorkOrder: handleComplete,
  };
};

