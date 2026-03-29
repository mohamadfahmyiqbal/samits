import React, { memo } from 'react';
import { useAssetManagement } from '../context/AssetManagementContext';
import AssetFormModal from '../../../comp/asset/modal/AddAssetModal/page/AssetFormModal';
import ModalDetail from '../../../comp/ModalDetail';

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

  return (
    <>
      <AssetFormModal show={modalAdd} onHide={() => setModalAdd(false)} onSave={saveAdd} />
      <ModalDetail
        show={modalDetail}
        onHide={() => setModalDetail(false)}
        asset={selectedAsset}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />
      <AssetFormModal
        show={modalUpdate}
        onHide={() => setModalUpdate(false)}
        asset={selectedAsset}
        onSave={saveUpdate}
      />
    </>
  );
};

export default memo(AssetManagementModals);
