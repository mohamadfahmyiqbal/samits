import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import Select from 'react-select';
import {
 FaDesktop, FaSave, FaTimes, FaPaperclip, FaServer,
 FaFilePdf, FaNetworkWired, FaUser, FaCalendarAlt, FaFileAlt, FaEye, FaTrash
} from 'react-icons/fa';
import { alertWarning, alertSuccess, alertError, showError } from '../../../../Notification';
import { useAssetForm } from '../hooks/useAssetForm';
import { SectionHeader, OptimizedSelect } from '../components/FormComponents';
import {
 customSelectStyles,
 formatRupiah,
 defaultStatusOptions,
 defaultAssetGroupOptions
} from '../constants/assetConstants';
import { deleteAssetDocument } from '../../../../../services/AssetService';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5002/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const resolveDocumentUrl = (fileUrl) => {
 if (!fileUrl) return "";
 // Check if the URL is already absolute or a data URL/blob URL
 if (/^(https?:)?\/\//i.test(fileUrl) || fileUrl.startsWith("blob:") || fileUrl.startsWith("data:")) {
  return fileUrl;
 }
 // Prepend API_ORIGIN if it's a relative path
 return `${API_ORIGIN}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
};

const formatDateForInput = (dateString) => {
 if (!dateString) return '';
 try {
  // Attempt to parse common date formats.
  // If dateString is already YYYY-MM-DD, it will be handled.
  // If it's YYYYMMDD, YYYYMM, or YYYY, attempt conversion.
  let formattedDate = '';
  if (typeof dateString === 'string') {
   if (dateString.length === 4) { // YYYY
    formattedDate = `${dateString}-01-01`;
   } else if (dateString.length === 6) { // YYYYMM
    formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-01`;
   } else if (dateString.length === 8) { // YYYYMMDD
    formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
   } else { // Assume YYYY-MM-DD or other parsable format
    formattedDate = dateString;
   }
  } else {
   // If it's not a string, try creating a Date object directly
   // This handles cases where it might already be a Date object or parsable by new Date()
   formattedDate = new Date(dateString).toISOString().split('T')[0];
  }

  // Final check to ensure it's a valid date string in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
   return formattedDate;
  } else {
   // Fallback if parsing fails or format is unexpected
   console.warn(`Could not reliably format date: ${dateString}. Returning empty string.`);
   return '';
  }
 } catch (e) {
  console.error(`Error formatting date "${dateString}":`, e);
  return ''; // Return empty string if an error occurs
 }
};

