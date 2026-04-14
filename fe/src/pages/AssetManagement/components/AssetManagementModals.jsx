import React, { memo, useCallback } from 'react';
import { useAssetManagement } from '../context/AssetManagementContext';
import AssetFormModal from './modals/AssetFormModal';
import ModalDetail from '../ModalDetail';

const AssetManagementModals = () => {
  const {
    modalAdd,
    setModalAdd,
    modalDetail,
    setModalDetail,
    modalUpdate,
    setModalUpdate,
    selectedAsset,
    saveAdd,
    saveUpdate,
    handleUpdate,
    handleDelete,
  } = useAssetManagement();

  const closeAddModal = useCallback(() => {
    setModalAdd(false);
  }, [setModalAdd]);

  const closeDetailModal = useCallback(() => {
    setModalDetail(false);
  }, [setModalDetail]);

  const closeUpdateModal = useCallback(() => {
    setModalUpdate(false);
  }, [setModalUpdate]);

  return (
    <>
      <AssetFormModal
        show={modalAdd}
        onHide={closeAddModal}
        onSave={saveAdd}
      />

      <ModalDetail
        show={modalDetail}
        onHide={closeDetailModal}
        asset={selectedAsset}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />

      <AssetFormModal
        show={modalUpdate}
        onHide={closeUpdateModal}
        asset={selectedAsset}
        onSave={saveUpdate}
      />
    </>
  );
};

export default memo(AssetManagementModals);
