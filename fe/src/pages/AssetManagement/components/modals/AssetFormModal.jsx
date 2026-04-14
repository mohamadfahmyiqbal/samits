import React, { useState, useCallback } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { FaDesktop, FaSave } from 'react-icons/fa';
import { showError } from '../../../../components/shared/notification/toast';
import { useAssetForm } from './AddAssetModal/hooks/useAssetForm';
import { defaultStatusOptions, defaultAssetGroupOptions } from './AddAssetModal/constants/assetConstants';
import PdfPreviewModal, { resolveDocumentUrl } from './AddAssetModal/page/PdfPreviewModal';
import BasicInfoSection from './AddAssetModal/page/BasicInfoSection';
import DocumentSection from './AddAssetModal/page/DocumentSection';
import FinanceSection from './AddAssetModal/page/FinanceSection';
import NetworkSection from './AddAssetModal/page/NetworkSection';
import OwnerSection from './AddAssetModal/page/OwnerSection';
import SpecSection from './AddAssetModal/page/SpecSection';
import { deleteAssetDocument } from '../../../../services/AssetService';

const AssetFormModal = ({ show, onHide, asset = null, onSave }) => {
  const isEdit = !!asset;
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { firstInputRef, formRef, newAsset, setNewAsset, filteredKaryawanOptions, loadingKaryawan, loadingClassification, attachments, existingDocuments, setExistingDocuments, errors, classificationOptions, statusOptions, assetGroupOptions, mainTypeOptions, categoryOptionsApi, subCategoryOptionsApi, isPC, getSelectValue, handleChange, handleSelectChange, handleFileChange, removeAttachment, validateForm } = useAssetForm(show, asset);
  const handlePriceChange = useCallback((e) => { const { name, value } = e.target; const numberValue = value.replace(/[^0-9]/g, ''); setNewAsset((prev) => ({ ...prev, [name]: numberValue })); }, [setNewAsset]);
  const onInputChange = useCallback((e) => { const { name } = e.target; if (name === 'purchase_price_actual') handlePriceChange(e); else handleChange(e); }, [handleChange, handlePriceChange]);
  const handleSave = useCallback(async () => { const formErrors = validateForm(); if (Object.keys(formErrors).length > 0) return; setSaving(true); try { const payload = isEdit ? { ...asset, ...newAsset, originalNoAsset: asset.noAsset } : newAsset; await onSave(payload, attachments); onHide(); } catch (error) { showError(`Gagal menyimpan asset: ${error.message || 'Terjadi kesalahan tidak dikenal.'}`); } finally { setSaving(false); } }, [newAsset, attachments, onSave, onHide, validateForm, isEdit, asset]);
  return <Modal show={show} onHide={onHide} centered backdrop='static' className='asset-modal'><Modal.Header closeButton closeVariant='white' className='bg-primary text-white py-3'><Modal.Title className='d-flex align-items-center gap-2 mb-0'><FaDesktop className='text-white' /><span className='text-white'>{isEdit ? 'Update Aset' : 'Tambah Aset Baru'}</span></Modal.Title></Modal.Header><Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }} className='p-4'><Form ref={formRef}><BasicInfoSection newAsset={newAsset} errors={errors} mainTypeOptions={mainTypeOptions} categoryOptionsApi={categoryOptionsApi} subCategoryOptionsApi={subCategoryOptionsApi} classificationOptions={classificationOptions} statusOptions={statusOptions} assetGroupOptions={assetGroupOptions} defaultStatusOptions={defaultStatusOptions} defaultAssetGroupOptions={defaultAssetGroupOptions} isPC={isPC} loadingClassification={loadingClassification} getSelectValue={getSelectValue} handleSelectChange={handleSelectChange} onInputChange={onInputChange} isEdit={isEdit} firstInputRef={firstInputRef} /><NetworkSection newAsset={newAsset} onInputChange={onInputChange} /><OwnerSection newAsset={newAsset} filteredKaryawanOptions={filteredKaryawanOptions} getSelectValue={getSelectValue} handleSelectChange={handleSelectChange} setNewAsset={setNewAsset} loadingKaryawan={loadingKaryawan} /><SpecSection newAsset={newAsset} onInputChange={onInputChange} isPC={isPC} /><FinanceSection newAsset={newAsset} onInputChange={onInputChange} /><DocumentSection attachments={attachments} existingDocuments={existingDocuments} setExistingDocuments={setExistingDocuments} handleFileChange={handleFileChange} removeAttachment={removeAttachment} handlePreviewDocument={(doc) => { if (!doc?.file_url) return; const resolvedFileUrl = resolveDocumentUrl(doc.file_url); setPreviewDoc({ ...doc, file_url: resolvedFileUrl }); }} handleDeleteDocument={async (doc) => { if (!doc?.document_id) return; await deleteAssetDocument(newAsset.noAsset, doc.document_id); setExistingDocuments((prev) => prev.filter((d) => d.document_id !== doc.document_id)); }} deletingDocId={deletingDocId} newAsset={newAsset} /></Form></Modal.Body><Modal.Footer className='bg-light'><Button variant='secondary' onClick={onHide} disabled={saving}>Batal</Button><Button variant='primary' onClick={handleSave} disabled={saving}>{saving ? <Spinner size='sm' /> : <FaSave className='me-1' />} {isEdit ? 'Update' : 'Simpan'}</Button></Modal.Footer>{previewDoc && <PdfPreviewModal show={true} onHide={() => setPreviewDoc(null)} document={previewDoc} />}</Modal>;
};
export default AssetFormModal;
