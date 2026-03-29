import React, { useState, useCallback } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { FaDesktop, FaSave } from 'react-icons/fa';
import { alertSuccess, alertError, showError } from '../../../../Notification';
import { useAssetForm } from '../hooks/useAssetForm';
import { defaultStatusOptions, defaultAssetGroupOptions } from '../constants/assetConstants';
import PdfPreviewModal, { resolveDocumentUrl } from './PdfPreviewModal';
import BasicInfoSection from './BasicInfoSection';
import DocumentSection from './DocumentSection';
import FinanceSection from './FinanceSection';
import NetworkSection from './NetworkSection';
import OwnerSection from './OwnerSection';
import SpecSection from './SpecSection';
// resolveDocumentUrl sudah ada di PdfPreviewModal
import { deleteAssetDocument } from '../../../../../services/AssetService';

const AssetFormModal = ({ show, onHide, asset = null, onSave }) => {
  const isEdit = !!asset;

  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    firstInputRef,
    formRef,
    newAsset,
    setNewAsset,
    filteredKaryawanOptions,
    loadingKaryawan,
    loadingClassification,
    attachments,
    existingDocuments,
    setExistingDocuments,
    errors,
    classificationOptions,
    statusOptions,
    assetGroupOptions,
    mainTypeOptions,
    categoryOptionsApi,
    subCategoryOptionsApi,
    isPC,
    getSelectValue,
    handleChange,
    handleSelectChange,
    handleFileChange,
    removeAttachment,
    validateForm,
  } = useAssetForm(show, asset);

  const handlePriceChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const numberValue = value.replace(/[^0-9]/g, ''); // Keep only digits
      setNewAsset((prev) => ({ ...prev, [name]: numberValue }));
    },
    [setNewAsset]
  );

  const onInputChange = useCallback(
    (e) => {
      const { name } = e.target;

      if (name === 'purchase_price_actual') {
        handlePriceChange(e);
      } else {
        handleChange(e);
      }
    },
    [handleChange, handlePriceChange]
  );

  const handleSave = useCallback(async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      const firstErrorField = Object.keys(formErrors)[0];
      const input = formRef.current?.querySelector(`[controlId="${firstErrorField}"]`);
      input?.focus();
      return;
    }

    setSaving(true);
    try {
      const payload = isEdit ? { ...asset, ...newAsset, originalNoAsset: asset.noAsset } : newAsset;
      await onSave(payload, attachments);
      onHide();
    } catch (error) {
      // Use the showError utility for consistent error display
      showError(`Gagal menyimpan asset: ${error.message || 'Terjadi kesalahan tidak dikenal.'}`);
    } finally {
      setSaving(false);
    }
  }, [newAsset, attachments, onSave, onHide, validateForm, isEdit, asset, formRef]);

  const handleDeleteDocument = async (doc) => {
    if (!doc?.document_id) return;
    const confirmDelete = window.confirm(`Hapus dokumen "${doc.original_name || doc.file_name}"?`);
    if (!confirmDelete) return;

    setDeletingDocId(doc.document_id);
    try {
      await deleteAssetDocument(newAsset.noAsset, doc.document_id);
      alertSuccess('Dokumen berhasil dihapus');
      setExistingDocuments((prev) => prev.filter((d) => d.document_id !== doc.document_id));
    } catch (error) {
      alertError(error.message || 'Gagal menghapus dokumen');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handlePreviewDocument = async (doc) => {
    if (!doc?.file_url) return;
    try {
      const resolvedFileUrl = resolveDocumentUrl(doc.file_url);
      if (doc.blobUrl && doc.blobUrl.startsWith('blob:')) {
        setPreviewDoc({ ...doc, blobUrl: doc.blobUrl });
        return;
      }

      const response = await fetch(resolvedFileUrl, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewDoc({ ...doc, file_url: resolvedFileUrl, blobUrl: objectUrl });
    } catch (error) {
      alertError('Gagal memuat dokumen. Pastikan file tersedia atau coba lagi.');
    }
  };

  const closePreview = () => {
    if (previewDoc?.blobUrl && previewDoc.blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewDoc.blobUrl);
    }
    setPreviewDoc(null);
  };

  const handleKeyDown = useCallback(
    (e) => {
      // Prevent default for Shift+Enter to allow multiline input if needed,
      // but still trigger save on Enter alone.
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop='static'
      onKeyDown={handleKeyDown}
      className='asset-modal'
    >
      <Modal.Header closeButton closeVariant='white' className='bg-primary text-white py-3'>
        <Modal.Title className='d-flex align-items-center gap-2 mb-0'>
          <FaDesktop className='text-white' />
          <span className='text-white'>{isEdit ? 'Update Aset' : 'Tambah Aset Baru'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }} className='p-4'>
        {' '}
        {/* Increased height slightly */}
        <Form ref={formRef}>
          <BasicInfoSection
            newAsset={newAsset}
            errors={errors}
            mainTypeOptions={mainTypeOptions}
            categoryOptionsApi={categoryOptionsApi}
            subCategoryOptionsApi={subCategoryOptionsApi}
            classificationOptions={classificationOptions}
            statusOptions={statusOptions}
            assetGroupOptions={assetGroupOptions}
            defaultStatusOptions={defaultStatusOptions}
            defaultAssetGroupOptions={defaultAssetGroupOptions}
            isPC={isPC}
            loadingClassification={loadingClassification}
            getSelectValue={getSelectValue}
            handleSelectChange={handleSelectChange}
            onInputChange={onInputChange}
            isEdit={isEdit}
            firstInputRef={firstInputRef}
          />
          <NetworkSection newAsset={newAsset} onInputChange={onInputChange} />
          <OwnerSection
            newAsset={newAsset}
            filteredKaryawanOptions={filteredKaryawanOptions}
            getSelectValue={getSelectValue}
            handleSelectChange={handleSelectChange}
            setNewAsset={setNewAsset}
            loadingKaryawan={loadingKaryawan}
          />
          <SpecSection newAsset={newAsset} onInputChange={onInputChange} isPC={isPC} />
          <FinanceSection newAsset={newAsset} onInputChange={onInputChange} />
          <DocumentSection
            attachments={attachments}
            existingDocuments={existingDocuments}
            setExistingDocuments={setExistingDocuments}
            handleFileChange={handleFileChange}
            removeAttachment={removeAttachment}
            handlePreviewDocument={handlePreviewDocument}
            handleDeleteDocument={handleDeleteDocument}
            deletingDocId={deletingDocId}
            newAsset={newAsset}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer className='bg-light'>
        <Button variant='secondary' onClick={onHide} disabled={saving}>
          Batal
        </Button>
        <Button variant='primary' onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size='sm' /> : <FaSave className='me-1' />}{' '}
          {isEdit ? 'Update' : 'Simpan'}
        </Button>
      </Modal.Footer>
      {previewDoc && <PdfPreviewModal show={true} onHide={closePreview} document={previewDoc} />}
    </Modal>
  );
};

export default AssetFormModal;
