import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import userService from '../../../../../services/UserService';
import { fetchClassifications, fetchStatuses, fetchAssetGroups, fetchMainTypes, fetchCategoryTypes } from '../../../../../services/AssetService';
import { showError } from '../../../../Notification';
import { initialAssetState, validateAssetForm } from '../constants/assetConstants';

// Utility: debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  const assetGroupCache = useRef(null);
  const mainTypeCache = useRef(null);
  const categoryTypesCache = useRef(null);

  // ✅ NEW: Debounced karyawan search function
  const debouncedSearchKaryawan = useCallback(debounce((searchTerm, setOptionsCallback) => {
    if (!searchTerm || searchTerm.length < 2) {
      setOptionsCallback(karyawanOptions);
      return;
    }

    const filtered = karyawanOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setOptionsCallback(filtered);
  }, 300), [karyawanOptions]);

  // Focus first input when modal opens & initialize data
  useEffect(() => {
    if (show) {
      setErrors({});
      if (asset) {
        // Mode Edit: Inisialisasi dengan data asset yang ada
        const purchasePrice = asset.purchase_price_actual ?? asset.purchase_price ?? asset.purchase_price_plan ?? "";
        const purchasePricePlan = asset.purchase_price_plan ?? '';
        const tahunBeli = asset.tahunBeli || (asset.po_date_period ? asset.po_date_period.toString().slice(0,4) : '');
        const tahunDepreciation = asset.tahunDepreciation || (asset.useful_life_year ? asset.useful_life_year.toString() : '') || '';
        
        const assetData = {
          ...initialAssetState,
          ...asset,
          purchase_price_plan: purchasePricePlan,
          purchase_price_actual: purchasePrice,
          tahunBeli,
          tahunDepreciation,
          // Mapping fields yang mungkin berbeda penamaan antara API dan Form
          noAsset: asset.noAsset || asset.asset_tag || "",
          nama: asset.nama || asset.asset_name || "",
          asset_main_type_id: asset.asset_main_type_id || "",
          category_id: asset.category_id || "",
          sub_category_id: asset.sub_category_id || "",
          asset_group_id: asset.asset_group_id || "",
          nik: asset.nik || "",
          dept: asset.dept || asset.department || "",
          hostname: asset.hostname || "",
          status: asset.status || asset.current_status || "Active",
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
      console.log('🔍 DEBUG fetchMainTypes - show:', show, 'cache:', !!mainTypeCache.current);
      if (mainTypeCache.current) {
        console.log('✅ Using mainType cache:', mainTypeCache.current.length, 'options');
        setMainTypeOptions(mainTypeCache.current);
        return;
      }

      try {
        console.log('📡 Calling fetchMainTypes API...');
        const res = await fetchMainTypes();
        console.log('📥 MainTypes response:', res?.data);
        const data = Array.isArray(res?.data) ? res.data : [];
        const options = data.map(mt => ({ 
          value: String(mt.asset_main_type_id),  // ✅ FORCE STRING
          label: mt.main_type_name 
        }));
        mainTypeCache.current = options;
        console.log('✅ MainType options ready:', options.length, options[0]);
        setMainTypeOptions(options);
      } catch (err) {
        console.error('❌ Failed to load main types:', err);
        setMainTypeOptions([]);
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
      const matched = mainTypeOptions.some(o => String(o.value) === stringValue);
      
      if (!matched) {
        console.warn(`🚨 MAIN TYPE MISMATCH: value="${stringValue}" not in options (${mainTypeOptions.length} opts)`);
        console.log('Available options:', mainTypeOptions.map(o => ({v: o.value, l: o.label})));
        // Optional: refetch jika mismatch
        // mainTypeCache.current = null;
        // fetchMainTypesData();
      } else {
        console.log(`✅ MAIN TYPE SYNC OK: "${stringValue}" matched`);
      }
    }
  }, [show, newAsset.asset_main_type_id, mainTypeOptions.length]);

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
        data.forEach(item => {
          if (!categoryMap.has(item.category_id)) {
            categoryMap.set(item.category_id, {
              value: item.category_id,
              label: item.category,
              category_id: item.category_id
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
        const res = await fetchCategoryTypes(null, newAsset.asset_main_type_id, newAsset.category_id);
        const data = Array.isArray(res?.data) ? res.data : [];
        
        // Extract sub_categories dari response
        const subCategories = [];
        data.forEach(item => {
          if (item.sub_categories && Array.isArray(item.sub_categories)) {
            item.sub_categories.forEach(sub => {
              subCategories.push({
                value: sub.sub_category_id,
                label: sub.sub_category_name,
                sub_category_id: sub.sub_category_id,
                category_id: item.category_id
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
        const options = data.map(g => ({ 
          value: g.asset_group_id || g.asset_group_name, 
          label: g.asset_group_name,
          asset_group_id: g.asset_group_id 
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
        const cachedOptions = karyawanCache.current.map(k => ({ value: k.nik, label: `${k.nik} - ${k.nama}` }));
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
        const options = data.map(k => ({ value: k.nik, label: `${k.nik} - ${k.nama}` }));
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
          .filter(s => s.is_active !== false)
          .map(s => ({ value: s.status_name, label: s.status_name }));
        statusCache.current = options;
        setStatusOptions(options);
      } catch (err) {
        console.error('Failed to load statuses:', err);
        setStatusOptions([]);
      }
    };

    fetchStatusesData();
  }, [show]);

  // Cache classifications - hanya muncul jika sub_category = PC
  useEffect(() => {
    if (!show) return;
    
    // Cek apakah sub category adalah PC (bisa dari API atau dari props)
    const isPC = (newAsset.sub_category?.toLowerCase() === 'pc') || 
                 (newAsset.sub_category_name?.toLowerCase() === 'pc');
    
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
      .then(res => {
        const data = Array.isArray(res?.data) ? res.data : [];
        const options = data.map(c => ({ value: c.classification_id, label: c.classification_name }));
        classificationCache.current = options;
        setClassificationOptions(options);
      })
      .catch(err => {
        console.error('Failed to load classifications:', err);
        showError('Gagal memuat classification. Silakan refresh halaman.');
        setClassificationOptions([]);
      })
      .finally(() => setLoadingClassification(false));
  }, [show, newAsset.sub_category, newAsset.sub_category_name]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Format untuk fields khusus
    let formattedValue = value;
    
    const baseAsset = { 
      ...newAsset, 
      [name]: formattedValue 
    };
    
    // Auto-format tahunBeli ke YYYY01 untuk BE + calculate depreciation_end_date (+6 tahun)
    if (name === 'tahunBeli') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        formattedValue = `${year}01`;
        baseAsset[name] = formattedValue;
        
        // Auto calculate akhir depresiasi: +6 tahun (default)
        const endYear = year + 6;
        baseAsset.depreciation_end_date = `${endYear}-12-31`; // Format date input (YYYY-MM-DD)
      }
    }
    
    // Validasi tahunDepreciation 1-30
    if (name === 'tahunDepreciation') {
      const numValue = parseInt(value);
      if (value && (isNaN(numValue) || numValue < 1 || numValue > 30)) {
        setErrors(prev => ({ ...prev, tahunDepreciation: 'Harus 1-30 tahun' }));
        formattedValue = value;
      } else {
        if (errors.tahunDepreciation) {
          setErrors(prev => ({ ...prev, tahunDepreciation: null }));
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
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors, newAsset]);

  // Handle Select changes
  const handleSelectChange = useCallback((name, selectedOption) => {
    const value = selectedOption?.value ?? '';
    const assetGroupId = selectedOption?.asset_group_id || '';
    const label = selectedOption?.label || '';
    
    setNewAsset(prev => ({ 
      ...prev, 
      [name]: value,
      // Also set asset_group_id when assetGroup is selected
      ...(name === 'assetGroup' ? { asset_group_id: assetGroupId } : {})
    }));

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Handle Main Type change - reset semua yang di bawahnya
    if (name === 'asset_main_type_id') {
      setNewAsset(prev => ({ 
        ...prev, 
        asset_main_type_id: value,
        asset_main_type_name: label,
        category: '',
        category_id: '',
        sub_category: '',
        sub_category_id: '',
        classification_id: '',
        assetGroup: '',
        asset_group_id: ''
      }));
      setCategoryOptionsApi([]);
      setSubCategoryOptionsApi([]);
      setAssetGroupOptions([]);
      setClassificationOptions([]);
    } 
    // Handle Category change
    else if (name === 'category' || name === 'category_id') {
      const catId = name === 'category_id' ? value : selectedOption?.category_id;
      const catName = name === 'category' ? value : label;
      setNewAsset(prev => ({ 
        ...prev, 
        category: catName,
        category_id: catId,
        sub_category: '',
        sub_category_id: '',
        classification_id: '',
        assetGroup: '',
        asset_group_id: ''
      }));
      setSubCategoryOptionsApi([]);
      setAssetGroupOptions([]);
      setClassificationOptions([]);
    } 
    // Handle Sub Category change
    else if (name === 'sub_category' || name === 'sub_category_id') {
      const subCatId = name === 'sub_category_id' ? value : selectedOption?.sub_category_id;
      const subCatName = name === 'sub_category' ? value : label;
      setNewAsset(prev => ({ 
        ...prev, 
        sub_category: subCatName,
        sub_category_id: subCatId,
        classification_id: '',
        assetGroup: '',
        asset_group_id: ''
      }));
      setClassificationOptions([]);
      setAssetGroupOptions([]);
    } 
    // Handle NIK change - fill dept
    else if (name === 'nik') {
      const selectedKaryawan = karyawanList.find(k => k.nik === value);
      setNewAsset(prev => ({ 
        ...prev,
        nik: value,
        dept: selectedKaryawan?.dept || ''
      }));
    }
  }, [karyawanList, errors]);

  // Handle file selection
  const handleFileChange = useCallback((e, alertWarning) => {
    const files = Array.from(e.target.files);
    const existingNames = new Set(attachments.map(a => a.name));
    const newAttachments = [];

    files.forEach(file => {
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
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  }, [attachments]);

  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Helper untuk Select value dengan type coercion + fallback label (FIX MAIN TYPE ISSUE)
  const getSelectValue = useCallback((options, value) => {
    if (!value) return null;
    
    // Loose matching dengan type coercion
    const stringValue = String(value);
    const matchedOption = options.find(o => String(o.value) === stringValue);
    
    if (matchedOption) {
      console.log(`✅ getSelectValue MATCH: value="${stringValue}" → "${matchedOption.label}"`);
      return matchedOption;
    }
    
    // Fallback: cari berdasarkan label jika exact ID tidak ketemu (edit mode)
    const labelMatch = options.find(o => String(o.label).toLowerCase().includes(stringValue.toLowerCase()));
    if (labelMatch) {
      console.warn(`⚠️ getSelectValue FALLBACK LABEL: "${stringValue}" → "${labelMatch.label}"`);
      return labelMatch;
    }
    
    console.warn(`❌ getSelectValue NO MATCH: value="${stringValue}", options=${options.length}`);
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
    return (newAsset.sub_category?.toLowerCase() === 'pc') || 
           (newAsset.sub_category_name?.toLowerCase() === 'pc') ||
           (subCategoryOptionsApi.find(s => s.sub_category_id === newAsset.sub_category_id || s.value === newAsset.sub_category_id)?.label?.toLowerCase() === 'pc');
  }, [newAsset.sub_category, newAsset.sub_category_name, newAsset.sub_category_id, subCategoryOptionsApi]);

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

