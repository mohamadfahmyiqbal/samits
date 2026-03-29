import { useState, useMemo, useCallback, useEffect } from 'react';
import { useContext } from 'react';
import { MaintenanceContext } from '../../../context/MaintenanceContext';
import { AssetContext } from '../../../context/AssetContext';
import * as AssetService from '../../../services/AssetService';
import UserService from '../../../services/UserService';
import { format } from 'date-fns';
import { useDebounce } from '../../../hooks/useDebounce'; // Menggunakan debounce global

export const useScheduleData = () => {
  const { logs = [], createLog: createMaintenanceLog = () => {} } =
    useContext(MaintenanceContext) || {};
  const { utama = [], client = [] } = useContext(AssetContext) || {};

  // Local state untuk master data
  const [categoryTypesData, setCategoryTypesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [mainTypesData, setMainTypesData] = useState([]);
  const [karyawanData, setKaryawanData] = useState([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // Filter state
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Implementasi Debounce untuk pencarian agar tidak membebani filter logic
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch master data on mount menggunakan Promise.all untuk paralelisme
  useEffect(() => {
    setIsLoadingMaster(true);
    Promise.allSettled([
      AssetService.fetchCategories(),
      AssetService.fetchMainTypes(),
      AssetService.fetchCategoryTypes(),
      UserService.getAllKaryawan(),
    ])
      .then(([cats, mains, types, users]) => {
        if (cats.status === 'fulfilled') setCategoriesData(cats.value.data || []);
        if (mains.status === 'fulfilled') setMainTypesData(mains.value.data || []);
        if (types.status === 'fulfilled') setCategoryTypesData(types.value.data || []);
        if (users.status === 'fulfilled') setKaryawanData(users.value.data || []);
      })
      .catch((err) => {
        console.error('Error loading master data:', err);
      })
      .finally(() => {
        setIsLoadingMaster(false);
      });
  }, []);

  // Combined assets (deduplicated)
  const allAssets = useMemo(() => {
    const combined = [...utama, ...client];
    const seen = new Set();
    return combined
      .filter((asset) => {
        if (!asset?.noAsset || seen.has(asset.noAsset)) return false;
        seen.add(asset.noAsset);
        return true;
      })
      .map((asset) => ({
        ...asset,
        asset_main_type_id: asset.asset_main_type_id ?? asset.main_type_id ?? '',
        asset_main_type_name:
          asset.asset_main_type_name ?? asset.main_type_name ?? asset.category ?? '',
        category_id: asset.category_id ?? '',
        category_name: asset.category ?? '',
        sub_category_id: asset.sub_category_id ?? '',
        sub_category_name: asset.sub_category ?? asset.type ?? '',
      }));
  }, [utama, client]);

  // Computed values - Menggunakan debouncedSearchQuery
  const filteredLogs = useMemo(() => {
    const safeLogs = Array.isArray(logs) ? logs : [];
    if (filterCategory === 'All' && !debouncedSearchQuery) return safeLogs;

    const lowerSearch = debouncedSearchQuery.toLowerCase();

    return safeLogs.filter((log) => {
      const categoryMatch = filterCategory === 'All' || log?.category === filterCategory;
      const searchMatch =
        !debouncedSearchQuery ||
        (log?.itItemId && log.itItemId.toLowerCase().includes(lowerSearch)) ||
        (log?.assetName && log.assetName.toLowerCase().includes(lowerSearch)) ||
        (log?.detail && log.detail.toLowerCase().includes(lowerSearch)) ||
        (log?.pic && log.pic.toLowerCase().includes(lowerSearch));

      return categoryMatch && searchMatch;
    });
  }, [logs, filterCategory, debouncedSearchQuery]);

  const logsByDate = useMemo(() => {
    const grouped = {};
    filteredLogs.forEach((log) => {
      if (log.scheduledDate) {
        try {
          const dateStr =
            typeof log.scheduledDate === 'string'
              ? log.scheduledDate
              : format(new Date(log.scheduledDate), 'yyyy-MM-dd');
          const dateKey = dateStr.split('T')[0]; // Ambil YYYY-MM-DD saja
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(log);
        } catch (e) {
          console.error('Invalid date in log:', log);
        }
      }
    });
    return grouped;
  }, [filteredLogs]);

  const categoriesForForm = useMemo(() => {
    const unique = [...new Map(categoriesData.map((c) => [c.category, c])).values()];
    return unique
      .map((cat) => ({
        value: cat.category,
        label: cat.category,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categoriesData]);

  const mainTypeOptions = useMemo(() => {
    return (Array.isArray(mainTypesData) ? mainTypesData : [])
      .map((item) => ({
        value: item.asset_main_type_id,
        label: item.main_type_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [mainTypesData]);

  // Get logs for specific date
  const getLogsForDate = useCallback(
    (date) => {
      if (!date) return [];
      const dateKey = format(date, 'yyyy-MM-dd');
      return logsByDate[dateKey] || [];
    },
    [logsByDate]
  );

  // Helper static objects moved inside to keep reference stable with useMemo or defined outside
  const getCategoryBadgeColor = useCallback((category) => {
    const colors = {
      Hardware: 'primary',
      Software: 'success',
      Infrastruktur: 'info',
      Cyber: 'danger',
    };
    return colors[category] || 'warning';
  }, []);

  const getStatusBadgeColor = useCallback((status) => {
    const colors = {
      pending: 'secondary',
      in_progress: 'warning',
      done: 'success',
      abnormal: 'danger',
      overdue: 'danger',
    };
    return colors[status] || 'secondary';
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      pending: 'Open',
      in_progress: 'In Progress',
      done: 'Done',
      abnormal: 'Abnormal',
      overdue: 'Terlambat',
    };
    return labels[status] || status;
  }, []);

  return {
    // Data
    allAssets,
    filteredLogs,
    logsByDate,
    categoriesForForm,
    mainTypeOptions,
    karyawanData,
    isLoadingMaster,

    // Computed
    getLogsForDate,
    getCategoryBadgeColor,
    getStatusBadgeColor,
    getStatusLabel,

    // State & Actions
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    categoryTypesData,

    // API passthrough
    createLog: createMaintenanceLog,
  };
};