const AssetFormModal = ({ show, onHide, asset = null, onSave }) => {
 const isEdit = !!asset;
 const [saving, setSaving] = useState(false);

 const [previewDoc, setPreviewDoc] = useState(null);
 const [deletingDocId, setDeletingDocId] = useState(null);

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
  setErrors,
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

 const effectiveStatusOptions = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;
 const effectiveAssetGroupOptions = assetGroupOptions.length > 0 ? assetGroupOptions : defaultAssetGroupOptions;

 const handlePriceChange = useCallback((e) => {
  const { name, value } = e.target;
  const numberValue = value.replace(/[^0-9]/g, ''); // Keep only digits
  setNewAsset(prev => ({ ...prev, [name]: numberValue }));
 }, [setNewAsset]);

 const onInputChange = useCallback((e) => {
  const { name, value } = e.target;

  if (name === 'purchase_price_actual') {
   handlePriceChange(e);
  } else {
   handleChange(e);
  }
 }, [handleChange, handlePriceChange]);

const handleSave = useCallback(async () => {
  console.log('🔄 DEBUG FORM SAVE - Mode:', isEdit ? 'EDIT' : 'ADD', 'Payload keys:', Object.keys(newAsset));
  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
   console.log('❌ FORM ERRORS:', formErrors);
   const firstErrorField = Object.keys(formErrors)[0];
   const input = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
   input?.focus();
   return;
  }

  setSaving(true);
  try {
   const payload = isEdit ? { ...asset, ...newAsset, originalNoAsset: asset.noAsset } : newAsset;
   console.log('📤 SENDING PAYLOAD to onSave:', { noAsset: payload.noAsset, nama: payload.nama });
   await onSave(payload, attachments);
   console.log('✅ onSave completed');
   onHide();
  } catch (error) {
   console.error('Error saving asset:', error);
   // Use the showError utility for consistent error display
   showError(`Gagal menyimpan asset: ${error.message || 'Terjadi kesalahan tidak dikenal.'}`);
  } finally {
   setSaving(false);
  }
 }, [newAsset, attachments, onSave, onHide, validateForm, isEdit, asset, formRef]); // Added formRef to dependencies

 const handleDeleteDocument = async (doc) => {
  if (!doc?.document_id) return;
  const confirmDelete = window.confirm(`Hapus dokumen "${doc.original_name || doc.file_name}"?`);
  if (!confirmDelete) return;

  setDeletingDocId(doc.document_id);
  try {
   await deleteAssetDocument(newAsset.noAsset, doc.document_id);
   alertSuccess("Dokumen berhasil dihapus");
   setExistingDocuments(prev => prev.filter(d => d.document_id !== doc.document_id));
  } catch (error) {
   alertError(error.message || "Gagal menghapus dokumen");
  } finally {
   setDeletingDocId(null);
  }
 };

 const handlePreviewDocument = async (doc) => {
  if (!doc?.file_url) return;
  try {
   const resolvedFileUrl = resolveDocumentUrl(doc.file_url);
   // Check if the URL is already a blob URL from a previous preview or starts with http/https
   if (doc.blobUrl && doc.blobUrl.startsWith('blob:')) {
    setPreviewDoc({ ...doc, blobUrl: doc.blobUrl }); // Use existing blob URL
    return;
   }

   const response = await fetch(resolvedFileUrl, { credentials: 'include' });
   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
   const blob = await response.blob();
   const objectUrl = URL.createObjectURL(blob);
   setPreviewDoc({ ...doc, file_url: resolvedFileUrl, blobUrl: objectUrl });
  } catch (error) {
   console.error("Error previewing document:", error);
   alertError("Gagal memuat dokumen. Pastikan file tersedia atau coba lagi.");
  }
 };

 const closePreview = () => {
  if (previewDoc?.blobUrl && previewDoc.blobUrl.startsWith('blob:')) {
   URL.revokeObjectURL(previewDoc.blobUrl);
  }
  setPreviewDoc(null);
 };

 const handleKeyDown = useCallback((e) => {
  // Prevent default for Shift+Enter to allow multiline input if needed,
  // but still trigger save on Enter alone.
  if (e.key === 'Enter' && !e.shiftKey) {
   e.preventDefault();
   handleSave();
  }
 }, [handleSave]);

 return (
  <Modal show={show} onHide={onHide} centered backdrop="static" onKeyDown={handleKeyDown} className="asset-modal">
   <Modal.Header closeButton closeVariant="white" className="bg-primary text-white py-3">
    <Modal.Title className="d-flex align-items-center gap-2 mb-0">
     <FaDesktop className="text-white" />
     <span className="text-white">{isEdit ? 'Update Aset' : 'Tambah Aset Baru'}</span>
    </Modal.Title>
   </Modal.Header>

   <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }} className="p-4"> {/* Increased height slightly */}
    <Form ref={formRef}>
     <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaServer} title="Informasi Dasar" />
       <Row className="g-3">
        <Col md={6}>
         <Form.Group>
          <Form.Label>No. Asset <span className="text-danger">*</span></Form.Label>
          <Form.Control
           ref={firstInputRef}
           type="text"
           name="noAsset"
           value={newAsset.noAsset || ''} // Ensure value is string
           onChange={onInputChange}
           placeholder="Contoh: AST-001"
           isInvalid={!!errors.noAsset}
           readOnly={isEdit}
          />
          <Form.Control.Feedback type="invalid">{errors.noAsset}</Form.Control.Feedback>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Nama Aset <span className="text-danger">*</span></Form.Label>
          <Form.Control
           type="text"
           name="nama"
           value={newAsset.nama || ''} // Ensure value is string
           onChange={onInputChange}
           placeholder="Contoh: Laptop Dell XPS 15"
           isInvalid={!!errors.nama}
          />
          <Form.Control.Feedback type="invalid">{errors.nama}</Form.Control.Feedback>
         </Form.Group>
        </Col>
        <Col md={6}>
         <OptimizedSelect
          label="Main Type*"
          name="asset_main_type_id"
          options={mainTypeOptions}
          value={newAsset.asset_main_type_id}
          onChange={handleSelectChange}
          placeholder={!mainTypeOptions.length ? "Memuat Main Type..." : "Pilih Main Type"}
          required
          error={errors.asset_main_type_id}
         />
         <Form.Text className="small text-info">
           🔍 DEBUG Main Type: ID="{newAsset.asset_main_type_id}" | 
           Options={mainTypeOptions.length} | 
           Selected={getSelectValue(mainTypeOptions, newAsset.asset_main_type_id)?.label || 'NONE'}
         </Form.Text>
        </Col>
        <Col md={6}>
         <OptimizedSelect
          label="Kategori"
          name="category_id"
          options={categoryOptionsApi}
          value={getSelectValue(categoryOptionsApi, newAsset.category_id)}
          onChange={(opt) => handleSelectChange('category_id', opt?.value)}
          placeholder={!newAsset.asset_main_type_id ? "Pilih Main Type dulu" : "Pilih Kategori"}
          isDisabled={!newAsset.asset_main_type_id}
          required
          error={errors.category_id}
         />
        </Col>
        <Col md={6}>
         <OptimizedSelect
          label="Sub Kategori"
          name="sub_category_id"
          options={subCategoryOptionsApi}
          value={getSelectValue(subCategoryOptionsApi, newAsset.sub_category_id)}
          onChange={(opt) => handleSelectChange('sub_category_id', opt?.value)}
          placeholder={!newAsset.category_id ? "Pilih Kategori dulu" : "Pilih Sub Kategori"}
          isDisabled={!newAsset.category_id}
          required
          error={errors.sub_category_id}
         />
        </Col>
        {isPC && (
         <Col md={6}>
          <OptimizedSelect
           label="Classification"
           name="classification_id"
           options={classificationOptions}
           value={getSelectValue(classificationOptions, newAsset.classification_id)}
           onChange={(opt) => handleSelectChange('classification_id', opt?.value)}
           isLoading={loadingClassification}
           error={errors.classification_id}
          />
         </Col>
        )}
        <Col md={6}>
         <OptimizedSelect
          label="Asset Group"
          name="assetGroup"
          options={effectiveAssetGroupOptions}
          value={getSelectValue(effectiveAssetGroupOptions, newAsset.assetGroup)}
          onChange={(opt) => handleSelectChange('assetGroup', opt?.value)}
          placeholder={!newAsset.sub_category_id ? "Pilih Sub Kategori dulu" : "Pilih Asset Group"}
          isDisabled={!newAsset.sub_category_id}
         />
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Status</Form.Label>
          <Select
           options={effectiveStatusOptions}
           value={getSelectValue(effectiveStatusOptions, newAsset.status)}
           onChange={(opt) => handleSelectChange('status', opt?.value)}
           styles={customSelectStyles}
           isClearable // Allow clearing the selection
          />
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     {/* Network Options Section */}
     <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaNetworkWired} title="Network Options" />
       <Row className="g-3">
        <Col md={12}>
         <Form.Group>
          <Form.Label>Hostname</Form.Label>
          <Form.Control type="text" name="hostname" value={newAsset.hostname || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>IP Main</Form.Label>
          <Form.Control type="text" name="mainIpAdress" value={newAsset.mainIpAdress || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>IP Backup</Form.Label>
          <Form.Control type="text" name="backupIpAdress" value={newAsset.backupIpAdress || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaUser} title="Informasi Pemegang" />
       <Row className="g-3">
        <Col md={6}>
         <OptimizedSelect
          label="NIK Pemegang"
          name="nik"
          options={filteredKaryawanOptions}
          value={getSelectValue(filteredKaryawanOptions, newAsset.nik)}
          onChange={(opt) => {
           handleSelectChange('nik', opt?.value);
           // Automatically update dept if NIK is selected
           if (opt?.dept) {
            setNewAsset(prev => ({ ...prev, dept: opt.dept }));
           } else {
            setNewAsset(prev => ({ ...prev, dept: '' })); // Clear dept if NIK has no department
           }
          }}
          isLoading={loadingKaryawan}
          isSearchable
          isClearable // Allow clearing the selection
         />
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Departemen</Form.Label>
          <Form.Control
           type="text"
           name="dept"
           value={newAsset.dept || ''}
           readOnly
           className="bg-light"
          />
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaCalendarAlt} title="Spesifikasi Teknis & Pembelian" />
       <Row className="g-3">
        <Col md={6}>
         <Form.Group>
          <Form.Label>Tahun Beli</Form.Label>
          <Form.Control
           type="date"
           name="tahunBeli"
           value={formatDateForInput(newAsset.tahunBeli)} // Use helper for correct YYYY-MM-DD format
           onChange={onInputChange}
          />
          <Form.Text className="text-muted small">
           Format: YYYY, YYYY-MM, YYYY-MM-DD (auto-converted)
          </Form.Text>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Tahun Depresiasi <span className="text-muted small">(1-30 tahun)</span></Form.Label>
          <Form.Control
           type="number"
           name="tahunDepreciation"
           min="1"
           max="30"
           value={newAsset.tahunDepreciation || ''}
           onChange={onInputChange}
           placeholder="5"
          />
          <Form.Text className="text-muted">
           Masukkan jumlah tahun masa manfaat aset (1-30 tahun)
          </Form.Text>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>No. PO</Form.Label>
          <Form.Control type="text" name="po_number" value={newAsset.po_number || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>No. Invoice</Form.Label>
          <Form.Control type="text" name="invoice_number" value={newAsset.invoice_number || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Harga Beli Aktual</Form.Label>
          <Form.Control
           type="text"
           name="purchase_price_actual"
           value={newAsset.purchase_price_actual ? formatRupiah(newAsset.purchase_price_actual) : ''}
           onChange={onInputChange}
           placeholder="Rp 0"
          />
          <Form.Text className="text-muted small">
           Format: Rp 1.000.000
          </Form.Text>
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     {/* Informasi Keuangan & Lifecycle */}
     <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaCalendarAlt} title="Informasi Keuangan & Lifecycle" />
       <Row className="g-3">
        <Col md={6}>
         <Form.Group>
          <Form.Label>Tanggal Akhir Depresiasi</Form.Label>
          <Form.Control
           type="date"
           name="depreciation_end_date"
           value={formatDateForInput(newAsset.depreciation_end_date)} // Use helper for correct YYYY-MM-DD format
           onChange={onInputChange}
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>No. Akuntansi Aset</Form.Label>
          <Form.Control
           type="text"
           name="accounting_asset_no"
           value={newAsset.accounting_asset_no || ''}
           readOnly
           className="bg-light"
           title="Auto-same dengan No. Asset"
          />
          <Form.Text className="text-muted small">
            Auto-same dengan No. Asset
          </Form.Text>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group>
          <Form.Label>Status Akuisisi</Form.Label>
          <Form.Select name="acquisition_status" value={newAsset.acquisition_status || 'Planned'} onChange={onInputChange}>
           <option value="Planned">Planned</option>
           <option value="Acquired">Acquired</option>
           <option value="In Progress">In Progress</option>
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={12}>
         <Form.Group>
          <Form.Label>Request ID (Opsional)</Form.Label>
          <Form.Control type="text" name="request_id" value={newAsset.request_id || ''} onChange={onInputChange} />
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <Card className="mb-3 border-0 shadow-sm">
      <Card.Body>
       <SectionHeader icon={FaFileAlt} title="Dokumen & Lampiran" />
       <Form.Group>
        <Form.Label>Lampiran PDF</Form.Label>
        <Form.Control type="file" accept="application/pdf" multiple onChange={(e) => handleFileChange(e, alertWarning)} className="mb-3" />
        {existingDocuments.length > 0 && (
         <div className="mb-3">
          <p className="text-muted small mb-1">Dokumen Tersimpan:</p>
          {existingDocuments.map((doc, i) => (
           <div key={doc.document_id || i} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded">
            <span className="small text-truncate" title={doc.original_name || doc.file_name}>
             <FaFilePdf className="text-danger me-2" />{doc.original_name || doc.file_name}
            </span>
            <div>
             <Button variant="link" size="sm" className="text-info p-0 me-2" onClick={() => handlePreviewDocument(doc)}><FaEye /></Button>
             <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteDocument(doc)} disabled={deletingDocId === doc.document_id}>
              {deletingDocId === doc.document_id ? <Spinner size="sm" /> : <FaTrash />}
             </Button>
            </div>
           </div>
          ))}
         </div>
        )}
        {attachments.map((file, i) => (
         <div key={i} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded">
          <span className="text-success small text-truncate" title={file.name}><FaPaperclip className="me-2" />{file.name}</span>
          <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeAttachment(i)}><FaTimes /></Button>
         </div>
        ))}
       </Form.Group>
      </Card.Body>
     </Card>
    </Form>
   </Modal.Body>
   <Modal.Footer className="bg-light">
    <Button variant="secondary" onClick={onHide} disabled={saving}>Batal</Button>
    <Button variant="primary" onClick={handleSave} disabled={saving}>
     {saving ? <Spinner size="sm" /> : <FaSave className="me-1" />} {isEdit ? 'Update' : 'Simpan'}
    </Button>
   </Modal.Footer>
   <PdfPreviewModal show={!!previewDoc} onHide={closePreview} document={previewDoc} />
  </Modal>
 );
};

const PdfPreviewModal = ({ show, onHide, document, onDocumentChange }) => {
  const fileUrl = useMemo(() => {
    if (!document?.file_url) return null;
    if (document.blobUrl && document.blobUrl.startsWith('blob:')) {
      return document.blobUrl;
    }
    return resolveDocumentUrl(document.file_url);
  }, [document?.file_url, document?.blobUrl]);

  // Clean up blob URL on unmount or when document changes
  useEffect(() => {
    return () => {
      if (document?.blobUrl && document.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(document.blobUrl);
      }
    };
  }, [document?.blobUrl]);

  if (!show || !document) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>{document.original_name || document.file_name || "PDF Preview"}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '80vh', padding: 0 }}>
        {fileUrl ? (
          <iframe
            src={fileUrl}
            title={document.original_name || document.file_name || "PDF Preview"}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onError={(e) => console.error("Error loading iframe content:", e)}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <p>Tidak dapat memuat pratinjau dokumen.</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssetFormModal;

