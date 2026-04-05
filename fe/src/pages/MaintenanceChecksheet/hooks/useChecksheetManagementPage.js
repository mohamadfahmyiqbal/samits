import { useEffect, useCallback } from 'react';
import { useChecksheetManagement } from '../context/ChecksheetManagementContext';
import { fetchMainTypes } from '../../../services/AssetService';
import {
  fetchCategoriesByMainType,
  fetchSubCategoriesByCategory,
} from '../../../services/CategoryService';

export const useChecksheetManagementPage = () => {
  const { state, dispatch } = useChecksheetManagement();

  const fetchSubCategoriesFor = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        dispatch({ type: 'SET_SUB_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_ACTIVE_SUB_CATEGORY', payload: null });
        return;
      }
      try {
        const response = await fetchSubCategoriesByCategory(categoryId);
        const payload = response.data || [];
        const firstCategory = payload[0] || {};
        const subCategories = firstCategory.sub_categories || [];
        dispatch({ type: 'SET_SUB_CATEGORIES', payload: subCategories });
        dispatch({
          type: 'SET_ACTIVE_SUB_CATEGORY',
          payload: subCategories[0]?.sub_category_id || null,
        });
      } catch (error) {
        console.error('fetchSubCategoriesFor error', error);
        dispatch({ type: 'SET_SUB_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_ACTIVE_SUB_CATEGORY', payload: null });
      }
    },
    [dispatch],
  );

  const fetchCategoriesFor = useCallback(
    async (mainTypeId) => {
      if (!mainTypeId) {
        dispatch({ type: 'SET_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: null });
        await fetchSubCategoriesFor(null);
        return;
      }
      try {
        const response = await fetchCategoriesByMainType(mainTypeId);
        const categories = response.data || [];
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        const activeCategoryId = categories[0]?.category_id || categories[0]?.id || null;
        dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: activeCategoryId });
        await fetchSubCategoriesFor(activeCategoryId);
      } catch (error) {
        console.error('fetchCategoriesFor error', error);
        dispatch({ type: 'SET_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: null });
        await fetchSubCategoriesFor(null);
      }
    },
    [dispatch, fetchSubCategoriesFor],
  );

  const fetchMainTypesData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetchMainTypes();
      const mainTypes = response.data || [];

      dispatch({ type: 'SET_MAIN_TYPES', payload: mainTypes });
      const activeMainTypeId = mainTypes[0]?.asset_main_type_id || null;
      dispatch({ type: 'SET_ACTIVE_MAIN_TYPE', payload: activeMainTypeId });

      await fetchCategoriesFor(activeMainTypeId);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, fetchCategoriesFor]);

  const refreshData = useCallback(() => {
    fetchMainTypesData();
  }, [fetchMainTypesData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleMainTypeChange = useCallback(
    (mainTypeId) => {
      dispatch({ type: 'SET_ACTIVE_MAIN_TYPE', payload: mainTypeId });
      fetchCategoriesFor(mainTypeId);
    },
    [dispatch, fetchCategoriesFor],
  );

  const handleCategoryChange = useCallback(
    (categoryId) => {
      dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: categoryId });
      fetchSubCategoriesFor(categoryId);
    },
    [dispatch, fetchSubCategoriesFor],
  );

  const handleSubCategoryChange = useCallback(
    (subCategoryId) => {
      dispatch({ type: 'SET_ACTIVE_SUB_CATEGORY', payload: subCategoryId });
    },
    [dispatch],
  );

  const createChecksheet = useCallback(
    async (payload) => {
      const enriched = {
        ...payload,
        asset_main_type_id: state.activeMainTypeId,
        category_id: state.activeCategoryId,
        sub_category_id: state.activeSubCategoryId,
      };
      console.log('Create checklist:', enriched);
      refreshData();
      return { success: true, data: enriched };
    },
    [refreshData, state.activeMainTypeId, state.activeCategoryId, state.activeSubCategoryId],
  );

  return {
    mainTypes: state.mainTypes,
    categories: state.categories,
    subCategories: state.subCategories,
    activeMainTypeId: state.activeMainTypeId,
    activeCategoryId: state.activeCategoryId,
    activeSubCategoryId: state.activeSubCategoryId,
    loading: state.loading,
    error: state.error,
    refreshData,
    handleMainTypeChange,
    handleCategoryChange,
    handleSubCategoryChange,
    createChecksheet,
  };
};

