import { useState, useCallback, useMemo, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { fetchCategoryTypes, fetchAssetsByQuery } from '../../../services/AssetService';

const normalizeValue = (value) => String(value ?? "").trim().toLowerCase();

// Helper to extract HH:mm string from log
const extractTimeString = (log, fieldType = 'start') => {
  const timeCandidate = fieldType === 'start' 
    ? (log.scheduledStartTime || log.scheduledTime)
    : (log.scheduledEndTime || log.endTime);
    
  if (!timeCandidate) return "";
  
  if (typeof timeCandidate === 'string') {
    // Match HH:mm pattern
    const match = timeCandidate.match(/([01]?\d|2[0-3]):([0-5]\d)/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : "";
  }
  
  if (timeCandidate instanceof Date && isValid(timeCandidate)) {
    return format(timeCandidate, 'HH:mm');
  }
  
  return "";
};

export const useScheduleForm = (allAssets, mainTypeOptions, getLogsForDate) => {
  const initialFormData = {
    assetMainTypeId: '',
    assetMainTypeName: '',
    categoryId: '',
    assetId: '',
    categoryName: '',
    subCategoryId: '',
    subCategoryName: '',
    scheduledDate: '',
    scheduledTime: '',
    scheduledEndDate: '',
    scheduledEndTime: '',
    pic: '',
    detail: '',
    hostname: '',
    notes: ''
  };
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [localCategoryOptions, setLocalCategoryOptions] = useState([]);
  const [localSubCategoryOptions, setLocalSubCategoryOptions] = useState([]);
  const [localItems, setLocalItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const filteredAssets = useMemo(() => [...localItems], [localItems]);
  const categoryOptions = useMemo(() => [...localCategoryOptions], [localCategoryOptions]);
  const subCategoryOptions = useMemo(() => [...localSubCategoryOptions], [localSubCategoryOptions]);

  const loadItemsForSubCategory = useCallback(async (mainTypeId, categoryId, subCategoryId, subCategoryName) => {
    if (!mainTypeId || !categoryId || !subCategoryId) {
      setLocalItems([]);
      return;
    }

    setItemsLoading(true);
    try {
      const response = await fetchAssetsByQuery({
        main_type_id: mainTypeId,
        category_id: categoryId,
        sub_category_id: subCategoryId
      });
      const data = Array.isArray(response?.data) ? response.data : [];
      const targetId = normalizeValue(subCategoryId);
      const targetName = normalizeValue(subCategoryName);
      const normalized = data.filter(asset => {
        const assetId = normalizeValue(asset.sub_category_id || asset.sub_category_id?.toString());
        const assetName = normalizeValue(asset.sub_category || asset.sub_category_name || asset.type);
        return assetId === targetId || assetName === targetName;
      });
      setLocalItems(normalized);
    } catch (err) {
      setLocalItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const isFormValid = useMemo(() => {
    return !!(
      formData.assetId &&
      formData.scheduledDate &&
      formData.scheduledTime &&
      formData.scheduledEndTime
    );
  }, [formData]);

  const loadCategoriesForMainType = useCallback(async (mainTypeId) => {
    if (!mainTypeId) {
      setLocalCategoryOptions([]);
      return;
    }

    try {
      const response = await fetchCategoryTypes(null, mainTypeId);
      const data = Array.isArray(response?.data) ? response.data : [];
      const unique = new Map();
      data.forEach(item => {
        if (!unique.has(item.category_id)) {
          unique.set(item.category_id, {
            value: item.category_id,
            label: item.category
          });
        }
      });
      setLocalCategoryOptions([...unique.values()].sort((a, b) => a.label.localeCompare(b.label)));
    } catch (err) {
      setLocalCategoryOptions([]);
    }
  }, []);

  const loadSubCategoriesForCategory = useCallback(async (mainTypeId, categoryId) => {
    if (!mainTypeId || !categoryId) {
      setLocalSubCategoryOptions([]);
      return;
    }

    try {
      const response = await fetchCategoryTypes(null, mainTypeId, categoryId);
      const data = Array.isArray(response?.data) ? response.data : [];
      const subMap = new Map();
      data.forEach(item => {
        (item.sub_categories || []).forEach(sub => {
          if (!subMap.has(sub.sub_category_id)) {
            subMap.set(sub.sub_category_id, {
              value: sub.sub_category_id,
              label: sub.sub_category_name
            });
          }
        });
      });
      setLocalSubCategoryOptions([...subMap.values()].sort((a, b) => a.label.localeCompare(b.label)));
    } catch (err) {
      setLocalSubCategoryOptions([]);
    }
  }, []);

  const handleMainTypeChange = useCallback((e) => {
    const assetMainTypeId = e.target.value;
    const selectedMainType = mainTypeOptions.find(
      (option) => String(option.value) === String(assetMainTypeId)
    );

    setFormData(prev => ({
      ...prev,
      assetMainTypeId,
      assetMainTypeName: selectedMainType?.label || '',
      categoryId: '',
      categoryName: '',
      subCategoryId: '',
      subCategoryName: '',
      assetId: '',
      hostname: ''
    }));

    setLocalSubCategoryOptions([]);
    loadCategoriesForMainType(assetMainTypeId);
    setLocalItems([]);
  }, [mainTypeOptions, loadCategoriesForMainType]);

  const handleCategoryChange = useCallback((e) => {
    const categoryId = e.target.value;
    const selectedCategory = categoryOptions.find(
      (option) => String(option.value) === String(categoryId)
    );

    setFormData(prev => ({
      ...prev,
      categoryId,
      categoryName: selectedCategory?.label || '',
      subCategoryId: '',
      subCategoryName: '',
      assetId: '',
      hostname: ''
    }));

    setLocalSubCategoryOptions([]);
    loadSubCategoriesForCategory(formData.assetMainTypeId, categoryId);
    setLocalItems([]);
  }, [categoryOptions, formData.assetMainTypeId, loadSubCategoriesForCategory]);

  const handleSubCategoryChange = useCallback((e) => {
    const subCategoryId = e.target.value;
    const selectedSubCategory = subCategoryOptions.find(
      (option) => String(option.value) === String(subCategoryId)
    );

    setFormData(prev => ({
      ...prev,
      subCategoryId,
      subCategoryName: selectedSubCategory?.label || '',
      assetId: '',
      hostname: ''
    }));
  }, [subCategoryOptions]);

  useEffect(() => {
    if (!isEditing && formData.assetMainTypeId && formData.categoryId && formData.subCategoryId) {
      loadItemsForSubCategory(
        formData.assetMainTypeId,
        formData.categoryId,
        formData.subCategoryId,
        formData.subCategoryName
      );
    }
  }, [formData.assetMainTypeId, formData.categoryId, formData.subCategoryId, loadItemsForSubCategory, isEditing]);

  const handleAssetChange = useCallback((assetId) => {
    const normalizedId = assetId === formData.assetId ? "" : assetId;
    const selectedAsset = allAssets.find(a => a.noAsset === normalizedId);
    if (selectedAsset) {
      setFormData(prev => ({
        ...prev,
        assetId: normalizedId,
        hostname: selectedAsset.hostname || '',
        assetMainTypeId: prev.assetMainTypeId || selectedAsset.asset_main_type_id || '',
        assetMainTypeName: prev.assetMainTypeName || selectedAsset.asset_main_type_name || '',
        categoryId: prev.categoryId || selectedAsset.category_id || '',
        categoryName: prev.categoryName || selectedAsset.category_name || '',
        subCategoryId: prev.subCategoryId || selectedAsset.sub_category_id || '',
        subCategoryName: prev.subCategoryName || selectedAsset.sub_category_name || ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      assetId: normalizedId,
      hostname: ""
    }));
  }, [allAssets, formData.assetId]);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenForm = useCallback((preselectedDate) => {
    setIsEditing(false);
    setEditingId(null);
    const nextFormData = { ...initialFormData };
    if (preselectedDate && isValid(preselectedDate)) {
      nextFormData.scheduledDate = format(preselectedDate, 'yyyy-MM-dd');
      nextFormData.scheduledEndDate = format(preselectedDate, 'yyyy-MM-dd');
    }
    nextFormData.scheduledTime = format(new Date(), 'HH:mm');
    nextFormData.scheduledEndTime = format(new Date(), 'HH:mm');
    setFormData(nextFormData);
    setShowModal(true);
  }, []);

  const handleEditForm = useCallback((log) => {
    setIsEditing(true);
    setEditingId(log.id || log.itItemId);
    
    // Better category mapping to avoid "client/utama"
    const displayCategory = log.category === 'client' || log.category === 'utama' 
      ? (log.assetGroup || log.main_type_name || log.category) 
      : log.category;

    setFormData({
      assetId: log.itItemId,
      hostname: log.hostname || '',
      assetMainTypeName: displayCategory || '',
      categoryName: displayCategory || '',
      subCategoryName: log.type || log.sub_category || '',
      scheduledDate: log.scheduledDate ? format(parseISO(log.scheduledDate), 'yyyy-MM-dd') : '',
      scheduledTime: extractTimeString(log, 'start'),
      scheduledEndDate: log.scheduledEndDate ? format(parseISO(log.scheduledEndDate), 'yyyy-MM-dd') : (log.scheduledDate ? format(parseISO(log.scheduledDate), 'yyyy-MM-dd') : ''),
      scheduledEndTime: extractTimeString(log, 'end'),
      pic: log.pic || '',
      detail: log.description || log.detail || log.notes || '',
      notes: log.notes || '',
      assetMainTypeId: '', 
      categoryId: '',
      subCategoryId: ''
    });
    
    setShowModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingId(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async (onCreateAPI, onUpdateAPI) => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      const submitData = {
        itItemId: formData.assetId,
        hostname: formData.hostname,
        category: formData.assetMainTypeName,
        type: formData.subCategoryName,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        scheduledEndDate: formData.scheduledEndDate || formData.scheduledDate,
        scheduledEndTime: formData.scheduledEndTime || formData.scheduledTime,
        pic: formData.pic,
        description: formData.detail,
        notes: formData.notes,
        status: isEditing ? undefined : 'pending'
      };
      
      if (isEditing && editingId) {
        await onUpdateAPI(editingId, submitData);
      } else {
        await onCreateAPI(submitData);
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Submit failed:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, isEditing, editingId, resetForm]);

  const hasConflicts = useCallback((assetId, date) => {
    const dayLogs = getLogsForDate(date);
    return dayLogs.some(log => log.itItemId === assetId && (isEditing ? (log.id || log.itItemId) !== editingId : true));
  }, [getLogsForDate, isEditing, editingId]);

  return {
    showModal,
    isSubmitting,
    isEditing,
    formData,
    filteredAssets,
    itemsLoading,
    mainTypeOptions,
    categoryOptions,
    subCategoryOptions,
    isFormValid,
    hasConflicts,
    setShowModal,
    handleMainTypeChange,
    handleCloseForm,
    handleCategoryChange,
    handleSubCategoryChange,
    handleAssetChange,
    handleFormChange,
    handleOpenForm,
    handleEditForm,
    resetForm,
    handleSubmit
  };
};
