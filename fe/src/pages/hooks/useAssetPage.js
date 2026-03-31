import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AssetContext } from '../../context/AssetContext';
import {
  createAsset,
  deleteAsset,
  fetchAssets,
  fetchAssetsByQuery,
  fetchAssetGroups,
  fetchCategories,
  fetchCategoryTypes,
  fetchSubCategories,
  fetchMainTypes,
  updateAsset,
  getAssetDetails,
} from '../../services/AssetService';
import { showError, showSuccess, alertConfirm } from '../../comp/Notification';
import { useDebounce } from '../../hooks/useDebounce';
import socketService from '../../services/SocketService';

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeMainTypeKey(value) {
  const normalized = normalize(value);
  if (!normalized) return '';
  if (['asset utama', 'aset utama', 'main', 'primary'].includes(normalized)) return 'utama';
  if (['klien'].includes(normalized)) return 'client';
  return normalized;
}

function toCategoryGroupName(value) {
  const normalized = normalize(value);
  if (!normalized || normalized === 'all') return undefined;
  if (normalized === 'utama') return 'ASSET UTAMA';
  if (normalized === 'client') return 'CLIENT';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function buildSubTabConfig(categoryTypes, mode) {
  if (!Array.isArray(categoryTypes)) return {};

  return categoryTypes.reduce((acc, row) => {
    const category = String(row?.category || '').trim();
    if (!category) return acc;

    const subCategories = Array.isArray(row?.sub_categories)
      ? row.sub_categories.filter(Boolean)
      : [];
    const types = Array.isArray(row?.types) ? row.types.filter(Boolean) : [];
    const source = subCategories.length > 0 ? subCategories : types;

    const mappedTypes = source
      .map((typeRow) =>
        typeof typeRow === 'string'
          ? typeRow.trim()
          : String(typeRow?.sub_category_name || typeRow?.type || typeRow?.name || '').trim()
      )
      .filter(Boolean);

    acc[category] = mode === 'type-group' ? ['All', ...mappedTypes] : mappedTypes;
    return acc;
  }, {});
}

function buildTabMeta(categoryTypes) {
  if (!Array.isArray(categoryTypes)) return {};

  return categoryTypes.reduce((acc, row) => {
    const category = String(row?.category || '').trim();
    if (!category) return acc;

    const categoryId = row?.category_id ?? row?.it_category_id ?? row?.categoryId ?? null;
    const subCategoryIds = {};
    const types = Array.isArray(row?.types) ? row.types.filter(Boolean) : [];
    const subCategories = Array.isArray(row?.sub_categories)
      ? row.sub_categories.filter(Boolean)
      : [];

    types.forEach((typeRow) => {
      if (!typeRow || typeof typeRow === 'string') return;
      const subCategoryName = String(
        typeRow?.sub_category_name || typeRow?.type || typeRow?.name || ''
      ).trim();
      if (!subCategoryName) return;
      subCategoryIds[subCategoryName] =
        typeRow?.sub_category_id ?? typeRow?.subCategoryId ?? typeRow?.id ?? null;
    });

    subCategories.forEach((subRow) => {
      const subCategoryName = String(subRow?.sub_category_name || subRow?.name || '').trim();
      if (!subCategoryName) return;
      subCategoryIds[subCategoryName] =
        subRow?.sub_category_id ?? subRow?.subCategoryId ?? subRow?.id ?? null;
    });

    acc[category] = {
      category_id: categoryId,
      sub_category_ids: subCategoryIds,
    };
    return acc;
  }, {});
}

export default function useAssetPage({
  contextKey,
  categoryTypeGroup,
  successLabel,
  mainFilterMode = 'category',
  requireSubCategorySelection = false,
  useQueryFetch = false,
  useLocalAssets = false,
  fetchGroup,
  enableAssetGroupTabs = false,
  defaultAssetGroupTab = 'all',
}) {
  const assetContext = useContext(AssetContext);
  const contextAssets = Array.isArray(assetContext?.[contextKey]) ? assetContext[contextKey] : [];
  const setContextAssets =
    typeof contextKey === 'string' && contextKey.length > 0
      ? assetContext?.[`set${contextKey.charAt(0).toUpperCase()}${contextKey.slice(1)}`]
      : null;
  const refreshAssets = assetContext?.refreshAssets;
  const assetContextError = assetContext?.error;
  const [localAssets, setLocalAssets] = useState([]);

  const assets = useLocalAssets ? localAssets : contextAssets;
  const setAssets = useLocalAssets ? setLocalAssets : setContextAssets;
  const effectiveFetchGroup = fetchGroup !== undefined ? fetchGroup : contextKey;

  const [assetGroups, setAssetGroups] = useState(['all', 'utama', 'client']);
  const [mainTypes, setMainTypes] = useState([]);
  const [subTabConfig, setSubTabConfig] = useState({});
  const [tabMeta, setTabMeta] = useState({});

  const [activeMainType, setActiveMainType] = useState('All');
  const [activeMainTypeId, setActiveMainTypeId] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState(requireSubCategorySelection ? '' : 'All');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState(null);
  const [activeAssetGroup, setActiveAssetGroup] = useState(defaultAssetGroupTab);
  const resolvedCategoryTypeGroup = enableAssetGroupTabs
    ? toCategoryGroupName(activeAssetGroup)
    : categoryTypeGroup;
  const resolvedFetchGroup = enableAssetGroupTabs ? null : effectiveFetchGroup;
  const resolvedMainTypeId = enableAssetGroupTabs
    ? activeMainTypeId !== undefined && activeMainTypeId !== null
      ? Number(activeMainTypeId)
      : null
    : null;
  const [search, setSearch] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [sortField, setSortField] = useState('noAsset');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalDetail, setModalDetail] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitializedRef = useRef(false);
  const loadInitialRequestRef = useRef(0);
  const tabQueryRequestRef = useRef(0);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedSearchYear = useDebounce(searchYear, 300);

  // Fetch asset groups from database, filtered by selected main type
  useEffect(() => {
    if (!enableAssetGroupTabs) return;

    const fetchGroups = async () => {
      try {
        const response = await fetchAssetGroups(activeMainTypeId);
        const groups = Array.isArray(response?.data)
          ? response.data
              .map((row) =>
                typeof row === 'string'
                  ? row
                  : row?.asset_group_name || row?.group || row?.name || ''
              )
              .map((value) => String(value || '').trim())
              .filter(Boolean)
          : [];

        if (groups.length > 0) {
          setAssetGroups(groups);
          setActiveAssetGroup((prev) => {
            const exists = groups.some((group) => normalize(group) === normalize(prev));
            if (exists) return prev;
            if (normalize(defaultAssetGroupTab) === 'all') return 'all';
            return groups[0];
          });
        } else {
          setAssetGroups([]);
        }
      } catch (err) {
        console.error('Gagal memuat asset groups:', err);
        // Keep current asset groups on error
      }
    };

    fetchGroups();
  }, [enableAssetGroupTabs, activeMainTypeId, defaultAssetGroupTab]);

  // Fetch main types from database
  useEffect(() => {
    const fetchMainTypesData = async () => {
      try {
        const response = await fetchMainTypes();
        if (Array.isArray(response?.data) && response.data.length > 0) {
          setMainTypes(response.data);
          setAssetGroups(
            response.data.map((row) => String(row?.main_type_name || '').trim()).filter(Boolean)
          );
          // Auto-select first main type if available
          setActiveMainType(response.data[0].main_type_name);
          setActiveMainTypeId(response.data[0].asset_main_type_id);
          setActiveAssetGroup(response.data[0].main_type_name || 'all');
        }
      } catch (err) {
        console.error('Gagal memuat main types:', err);
      }
    };

    fetchMainTypesData();
  }, []);

  // Reset main type selection when mainTypes changes
  useEffect(() => {
    if (mainTypes.length > 0 && !activeMainTypeId) {
      setActiveMainType(mainTypes[0].main_type_name);
      setActiveMainTypeId(mainTypes[0].asset_main_type_id);
      setActiveAssetGroup(mainTypes[0].main_type_name || 'all');
    }
  }, [mainTypes]);

  // New: Fetch assets only after mainTypes is loaded
  useEffect(() => {
    if (!useLocalAssets && typeof setAssets !== 'function') {
      setError(`Setter untuk asset group "${contextKey}" tidak ditemukan.`);
      setIsLoading(false);
      return;
    }

    // Skip if mainTypes not yet loaded
    if (mainTypes.length === 0) {
      return;
    }

    const loadInitial = async () => {
      // Skip if already initialized with data
      if (isInitializedRef.current && assets.length > 0) {
        setIsLoading(false);
        return;
      }

      const requestId = Date.now() + Math.random();
      loadInitialRequestRef.current = requestId;
      try {
        setIsLoading(true);

        const [categoryTypesResult, assetsResult] = await Promise.allSettled([
          fetchCategoryTypes(resolvedCategoryTypeGroup, activeMainTypeId),
          useQueryFetch
            ? Promise.resolve({ data: [] })
            : fetchAssets({
                group: resolvedFetchGroup,
                main_type_id: activeMainTypeId,
              }),
        ]);

        const categoryTypes =
          categoryTypesResult.status === 'fulfilled' &&
          Array.isArray(categoryTypesResult.value?.data)
            ? categoryTypesResult.value.data
            : [];

        setSubTabConfig(buildSubTabConfig(categoryTypes, mainFilterMode));
        setTabMeta(buildTabMeta(categoryTypes));

        if (!useQueryFetch) {
          const assetData =
            assetsResult.status === 'fulfilled' && Array.isArray(assetsResult.value?.data)
              ? assetsResult.value.data
              : [];
          if (loadInitialRequestRef.current === requestId) {
            setAssets(assetData);
            isInitializedRef.current = true;
          }
        }

        if (loadInitialRequestRef.current !== requestId) {
          return;
        }

        if (categoryTypesResult.status !== 'fulfilled') {
          const msg = categoryTypesResult.reason?.message || 'Gagal memuat kategori.';
          setError(`${msg} Coba refresh.`);
        } else if (!useQueryFetch && assetsResult.status !== 'fulfilled') {
          const msg = assetsResult.reason?.message || 'Gagal memuat data aset.';
          setError(`${msg} Coba refresh.`);
        } else {
          setError(null);
          isInitializedRef.current = true;
        }
      } catch (err) {
        if (loadInitialRequestRef.current === requestId) {
          setError(`Gagal memuat data: ${err.message}. Coba refresh.`);
        }
      } finally {
        if (loadInitialRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();
  }, [
    contextKey,
    resolvedFetchGroup,
    resolvedCategoryTypeGroup,
    setAssets,
    useLocalAssets,
    useQueryFetch,
    mainTypes, // Add mainTypes as dependency
    activeMainTypeId,
    assets.length,
  ]);

  // Reload categories when main type changes
  // Only run if enableAssetGroupTabs is FALSE (to avoid resetting state during subCategory selection)
  useEffect(() => {
    if (enableAssetGroupTabs) return;

    const reloadCategories = async () => {
      try {
        const response = await fetchCategoryTypes(resolvedCategoryTypeGroup, activeMainTypeId);
        const categoryTypes = Array.isArray(response?.data) ? response.data : [];

        setSubTabConfig(buildSubTabConfig(categoryTypes, mainFilterMode));
        setTabMeta(buildTabMeta(categoryTypes));

        // Reset main tab selection when main type changes
        setActiveMainTab('All');
        setActiveCategoryId(null);
        setActiveSubCategoryId(null);
        setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
      } catch (err) {
        console.error('Gagal memuat kategori berdasarkan main type:', err);
      }
    };

    if (mainTypes.length > 0) {
      reloadCategories();
    }
  }, [
    activeMainTypeId,
    resolvedCategoryTypeGroup,
    mainFilterMode,
    requireSubCategorySelection,
    mainTypes,
    enableAssetGroupTabs,
  ]);

  useEffect(() => {
    if (useQueryFetch && typeof refreshAssets === 'function') {
      refreshAssets();
    }
  }, [refreshAssets, useQueryFetch]);

  useEffect(() => {
    if (typeof setAssets !== 'function') return;

    const handleRealtimeAssetUpdated = (payload = {}) => {
      const incomingAsset = payload?.data && typeof payload.data === 'object' ? payload.data : null;
      if (!incomingAsset) return;

      const incomingNoAsset = normalize(incomingAsset?.noAsset || incomingAsset?.asset_tag);
      const originalNoAsset = normalize(payload?.originalNoAsset);

      setAssets((prev) => {
        if (!Array.isArray(prev)) return prev;

        let found = false;
        const next = prev.map((row) => {
          const rowNoAsset = normalize(row?.noAsset || row?.asset_tag);
          if (
            rowNoAsset &&
            (rowNoAsset === incomingNoAsset || (originalNoAsset && rowNoAsset === originalNoAsset))
          ) {
            found = true;
            return { ...row, ...incomingAsset };
          }
          return row;
        });

        return found ? next : [incomingAsset, ...next];
      });
    };

    socketService.on('asset:updated', handleRealtimeAssetUpdated);
    return () => {
      socketService.off('asset:updated', handleRealtimeAssetUpdated);
    };
  }, [setAssets]);

  useEffect(() => {
    if (!useQueryFetch || !activeMainTab || typeof setAssets !== 'function') return;

    const currentSubTabs = Array.isArray(subTabConfig?.[activeMainTab])
      ? subTabConfig[activeMainTab]
      : [];
    const selectedType =
      currentSubTabs.length > 0 &&
      activeSubTab &&
      activeSubTab !== '__ALL__' &&
      activeSubTab !== 'All'
        ? activeSubTab
        : null;

    const fetchByTab = async () => {
      const requestId = Date.now() + Math.random();
      tabQueryRequestRef.current = requestId;

      // DEBUG: Log query parameters
      console.log('[DEBUG] fetchAssetsByQuery params:', {
        group: resolvedFetchGroup,
        main_type_id: resolvedMainTypeId,
        category_id: activeCategoryId,
        sub_category_id: selectedType ? activeSubCategoryId : null,
        selectedType,
        activeSubTab,
      });

      try {
        setIsLoading(true);
        const response = await fetchAssetsByQuery({
          group: resolvedFetchGroup,
          main_type_id: resolvedMainTypeId,
          category_id: activeCategoryId,
          sub_category_id: selectedType ? activeSubCategoryId : null,
        });
        if (tabQueryRequestRef.current === requestId) {
          setAssets(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (err) {
        if (tabQueryRequestRef.current === requestId) {
          setError(`Gagal memuat data aset: ${err.message}`);
        }
      } finally {
        if (tabQueryRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    fetchByTab();
  }, [
    activeCategoryId,
    activeMainTab,
    activeSubCategoryId,
    activeSubTab,
    resolvedFetchGroup,
    resolvedMainTypeId,
    setAssets,
    subTabConfig,
    useQueryFetch,
  ]);

  const visibleSubTabConfig = subTabConfig;
  const visibleTabMeta = tabMeta;

  useEffect(() => {
    const isAllMainTab = normalize(activeMainTab) === 'all';
    if (isAllMainTab) return;

    if (!visibleSubTabConfig?.[activeMainTab]) {
      setActiveMainTab('All');
      setActiveCategoryId(null);
      setActiveSubCategoryId(null);
      setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
      return;
    }

    const allowedSubTabs = Array.isArray(visibleSubTabConfig[activeMainTab])
      ? visibleSubTabConfig[activeMainTab]
      : [];
    if (
      allowedSubTabs.length > 0 &&
      activeSubTab &&
      activeSubTab !== '__ALL__' &&
      activeSubTab !== 'All' &&
      !allowedSubTabs.includes(activeSubTab)
    ) {
      setActiveSubTab(requireSubCategorySelection ? '' : 'All');
      setActiveSubCategoryId(null);
    }
  }, [activeMainTab, activeSubTab, requireSubCategorySelection, visibleSubTabConfig]);

  const filtered = useMemo(() => {
    if (!activeMainTab) return [];

    const searchText = debouncedSearch ? debouncedSearch.toLowerCase() : '';
    const isAllMainTab = normalize(activeMainTab) === 'all';
    const isAllMainType = normalize(activeMainType) === 'all';
    const selectedMainTypeKey = normalizeMainTypeKey(activeMainType);
    const currentSubTabs = Array.isArray(subTabConfig?.[activeMainTab])
      ? subTabConfig[activeMainTab]
      : [];

    const requireSub = !isAllMainTab && currentSubTabs.length > 0 && requireSubCategorySelection;
    if (requireSub && !activeSubTab) return [];

      const data = assets.filter((item) => {
        const itemType = String(item?.type || '');
        const itemAssetGroup = normalize(item?.assetGroup);
        const selectedAssetGroup = normalize(activeAssetGroup);
        const shouldApplyAssetGroupFilter =
          enableAssetGroupTabs &&
          selectedAssetGroup &&
          selectedAssetGroup !== 'all' &&
          selectedAssetGroup !== normalize(activeMainType);
        const matchAssetGroup = !shouldApplyAssetGroupFilter || itemAssetGroup === selectedAssetGroup;
        const itemMainTypeKey = normalizeMainTypeKey(item?.assetGroup);
        const itemMainTypeId = Number(item?.asset_main_type_id || 0) || null;
        const matchMainType =
          isAllMainType ||
          !selectedMainTypeKey ||
          (activeMainTypeId && itemMainTypeId && Number(activeMainTypeId) === itemMainTypeId) ||
          itemMainTypeKey === selectedMainTypeKey;

        const itemCategoryName = item?.category_name || item?.category || '';

        let matchMainTab = true;
        if (mainFilterMode === 'type-group') {
          matchMainTab =
            isAllMainTab ||
            currentSubTabs.filter((value) => normalize(value) !== 'all').includes(itemType);
        } else {
          matchMainTab = isAllMainTab || normalize(itemCategoryName) === normalize(activeMainTab);
        }

      let matchSubTab = true;
      if (!isAllMainTab && currentSubTabs.length > 0) {
        const isSubAll = normalize(activeSubTab) === 'all' || activeSubTab === '__ALL__';
        matchSubTab = !activeSubTab
          ? !requireSubCategorySelection
          : isSubAll || normalize(itemType) === normalize(activeSubTab);
      }

      const matchSearch =
        !searchText ||
        (item.noAsset && item.noAsset.toLowerCase().includes(searchText)) ||
        (itemType && itemType.toLowerCase().includes(searchText)) ||
        (item.nama && item.nama.toLowerCase().includes(searchText)) ||
        (item.hostname && item.hostname.toLowerCase().includes(searchText));
      const matchYear =
        !debouncedSearchYear || String(item.tahunBeli || '') === String(debouncedSearchYear);

      return (
        matchMainType && matchAssetGroup && matchMainTab && matchSubTab && matchSearch && matchYear
      );
    });

    data.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (typeof aValue === 'string')
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      return sortAsc ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [
    activeMainTab,
    activeMainType,
    activeMainTypeId,
    activeAssetGroup,
    activeSubTab,
    assets,
    debouncedSearch,
    debouncedSearchYear,
    mainFilterMode,
    enableAssetGroupTabs,
    requireSubCategorySelection,
    sortAsc,
    sortField,
    subTabConfig,
  ]);

  // Note: Debug effect removed - add when needed for debugging
  // To enable debug logging:
  // const [debugMode, setDebugMode] = useState(false);
  // useEffect(() => { if (!debugMode) return; /* debug code */ }, [...]);
  const saveAdd = useCallback(
    async (newAsset, attachments = []) => {
      try {
        const response = await createAsset(newAsset, attachments);
        const createdAsset = response?.data;

        if (!createdAsset) {
          throw new Error('Respons server tidak berisi data asset baru.');
        }

        if (typeof setAssets === 'function') {
          setAssets((prev) => [...prev, createdAsset]);
        }

        showSuccess(`${successLabel} berhasil ditambahkan.`);
        setModalAdd(false);
        return createdAsset;
      } catch (err) {
        showError(`Gagal menambah asset: ${err.message}`);
        throw err;
      }
    },
    [setAssets, successLabel]
  );

  const saveUpdate = useCallback(
    async (updatedAsset, attachments = []) => {
      try {
        const assetNoForUrl = updatedAsset.originalNoAsset || updatedAsset.noAsset;
        const response = await updateAsset(assetNoForUrl, updatedAsset, attachments);
        const savedAsset = response?.data;

        if (!savedAsset) {
          throw new Error('Respons server tidak berisi data asset hasil update.');
        }

        if (typeof setAssets === 'function') {
          const nextNoAsset = normalize(savedAsset?.noAsset || savedAsset?.asset_tag);
          const prevNoAsset = normalize(updatedAsset?.originalNoAsset || updatedAsset?.noAsset);

          setAssets((prev) => {
            let found = false;
            const mapped = prev.map((a) => {
              const currentNoAsset = normalize(a?.noAsset || a?.asset_tag);
              if (
                currentNoAsset &&
                (currentNoAsset === nextNoAsset || (prevNoAsset && currentNoAsset === prevNoAsset))
              ) {
                found = true;
                return savedAsset;
              }
              return a;
            });
            return found ? mapped : [savedAsset, ...mapped];
          });
        }

        showSuccess(`${successLabel} berhasil diupdate.`);
        setModalUpdate(false);
        return savedAsset;
      } catch (err) {
        showError(`Gagal mengupdate asset: ${err.message}`);
        throw err;
      }
    },
    [setAssets, successLabel]
  );

  const handleDelete = useCallback(
    async (assetToDelete) => {
      alertConfirm({
        title: 'Hapus Asset',
        text: `Yakin ingin menghapus asset ${assetToDelete.noAsset}?`,
        confirmText: 'Hapus',
        cancelText: 'Batal',
        onConfirm: async () => {
          try {
            await deleteAsset(assetToDelete.noAsset);
            setAssets((prev) => prev.filter((a) => a.noAsset !== assetToDelete.noAsset));
            showSuccess(`${successLabel} berhasil dihapus.`);
          } catch (err) {
            showError(`Gagal menghapus asset: ${err.message}`);
          }
        },
      });
    },
    [setAssets, successLabel]
  );

  const handleDetail = useCallback(async (asset) => {
    try {
      // Fetch detailed data from backend
      const response = await getAssetDetails(asset.noAsset);
      const detailedAsset = response?.data || asset;
      setSelectedAsset(detailedAsset);
      setModalDetail(true);
    } catch (err) {
      console.error('Gagal mengambil detail asset:', err);
      // Fallback to using the asset from table if API fails
      setSelectedAsset(asset);
      setModalDetail(true);
    }
  }, []);

  const handleUpdate = useCallback(async (asset) => {
    try {
      console.log('[DEBUG handleUpdate] Fetching details for:', asset.noAsset);
      const response = await getAssetDetails(asset.noAsset);
      console.log('[DEBUG handleUpdate] API response:', response);
      console.log('[DEBUG handleUpdate] response.data:', response?.data);
      console.log('[DEBUG handleUpdate] documents:', response?.data?.documents);
      const detailedAsset = response?.data || asset;
      setSelectedAsset(detailedAsset);
    } catch (err) {
      console.error('Gagal memuat detail asset untuk edit:', err);
      setSelectedAsset(asset);
    } finally {
      setModalUpdate(true);
    }
  }, []);

  const handleAddNewAsset = useCallback(() => {
    setModalAdd(true);
  }, []);

  const toggleSort = useCallback(
    (field) => {
      if (field === sortField) {
        setSortAsc((prev) => !prev);
      } else {
        setSortField(field);
        setSortAsc(true);
      }
    },
    [sortField]
  );

  const handleMainTabChange = useCallback(
    async (category, meta = {}) => {
      const nextCategory = category || '';
      const isAll = normalize(nextCategory) === 'all';
      const nextCategoryId = isAll
        ? null
        : (meta?.category_id ?? tabMeta?.[nextCategory]?.category_id ?? null);

      setActiveMainTab(nextCategory);
      setActiveCategoryId(nextCategoryId);

      if (!isAll && nextCategoryId) {
        try {
          const response = await fetchSubCategories(nextCategoryId, activeMainTypeId);
          const subRows = Array.isArray(response?.rows)
            ? response.rows
            : Array.isArray(response?.data)
              ? response.data
              : [];
          const mapped = subRows
            .map((row) => String(row?.sub_category_name || '').trim())
            .filter(Boolean);

          setSubTabConfig((prev) => ({
            ...prev,
            [nextCategory]: mapped,
          }));

          setTabMeta((prev) => ({
            ...prev,
            [nextCategory]: {
              category_id: nextCategoryId,
              sub_category_ids: subRows.reduce((acc, row) => {
                const name = String(row?.sub_category_name || '').trim();
                if (!name) return acc;
                acc[name] = row?.sub_category_id ?? null;
                return acc;
              }, {}),
            },
          }));

          const hasLoadedSubCategory = mapped.length > 0;
          if (!hasLoadedSubCategory) {
            setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
          } else {
            setActiveSubTab('');
          }
        } catch (err) {
          console.error('Gagal memuat sub-categories:', err);
        }
      }

      if (isAll) {
        setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
      }
      setActiveSubCategoryId(null);
    },
    [requireSubCategorySelection, subTabConfig, tabMeta, activeMainType, activeMainTypeId]
  );

  const handleSubTabChange = useCallback(
    async (subCategory, meta = {}) => {
      const nextSubCategory = subCategory || '';
      const nextCategoryId = meta?.category_id ?? tabMeta?.[activeMainTab]?.category_id ?? null;
      const nextSubCategoryId =
        meta?.sub_category_id ??
        tabMeta?.[activeMainTab]?.sub_category_ids?.[nextSubCategory] ??
        null;

      // DEBUG: Log untuk trace ID
      console.log('[DEBUG] handleSubTabChange:', {
        activeMainTab,
        nextSubCategory,
        tabMeta: tabMeta?.[activeMainTab],
        sub_category_ids: tabMeta?.[activeMainTab]?.sub_category_ids,
        nextSubCategoryId,
        meta,
      });

      setActiveSubTab(nextSubCategory);
      setActiveCategoryId(nextCategoryId);
      setActiveSubCategoryId(nextSubCategoryId);

      if (nextSubCategoryId) {
        try {
          const groupsResponse = await fetchAssetGroups(null, null, nextSubCategoryId);
          const groups = Array.isArray(groupsResponse?.data)
            ? groupsResponse.data
                .map((row) =>
                  typeof row === 'string'
                    ? row
                    : row?.asset_group_name || row?.group || row?.name || ''
                )
                .map((value) => String(value || '').trim())
                .filter(Boolean)
            : [];

          // Only set asset groups if there are valid groups from backend
          if (groups.length > 0) {
            setAssetGroups(groups);
            setActiveAssetGroup('All'); // Default to "All" when there are valid groups
          } else {
            // Clear asset groups if no valid groups found - tabs will not be shown
            setAssetGroups([]);
            setActiveAssetGroup('');
          }
        } catch (err) {
          console.error('Gagal memuat asset groups berdasarkan sub_category_id:', err);
          // Clear on error - tabs will not be shown
          setAssetGroups([]);
          setActiveAssetGroup('');
        }
      } else {
        // No sub category selected, reset asset groups to default
        setAssetGroups(['all']);
        setActiveAssetGroup('all');
      }
    },
    [activeMainTab, tabMeta, activeMainType, activeMainTypeId]
  );

  const handleMainTypeChange = useCallback(
    (mainType, mainTypeId) => {
      const nextMainType = mainType || '';
      const isAll = normalize(nextMainType) === 'all';

      setActiveMainType(nextMainType);
      setActiveMainTypeId(isAll ? null : (mainTypeId ?? null));
      setActiveAssetGroup(isAll ? 'all' : nextMainType);
      setActiveMainTab('All');
      setActiveCategoryId(null);
      setActiveSubCategoryId(null);
      setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
      // subTabConfig & tabMeta akan di-refresh otomatis via useEffect(activeMainTypeId)
    },
    [requireSubCategorySelection]
  );

  const handleAssetGroupChange = useCallback(
    async (groupName) => {
      const nextGroup = String(groupName || '').trim();

      setActiveAssetGroup(nextGroup || 'all');

      const selectedMainType = mainTypes.find(
        (row) => normalize(row?.main_type_name) === normalize(nextGroup)
      );
      const selectedMainTypeId = selectedMainType?.asset_main_type_id ?? null;

      if (!selectedMainTypeId) return;

      try {
        const response = await fetchCategories(undefined, selectedMainTypeId);
        const rows = Array.isArray(response?.data) ? response.data : [];
        const mappedSubTabs = rows.reduce((acc, row) => {
          const categoryName = String(row?.category || '').trim();
          if (!categoryName) return acc;
          acc[categoryName] = [];
          return acc;
        }, {});
        const mappedMeta = rows.reduce((acc, row) => {
          const categoryName = String(row?.category || '').trim();
          if (!categoryName) return acc;
          acc[categoryName] = {
            category_id: row?.category_id ?? null,
            sub_category_ids: {},
          };
          return acc;
        }, {});

        setSubTabConfig(mappedSubTabs);
        setTabMeta(mappedMeta);
        setActiveMainTab('All');
        setActiveCategoryId(null);
        setActiveSubTab(requireSubCategorySelection ? '__ALL__' : 'All');
        setActiveSubCategoryId(null);
      } catch (err) {
        console.error('Gagal memuat categories berdasarkan asset_main_type_id:', err);
      }
    },
    [
      mainTypes,
      requireSubCategorySelection,
      activeMainType,
      activeMainTypeId,
      activeMainTab,
      activeSubTab,
    ]
  );

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleSearchYearChange = useCallback((value) => {
    setSearchYear(value);
  }, []);

  return {
    filtered,
    subTabConfig,
    visibleSubTabConfig,
    visibleTabMeta,
    tabMeta,
    activeMainType,
    activeMainTypeId,
    setActiveMainType,
    handleMainTypeChange,
    mainTypes,
    activeMainTab,
    activeAssetGroup,
    setActiveAssetGroup,
    handleAssetGroupChange,
    assetGroups,
    activeSubTab,
    search,
    searchYear,
    sortField,
    sortAsc,
    isLoading,
    error: error || assetContextError,
    modalDetail,
    modalUpdate,
    modalAdd,
    selectedAsset,
    setSelectedAsset,
    setSearch: handleSearchChange,
    setSearchYear: handleSearchYearChange,
    setModalDetail,
    setModalUpdate,
    setModalAdd,
    toggleSort,
    saveAdd,
    saveUpdate,
    handleDelete,
    handleDetail,
    handleUpdate,
    handleMainTabChange,
    handleSubTabChange,
    handleAddNewAsset,
  };
}
