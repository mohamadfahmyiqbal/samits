// fe/src/pages/MaintenanceSchedule/hooks/useCategoryData.js
import { useState, useCallback } from 'react';
import {
 fetchMainTypes,
 fetchCategoriesByMainType,
 fetchSubCategoriesByCategory,
 fetchITItemsByCategory,
} from '../../../../services/CategoryService';

export default function useCategoryData() {
 const [mainTypes, setMainTypes] =
  useState([]);
 const [categories, setCategories] =
  useState([]);
 const [subCategories,
  setSubCategories] =
  useState([]);
 const [itItems, setItItems] =
  useState([]);
 const [selectedMainType,
  setSelectedMainType] =
  useState(null);
 const [selectedCategory,
  setSelectedCategory] =
  useState(null);
 const [selectedSubCategory,
  setSelectedSubCategory] =
  useState(null);
 const [categoriesLoading,
  setCategoriesLoading] =
  useState(false);
 const [itItemsLoading,
  setItItemsLoading] =
  useState(false);

 const fetchCategories =
  useCallback(async () => {
   const response =
    await fetchMainTypes();

   setMainTypes(
    response?.data || []
   );
  }, []);

 const fetchCategoriesByMainTypeLocal =
  useCallback(async (
   mainTypeId
  ) => {
   if (!mainTypeId) {
    setCategories([]);
    return;
   }

   setCategoriesLoading(true);

   try {
    const response =
     await fetchCategoriesByMainType(
      mainTypeId
     );

    setCategories(
     response?.data || []
    );
   } finally {
    setCategoriesLoading(
     false
    );
   }
  }, []);

 const fetchSubCategoriesByCategoryLocal =
  useCallback(async (
   categoryId
  ) => {
   if (!categoryId) {
    setSubCategories([]);
    return;
   }

   const response =
    await fetchSubCategoriesByCategory(
     categoryId
    );

   const categoryData =
    response?.data?.[0];

   setSubCategories(
    categoryData
     ?.sub_categories || []
   );
  }, []);

 const fetchITItems =
  useCallback(async (
   categoryId,
   subCategoryId,
   mainTypeId = null
  ) => {
   if (
    !categoryId ||
    !subCategoryId
   ) {
    setItItems([]);
    return;
   }

   setItItemsLoading(true);

   try {
    const response =
     await fetchITItemsByCategory(
      categoryId,
      subCategoryId,
      mainTypeId
     );

    setItItems(
     response?.data || []
    );
   } finally {
    setItItemsLoading(
     false
    );
   }
  }, []);

 const handleMainTypeChange =
  useCallback(
   (value) => {
    setSelectedMainType(
     value
    );
    setSelectedCategory(
     null
    );
    setSelectedSubCategory(
     null
    );
    setCategories([]);
    setSubCategories([]);
    setItItems([]);

    fetchCategoriesByMainTypeLocal(
     value
    );
   },
   [
    fetchCategoriesByMainTypeLocal,
   ]
  );

 const handleCategoryChange =
  useCallback(
   (value) => {
    setSelectedCategory(
     value
    );
    setSelectedSubCategory(
     null
    );
    setSubCategories([]);
    setItItems([]);

    fetchSubCategoriesByCategoryLocal(
     value
    );
   },
   [
    fetchSubCategoriesByCategoryLocal,
   ]
  );

 const handleSubCategoryChange =
  useCallback(
   (value) => {
    setSelectedSubCategory(
     value
    );


    fetchITItems(
     selectedCategory,
     value,
     selectedMainType
    );
   },
   [
    fetchITItems,
    selectedCategory,
    selectedMainType,
   ]
  );

 return {
  mainTypes,
  categories,
  subCategories,
  itItems,
  selectedMainType,
  selectedCategory,
  selectedSubCategory,
  categoriesLoading,
  itItemsLoading,
  fetchCategories,
  fetchCategoriesByMainTypeLocal,
  fetchSubCategoriesByCategoryLocal,
  fetchITItems,
  handleMainTypeChange,
  handleCategoryChange,
  handleSubCategoryChange,
  setSelectedMainType,
  setSelectedCategory,
  setItItems,
 };
}