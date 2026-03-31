import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CHECKLIST_CATALOG } from '../config/checklistConfig.js';

const STORAGE_KEY = 'workorder_checklist_templates';

const readStoredTemplates = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((row) => ({
        ...row,
        items: Array.isArray(row.items) ? row.items : [],
      }));
    }
  } catch (err) {
    console.error('Failed to parse stored checklist templates', err);
  }
  return [];
};

const STORAGE_EVENT = 'checklistTemplates:updated';

const writeStoredTemplates = (value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch (err) {
    console.error('Failed to persist checklist templates', err);
  }
};

export default function useChecklistTemplates() {
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
    setCustomTemplates(readStoredTemplates());
    if (typeof window === 'undefined') return;
    const handler = () => {
      setCustomTemplates(readStoredTemplates());
    };
    window.addEventListener(STORAGE_EVENT, handler);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handler);
    };
  }, []);

  const allTemplates = useMemo(() => {
    return [...customTemplates, ...DEFAULT_CHECKLIST_CATALOG];
  }, [customTemplates]);

  const findChecklist = useCallback(
    (categoryName, subCategoryName, options = {}) => {
      const hasCategory = Boolean(categoryName);
      const hasSubCategory = Boolean(subCategoryName);
      const hasHooks =
        options &&
        (options.categoryId ||
          options.subCategoryId ||
          options.category_id ||
          options.sub_category_id ||
          options.mainTypeId ||
          options.assetGroupName);
      if (!hasCategory && !hasSubCategory && !hasHooks) return null;
      const normalized = (value) => String(value || '').trim().toLowerCase();
      const cat = normalized(categoryName);
      const sub = normalized(subCategoryName);
      const categoryId = options.categoryId ?? options.category_id ?? null;
      const subCategoryId = options.subCategoryId ?? options.sub_category_id ?? null;
      const mainTypeId = options.mainTypeId ?? options.main_type_id ?? null;
      const assetGroupName = options.assetGroupName ?? options.asset_group_name ?? null;

      const matchesIdList = (ids, value) => {
        if (!Array.isArray(ids) || value === undefined || value === null) return false;
        const normalizedValue = String(value);
        return ids.some((id) => String(id) === normalizedValue);
      };

      const matchesByIds = (entry) => {
        const requiresCategoryId = Array.isArray(entry.categoryIds) && entry.categoryIds.length > 0;
        const requiresSubCategoryId =
          Array.isArray(entry.subCategoryIds) && entry.subCategoryIds.length > 0;
        const requiresMainTypeId = Array.isArray(entry.mainTypeIds) && entry.mainTypeIds.length > 0;
        const requiresAssetGroup =
          Array.isArray(entry.assetGroupNames) && entry.assetGroupNames.length > 0;

        const matchedCategoryId =
          !requiresCategoryId || matchesIdList(entry.categoryIds, categoryId);
        const matchedSubCategoryId =
          !requiresSubCategoryId || matchesIdList(entry.subCategoryIds, subCategoryId);
        const matchedMainTypeId =
          !requiresMainTypeId || matchesIdList(entry.mainTypeIds, mainTypeId);
        const matchedAssetGroup =
          !requiresAssetGroup ||
          (assetGroupName && entry.assetGroupNames.some((name) => normalized(name) === normalized(assetGroupName)));

        return (
          matchedCategoryId &&
          matchedSubCategoryId &&
          matchedMainTypeId &&
          matchedAssetGroup &&
          (requiresCategoryId || requiresSubCategoryId || requiresMainTypeId || requiresAssetGroup)
        );
      };
      for (const entry of allTemplates) {
        if (matchesByIds(entry)) {
          return entry.items;
        }
        if (entry.matches && entry.matches(categoryName, subCategoryName, options)) {
          return entry.items;
        }
        if (
          normalized(entry.category) === cat &&
          normalized(entry.subCategory) === sub
        ) {
          return entry.items;
        }
      }
      return null;
    },
    [allTemplates],
  );

  const upsertTemplate = useCallback(
    (template) => {
      if (!template) return;
      const normalizedId =
        template.id ||
        `${String(template.category || '').trim()}-${String(template.subCategory || '').trim()}`.toLowerCase();
      const next = customTemplates.filter((t) => t.id !== normalizedId);
      const newEntry = {
        ...template,
        id: normalizedId,
        items: Array.isArray(template.items) ? template.items : [],
      };
      const updated = [...next, newEntry];
      setCustomTemplates(updated);
      writeStoredTemplates(updated);
    },
    [customTemplates],
  );

  const deleteTemplate = useCallback(
    (templateId) => {
      const updated = customTemplates.filter((t) => t.id !== templateId);
      setCustomTemplates(updated);
      writeStoredTemplates(updated);
    },
    [customTemplates],
  );

  return {
    templates: allTemplates,
    findChecklist,
    upsertTemplate,
    deleteTemplate,
    customTemplates,
  };
}
