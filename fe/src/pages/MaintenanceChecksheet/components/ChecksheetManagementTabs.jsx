import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Form } from 'react-bootstrap';
import ChecksheetTemplateTable from './ChecksheetTemplateTable';
import { useChecksheetManagement } from '../context/ChecksheetManagementContext';
import maintenanceChecklistService from '../../../services/MaintenanceChecklistService';

const ChecksheetManagementTabs = ({
  activeSubCategoryId,
  activeCategoryId,
  categories = [],
  subCategories = [],
  onSubCategoryChange = () => {},
}) => {
  const { state, dispatch } = useChecksheetManagement();
  const selectionReady = Boolean(state.activeMainTypeId && state.activeCategoryId && state.activeSubCategoryId);
  const openCreateModal = () =>
    dispatch({ type: 'SET_MODAL', modal: 'showCreateModal', payload: true });

  const subCategoryOptions = useMemo(
    () =>
      (subCategories || []).map((sub) => {
        const id = sub.sub_category_id || sub.id;
        return {
          id,
          label:
            sub.sub_category_name ||
            sub.sub_category ||
            sub.name ||
            sub.label ||
            `Sub ${id}`,
        };
      }),
    [subCategories],
  );

  const handleSelectChange = (value) => {
    const normalized = value ? Number(value) : null;
    onSubCategoryChange(normalized);
  };

  const selectedSubCategory = useMemo(
    () =>
      subCategories.find(
        (sub) =>
          (sub.sub_category_id && sub.sub_category_id === activeSubCategoryId) ||
          String(sub.id) === String(activeSubCategoryId),
      ) || null,
    [subCategories, activeSubCategoryId],
  );

  const selectedSubCategoryLabel =
    selectedSubCategory?.sub_category_name ||
    selectedSubCategory?.sub_category ||
    selectedSubCategory?.name ||
    selectedSubCategory?.label ||
    null;

  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const refreshKey = state.refreshKey;

  const loadChecklists = useCallback(async () => {
    if (!selectedSubCategoryLabel) {
      dispatch({ type: 'SET_CHECKLISTS', payload: [] });
      return;
    }
    setTableError('');
    setTableLoading(true);

    try {
      const response = await maintenanceChecklistService.list({
        sub_category: selectedSubCategoryLabel,
        limit: 200,
      });
      dispatch({ type: 'SET_CHECKLISTS', payload: response.data || [] });
      console.log('loadChecklists', {
        subCategory: selectedSubCategoryLabel,
        refreshKey,
        count: response.data?.length,
      });
      setStatusMessage(
        `Daftar checklist diperbarui ${new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      );
    } catch (err) {
      setTableError(err.message || 'Gagal memuat daftar checklist.');
      dispatch({ type: 'SET_CHECKLISTS', payload: [] });
    } finally {
      setTableLoading(false);
    }
  }, [dispatch, selectedSubCategoryLabel, refreshKey]);

  useEffect(() => {
    console.log('refreshKey (effect)', refreshKey);
  }, [refreshKey]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists, refreshKey]);

  const handleEditChecklist = useCallback(
    (checklist) => {
      if (!checklist) return;
      dispatch({ type: 'SELECT_CHECKSHEET', payload: checklist });
      dispatch({ type: 'SET_MODAL', modal: 'showEditModal', payload: true });
    },
    [dispatch],
  );

  const handleDeleteChecklist = useCallback(
    async (checklist) => {
      if (!checklist || !checklist.checklist_id) return;
      const confirmed = window.confirm('Yakin ingin menghapus checklist ini?');
      if (!confirmed) return;
      setTableLoading(true);
      try {
        await maintenanceChecklistService.delete(checklist.checklist_id);
        dispatch({ type: 'BUMP_REFRESH_KEY' });
      } catch (err) {
        setTableError(err.message || 'Gagal menghapus checklist.');
      } finally {
        setTableLoading(false);
      }
    },
    [dispatch],
  );

  return (
    <div className="asset-management-tabs-container">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Semua Checklist</h5>
            {!selectionReady && (
              <small className="text-muted">
                Pilih Main Type → Category → Sub Category untuk mulai membuat checksheet.
            </small>
            )}
          </div>
          <Button variant="primary" onClick={openCreateModal} disabled={!selectionReady}>
            Buat Checklist
          </Button>
        </div>
        <div className="mb-3">
          <Form.Label>Sub Kategori</Form.Label>
          <Form.Select
            value={activeSubCategoryId || ''}
            onChange={(evt) => handleSelectChange(evt.target.value)}
          >
            <option value="">Pilih Sub Kategori...</option>
            {subCategoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </div>
        {statusMessage && (
          <div className="mb-3 text-muted small">{statusMessage}</div>
        )}
        <ChecksheetTemplateTable
          checklists={state.checklists}
          loading={tableLoading}
          error={tableError}
          selectionReady={selectionReady}
          onEditChecklist={handleEditChecklist}
          onDeleteChecklist={handleDeleteChecklist}
        />
      </div>
    </div>
  );
};

export default ChecksheetManagementTabs;
