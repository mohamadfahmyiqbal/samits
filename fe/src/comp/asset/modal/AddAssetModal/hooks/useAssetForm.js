import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import userService from '../../../../../services/UserService';
import {
  fetchClassifications,
  fetchStatuses,
  fetchAssetGroups,
  fetchMainTypes,
  fetchCategoryTypes,
} from '../../../../../services/AssetService';
import { showError } from '../../../../../comp/Notification';
import { initialAssetState, validateAssetForm } from '../constants/assetConstants';

export const useAssetForm = (show, asset = null) => {
  const [newAsset, setNewAsset] = useState(initialAssetState);
  const [karyawanList, setKaryawanList] = useState([]);
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [loadingClassification, setLoadingClassification] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredKaryawanOptions, setFilteredKaryawanOptions] = useState([]);

  // Dynamic options from API
  const [statusOptions, setStatusOptions] = useState([]);
  const [assetGroupOptions, setAssetGroupOptions] = useState([]);
  const [mainTypeOptions, setMainTypeOptions] = useState([]);
  const [categoryOptionsApi, setCategoryOptionsApi] = useState([]);
  const [subCategoryOptionsApi, setSubCategoryOptionsApi] = useState([]);

  const firstInputRef = useRef(null);
  const formRef = useRef(null);
  const karyawanCache = useRef(null);
  const classificationCache = useRef(null);
  const statusCache = useRef(null);
  const mainTypeCache = useRef(null);

  // ✅ NEW: Debounced karyawan search function
  const debouncedSearchKaryawan = useCallback(
    (searchTerm, setOptionsCallback) => {
      const timeoutId = setTimeout(() => {
        if (!searchTerm || searchTerm.length < 2) {
          setOptionsCallback(karyawanOptions);
          return;
        }

        const filtered = karyawanOptions.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setOptionsCallback(filtered);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [karyawanOptions]
  );

  // Focus first input when modal opens & initialize data
  useEffect(() => {
    if (show) {
      setErrors({});
      if (asset) {
        // Mode Edit: Inisialisasi dengan data asset yang ada
        const purchasePrice =
          asset.purchase_price_actual ?? asset.purchase_price ?? asset.purchase_price_plan ?? '';
        const purchasePricePlan = asset.purchase_price_plan ?? '';
        const tahunBeli =
          asset.tahunBeli ||
          (asset.po_date_period ? asset.po_date_period.toString().slice(0, 4) : '');
        const tahunDepreciation =
          asset.tahunDepreciation ||
          (asset.useful_life_year ? asset.useful_life_year.toString() : '') ||
          '';

        const assetData = {
          ...initialAssetState,
          ...asset,
          purchase_price_plan: purchasePricePlan,
          purchase_price_actual: purchasePrice,
          tahunBeli,
          tahunDepreciation,
          // Mapping fields yang mungkin berbeda penamaan antara API dan Form
          noAsset: asset.noAsset || asset.asset_tag || '',
          nama: asset.nama || asset.asset_name || '',
          asset_main_type_id: asset.asset_main_type_id || '',
          category_id: asset.category_id || '',
          sub_category_id: asset.sub_category_id || '',
          asset_group_id: asset.asset_group_id || '',
          assetGroup: asset.assetGroup || asset.asset_group_name || '',
          classification_id: asset.classification_id || asset.classification || '',
          sub_category: asset.sub_category || asset.sub_category_name || asset.type || '',
          sub_category_name: asset.sub_category_name || asset.sub_category || asset.type || '',
          type: asset.type || '',
          nik: asset.nik || '',
          dept: asset.dept || asset.department || '',
          hostname: asset.hostname || '',
          status: asset.status || asset.current_status || 'Active',
          depreciation_end_date: asset.depreciation_end_date || '',
          mainIpAdress: asset.mainIpAdress || asset.ip_address || asset.main_ip_address || '',
          backupIpAdress: asset.backupIpAdress || '',
          accounting_asset_no: asset.accounting_asset_no || asset.asset_tag || '',
          acquisition_status: asset.acquisition_status || initialAssetState.acquisition_status,
          request_id: asset.request_id || '',
          invoice_number: asset.invoice_number || '',
        };

        // ✅ AUTO-SYNC Edit mode: accounting_asset_no = noAsset
        assetData.accounting_asset_no = assetData.noAsset;

        setNewAsset(assetData);
        setExistingDocuments(asset.documents || []);
      } else {
        // Mode Add: Inisialisasi dengan state kosong
        setNewAsset(initialAssetState);
        setExistingDocuments([]);
      }
      setAttachments([]);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [show, asset]);

  // Fetch Main Types from API + VALIDASI SYNC
  useEffect(() => {
    if (!show) return;

    const fetchMainTypesData = async () => {
      if (mainTypeCache.current) {
        setMainTypeOptions(mainTypeCache.current);
        return;
      }

      try {
        const res = await fetchMainTypes();

        const data = Array.isArray(res?.data) ? res.data : [];

        const options = data.map((mt, i) => {
          const opt = {
            value: String(mt.asset_main_type_id),
            label: mt.main_type_name,
            fieldName: 'asset_main_type_id', // Tambahan untuk auto-infer
          };

          return opt;
        });

        mainTypeCache.current = options;

        setMainTypeOptions(options);
      } catch (err) {
        console.error('❌ Failed to load main types:', err);
        // Fallback dummy untuk testing
        const fallback = [
          { value: '1', label: 'UTAMA', fieldName: 'asset_main_type_id' },
          { value: '2', label: 'CLIENT', fieldName: 'asset_main_type_id' },
        ];

        setMainTypeOptions(fallback);
      }
    };

    fetchMainTypesData();
  }, [show]);

  // ✅ NEW: Sync validation - jika value ada tapi tidak match options, log & refetch
  useEffect(() => {
    const currentValue = newAsset.asset_main_type_id;
    const hasOptions = mainTypeOptions.length > 0;

    if (show && currentValue && hasOptions) {
      const stringValue = String(currentValue);
      const matched = mainTypeOptions.some((o) => String(o.value) === stringValue);

      if (!matched) {
        console.warn(
          `🚨 MAIN TYPE MISMATCH: value="${stringValue}" not in options (${mainTypeOptions.length} opts)`
        );

        // Optional: refetch jika mismatch
        // mainTypeCache.current = null;
        // fetchMainTypesData();
      } else {
      }
    }
  }, [show, newAsset.asset_main_type_id, mainTypeOptions]);

  // Fetch Categories based on Main Type
  useEffect(() => {
    if (!show || !newAsset.asset_main_type_id) {
      setCategoryOptionsApi([]);
      return;
    }

    const fetchCategoriesByMainType = async () => {
      try {
        // Gunakan categoryTypes untuk dapat hierarchy lengkap
        const res = await fetchCategoryTypes(null, newAsset.asset_main_type_id);
        const data = Array.isArray(res?.data) ? res.data : [];

        // Extract unique categories
        const uniqueCategories = [];
        const categoryMap = new Map();
        data.forEach((item) => {
          if (!categoryMap.has(item.category_id)) {
            categoryMap.set(item.category_id, {
              value: item.category_id,
              label: item.category,
              category_id: item.category_id,
            });
            uniqueCategories.push(categoryMap.get(item.category_id));
          }
        });
        setCategoryOptionsApi(uniqueCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategoryOptionsApi([]);
      }
    };

    fetchCategoriesByMainType();
  }, [show, newAsset.asset_main_type_id]);

  // Fetch Sub Categories based on Category
  useEffect(() => {
    if (!show || !newAsset.category_id) {
      setSubCategoryOptionsApi([]);
      return;
    }

    const fetchSubCategoriesByCategory = async () => {
      try {
        const res = await fetchCategoryTypes(
          null,
          newAsset.asset_main_type_id,
          newAsset.category_id
        );
        const data = Array.isArray(res?.data) ? res.data : [];

        // Extract sub_categories dari response
        const subCategories = [];
        data.forEach((item) => {
          if (item.sub_categories && Array.isArray(item.sub_categories)) {
            item.sub_categories.forEach((sub) => {
              subCategories.push({
                value: sub.sub_category_id,
                label: sub.sub_category_name,
                sub_category_id: sub.sub_category_id,
                category_id: item.category_id,
              });
            });
          }
        });
        setSubCategoryOptionsApi(subCategories);
      } catch (err) {
        console.error('Failed to load sub categories:', err);
        setSubCategoryOptionsApi([]);
      }
    };

    fetchSubCategoriesByCategory();
  }, [show, newAsset.category_id, newAsset.asset_main_type_id]);

  // Fetch Asset Groups based on Sub Category
  useEffect(() => {
    if (!show || !newAsset.sub_category_id) {
      return;
    }

    const fetchAssetGroupsBySubCategory = async () => {
      try {
        const res = await fetchAssetGroups(null, null, newAsset.sub_category_id);
        const data = Array.isArray(res?.data) ? res.data : [];
        const options = data.map((g) => ({
          value: g.asset_group_id || g.asset_group_name,
          label: g.asset_group_name,
          asset_group_id: g.asset_group_id,
        }));
        setAssetGroupOptions(options);
      } catch (err) {
        console.error('Failed to load asset groups:', err);
        setAssetGroupOptions([]);
      }
    };

    fetchAssetGroupsBySubCategory();
  }, [show, newAsset.sub_category_id]);

  // Cache data karyawan untuk menghindari fetch berulang
  useEffect(() => {
    if (!show) return;

    const fetchKaryawan = async () => {
      if (karyawanCache.current) {
        const cachedOptions = karyawanCache.current.map((k) => ({
          value: k.nik,
          label: `${k.nik} - ${k.nama}`,
        }));
        setKaryawanList(karyawanCache.current);
        setKaryawanOptions(cachedOptions);
        setFilteredKaryawanOptions(cachedOptions);
        return;
      }

      setLoadingKaryawan(true);
      try {
        const response = await userService.getAllKaryawan();
        const data = response.data || [];
        karyawanCache.current = data;
        setKaryawanList(data);
        const options = data.map((k) => ({ value: k.nik, label: `${k.nik} - ${k.nama}` }));
        setKaryawanOptions(options);
        setFilteredKaryawanOptions(options);
      } catch (error) {
        console.error('Error fetching karyawan:', error);
        showError('Gagal memuat data karyawan. Silakan refresh halaman.');
      } finally {
        setLoadingKaryawan(false);
      }
    };

    fetchKaryawan();
  }, [show]);

  // Fetch statuses from API
  useEffect(() => {
    if (!show) return;

    const fetchStatusesData = async () => {
      if (statusCache.current) {
        setStatusOptions(statusCache.current);
        return;
      }

      try {
        const res = await fetchStatuses();
        const data = Array.isArray(res?.data) ? res.data : [];
        const options = data
          .filter((s) => s.is_active !== false)
          .map((s) => ({ value: s.status_name, label: s.status_name }));
        statusCache.current = options;
        setStatusOptions(options);
      } catch (err) {
        console.error('Failed to load statuses:', err);
        setStatusOptions([]);
      }
    };

    fetchStatusesData();
  }, [show]);

  // Cache classifications - hanya muncul jika sub_category mengandung PC
  useEffect(() => {
    if (!show) return;

    const subLabel = (
      newAsset.sub_category_name ||
      newAsset.sub_category ||
      newAsset.type ||
      ''
    ).toLowerCase();
    const isPC = subLabel === 'pc' || subLabel.includes('pc');

    if (!isPC) {
      setClassificationOptions([]);
      return;
    }

    if (classificationCache.current) {
      setClassificationOptions(classificationCache.current);
      return;
    }

    setLoadingClassification(true);
    fetchClassifications()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        const options = data.map((c) => ({
          value: c.classification_id,
          label: c.classification_name,
        }));
        classificationCache.current = options;
        setClassificationOptions(options);
      })
      .catch((err) => {
        console.error('Failed to load classifications:', err);
        showError('Gagal memuat classification. Silakan refresh halaman.');
        setClassificationOptions([]);
      })
      .finally(() => setLoadingClassification(false));
  }, [show, newAsset.sub_category, newAsset.sub_category_name, newAsset.type]);

  // Handle form input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Format untuk fields khusus
      let formattedValue = value;

      const baseAsset = {
        ...newAsset,
        [name]: formattedValue,
      };

      // Auto-format tahunBeli: simpan full date untuk display, calculate depreciation_end_date
      if (name === 'tahunBeli') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          // Simpan full date untuk display di form
          baseAsset[name] = value;
          // Simpan juga po_date_period untuk backend (YYYY01 format)
          baseAsset.po_date_period = `${year}01`;

          // Auto calculate akhir depresiasi: +6 tahun (default)
          const endYear = year + 6;
          baseAsset.depreciation_end_date = `${endYear}-12-31`; // Format date input (YYYY-MM-DD)
        }
      }

      // Validasi tahunDepreciation 1-30
      if (name === 'tahunDepreciation') {
        const numValue = parseInt(value);
        if (value && (isNaN(numValue) || numValue < 1 || numValue > 30)) {
          setErrors((prev) => ({ ...prev, tahunDepreciation: 'Harus 1-30 tahun' }));
          formattedValue = value;
        } else {
          if (errors.tahunDepreciation) {
            setErrors((prev) => ({ ...prev, tahunDepreciation: null }));
          }
          formattedValue = numValue.toString();
        }
      }

      if (name === 'noAsset' || name === 'hostname') {
        formattedValue = value.toUpperCase();
        baseAsset[name] = formattedValue;
      }

      // ✅ AUTO-SYNC: No. Asset → No. Akuntansi Aset (sama persis)
      if (name === 'noAsset') {
        baseAsset.accounting_asset_no = formattedValue;
      }

      setNewAsset(baseAsset);

      // Clear error when user starts typing (kecuali tahunDepreciation)
      if (errors[name] && name !== 'tahunDepreciation') {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors, newAsset]
  );

  // Handle Select changes

  const handleSelectChange = useCallback(
    (name, selectedOption) => {
      const option =
        typeof selectedOption === 'string' || typeof selectedOption === 'number'
          ? { value: selectedOption, label: String(selectedOption) }
          : selectedOption;

      // Auto-infer name jika tidak diberikan (untuk OptimizedSelect)
      const fieldName = name || selectedOption?.fieldName || 'unknown';
      const value = option?.value ?? '';
      const label = option?.label ?? '';
      const assetGroupId = option?.asset_group_id || '';

      // Basic update
      setNewAsset((prev) => ({
        ...prev,
        [fieldName]: value,
        ...(fieldName === 'assetGroup' ? { asset_group_id: assetGroupId } : {}),
        ...(fieldName === 'asset_main_type_id' ? { asset_main_type_name: label } : {}),
        ...(fieldName === 'sub_category_id'
          ? { sub_category: label, sub_category_name: label }
          : {}),
      }));

      // Clear error
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: null }));
      }

      // Cascade reset logic
      if (fieldName === 'asset_main_type_id') {
        setNewAsset((prev) => ({
          ...prev,
          asset_main_type_id: value,
          asset_main_type_name: label,
          category: '',
          category_id: '',
          sub_category: '',
          sub_category_id: '',
          classification_id: '',
          assetGroup: '',
          asset_group_id: '',
        }));
        setCategoryOptionsApi([]);
        setSubCategoryOptionsApi([]);
        setAssetGroupOptions([]);
        setClassificationOptions([]);
      } else if (fieldName === 'category_id') {
        setNewAsset((prev) => ({
          ...prev,
          category_id: value,
          sub_category: '',
          sub_category_id: '',
          classification_id: '',
          assetGroup: '',
          asset_group_id: '',
        }));
        setSubCategoryOptionsApi([]);
        setAssetGroupOptions([]);
        setClassificationOptions([]);
      } else if (fieldName === 'sub_category_id') {
        setNewAsset((prev) => ({
          ...prev,
          sub_category_id: value,
          classification_id: '',
          assetGroup: '',
          asset_group_id: '',
        }));
        setClassificationOptions([]);
        setAssetGroupOptions([]);
      } else if (fieldName === 'nik') {
        const selectedKaryawan = karyawanList.find((k) => k.nik === value);

        setNewAsset((prev) => ({
          ...prev,
          nik: value,
          dept: selectedKaryawan?.dept || '',
        }));
      }
    },
    [karyawanList, errors]
  );

  // Handle file selection
  const handleFileChange = useCallback(
    (e, alertWarning) => {
      const files = Array.from(e.target.files);
      const existingNames = new Set(attachments.map((a) => a.name));
      const newAttachments = [];

      files.forEach((file) => {
        if (file.type !== 'application/pdf') {
          alertWarning(`File ${file.name}: Hanya file PDF yang diperbolehkan`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alertWarning(`File ${file.name}: Ukuran file maksimal 10MB`);
          return;
        }
        if (existingNames.has(file.name)) {
          alertWarning(`File ${file.name} sudah ada dalam daftar`);
          return;
        }
        newAttachments.push(file);
        existingNames.add(file.name);
      });

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
      e.target.value = '';
    },
    [attachments]
  );

  const removeAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Helper untuk Select value dengan type coercion + fallback label (FIX MAIN TYPE ISSUE)
  const getSelectValue = useCallback((options, value) => {
    if (!value) return null;

    // Loose matching dengan type coercion
    const stringValue = String(value);
    const matchedOption = options.find((o) => String(o.value) === stringValue);

    if (matchedOption) {
      return matchedOption;
    }

    // Fallback: cari berdasarkan label jika exact ID tidak ketemu (edit mode)
    const labelMatch = options.find((o) =>
      String(o.label).toLowerCase().includes(stringValue.toLowerCase())
    );
    if (labelMatch) {
      // Debug: console.warn(`getSelectValue FALLBACK LABEL: "${stringValue}" → "${labelMatch.label}"`);
      return labelMatch;
    }

    // Debug: console.warn(`getSelectValue NO MATCH: value="${stringValue}", options=${options.length}`);
    return null;
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = validateAssetForm(newAsset);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newAsset]);

  // Check if sub category is PC
  const isPC = useMemo(() => {
    return (
      newAsset.sub_category?.toLowerCase() === 'pc' ||
      newAsset.sub_category_name?.toLowerCase() === 'pc' ||
      subCategoryOptionsApi
        .find(
          (s) =>
            s.sub_category_id === newAsset.sub_category_id || s.value === newAsset.sub_category_id
        )
        ?.label?.toLowerCase() === 'pc'
    );
  }, [
    newAsset.sub_category,
    newAsset.sub_category_name,
    newAsset.sub_category_id,
    subCategoryOptionsApi,
  ]);

  return {
    // Refs
    firstInputRef,
    formRef,

    // State
    newAsset,
    setNewAsset,
    karyawanList,
    classificationOptions,
    karyawanOptions,
    filteredKaryawanOptions,
    loadingKaryawan,
    loadingClassification,
    attachments,
    existingDocuments,
    setExistingDocuments,
    errors,
    setErrors,
    // Dynamic options from API
    statusOptions,
    assetGroupOptions,
    mainTypeOptions,
    categoryOptionsApi,
    subCategoryOptionsApi,
    isPC,

    // Helpers
    getSelectValue,

    // Handlers
    handleChange,
    handleSelectChange,
    handleFileChange,
    removeAttachment,
    validateForm,
    debouncedSearchKaryawan,
  };
};
