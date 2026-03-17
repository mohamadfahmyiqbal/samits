import React, { useState, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import Select from 'react-select';
import { FaDesktop, FaSave, FaTimes, FaPaperclip, FaServer, FaUser, FaCalendarAlt, FaFileAlt, FaLayerGroup } from 'react-icons/fa';
import { alertWarning, showError } from '../../../../Notification';
import { useAssetForm } from '../hooks/useAssetForm';
import { SectionHeader, OptimizedSelect } from '../components/FormComponents';
import { 
  customSelectStyles, 
  formatRupiah,
  initialAssetState,
  defaultStatusOptions,
  defaultAssetGroupOptions
} from '../constants/assetConstants';

const AddAssetModal = ({ show, onHide, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState('');

  const {
    firstInputRef,
    formRef,
    newAsset,
    setNewAsset,
    filteredKaryawanOptions,
    loadingKaryawan,
    loadingClassification,
    attachments,
    errors,
    classificationOptions,
    statusOptions,
    assetGroupOptions,
    mainTypeOptions,
    categoryOptionsApi,
    subCategoryOptionsApi,
    isPC,
    handleChange,
    handleSelectChange,
    handleFileChange,
    removeAttachment,
    validateForm,
  } = useAssetForm(show);

  // Fallback to default options if API returns empty
  const effectiveStatusOptions = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;
  const effectiveAssetGroupOptions = assetGroupOptions.length > 0 ? assetGroupOptions : defaultAssetGroupOptions;

  // Handle price display
  const handlePriceChange = useCallback((e) => {
    const { name, value } = e.target;
    const numberValue = value.replace(/[^0-9]/g, '');
    setPriceDisplay(formatRupiah(numberValue));
    setNewAsset(prev => ({ ...prev, [name]: numberValue }));
    
    if (errors[name]) {
      setNewAsset(prev => prev);
    }
  }, [setNewAsset, errors]);

  // Combined handleChange for all inputs
  const onInputChange = (e) => {
    const { name } = e.target;
    if (name === 'purchase_price_actual') {
      handlePriceChange(e);
    } else {
      handleChange(e);
    }
  };

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const input = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
        input?.focus();
      }
      return;
    }

    setSaving(true);
    try {
      await onSave(newAsset, attachments);
      onHide();
    } catch (error) {
      console.error('Error saving asset:', error);
      showError(`Gagal menyimpan asset: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [newAsset, attachments, onSave, onHide, validateForm, errors]);

  // Handle Enter key to submit
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  // Reset price display when modal closes
  React.useEffect(() => {
    if (!show) {
      setPriceDisplay('');
    }
  }, [show]);

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered 
      backdrop="static"
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton closeVariant="white" className="bg-primary text-white py-3">
        <Modal.Title className="d-flex align-items-center gap-2 mb-0">
          <FaDesktop className="text-white" />
          <span className="text-white">Tambah Aset Baru</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }} className="p-4">
        <Form ref={formRef}>
          {/* Section 1: Informasi Dasar */}
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
                      value={newAsset.noAsset}
                      onChange={onInputChange}
                      placeholder="Contoh: AST-001"
                      isInvalid={!!errors.noAsset}
                      aria-label="Nomor Asset"
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
                      value={newAsset.nama}
                      onChange={onInputChange}
                      placeholder="Contoh: Laptop Dell XPS 15"
                      isInvalid={!!errors.nama}
                      aria-label="Nama Aset"
                    />
                    <Form.Control.Feedback type="invalid">{errors.nama}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                {/* Main Type - Hierarchy Level 1 */}
                <Col md={6}>
                  <OptimizedSelect
                    label="Main Type"
                    name="asset_main_type_id"
                    options={mainTypeOptions}
                    value={newAsset.asset_main_type_id}
                    onChange={handleSelectChange}
                    placeholder={mainTypeOptions.length === 0 ? "Loading..." : "Pilih Main Type"}
                    isLoading={mainTypeOptions.length === 0}
                    required
                    error={errors.asset_main_type_id}
                  />
                </Col>
                
                {/* Category - Hierarchy Level 2 */}
                <Col md={6}>
                  <OptimizedSelect
                    label="Kategori"
                    name="category_id"
                    options={categoryOptionsApi}
                    value={newAsset.category_id || newAsset.category}
                    onChange={handleSelectChange}
                    placeholder={!newAsset.asset_main_type_id ? "Pilih Main Type dulu" : (categoryOptionsApi.length === 0 ? "Loading..." : "Pilih Kategori")}
                    isDisabled={!newAsset.asset_main_type_id || categoryOptionsApi.length === 0}
                    required
                    error={errors.category || errors.category_id}
                  />
                </Col>
                
                {/* Sub Category - Hierarchy Level 3 */}
                <Col md={6}>
                  <OptimizedSelect
                    label="Sub Kategori"
                    name="sub_category_id"
                    options={subCategoryOptionsApi}
                    value={newAsset.sub_category_id || newAsset.sub_category}
                    onChange={handleSelectChange}
                    placeholder={!newAsset.category_id ? "Pilih Kategori dulu" : (subCategoryOptionsApi.length === 0 ? "Loading..." : "Pilih Sub Kategori")}
                    isDisabled={!newAsset.category_id || subCategoryOptionsApi.length === 0}
                    required
                    error={errors.sub_category || errors.sub_category_id}
                  />
                </Col>
                
                {/* Classification - Hanya untuk PC */}
                {isPC && (
                  <Col md={6}>
                    <OptimizedSelect
                      label="Classification"
                      name="classification_id"
                      options={classificationOptions}
                      value={newAsset.classification_id}
                      onChange={handleSelectChange}
                      placeholder={loadingClassification ? "Loading..." : "Pilih Classification"}
                      isLoading={loadingClassification}
                      error={errors.classification_id}
                    />
                  </Col>
                )}
                
                {/* Asset Group - Hierarchy Level 4 - Sekarang Optional */}
                <Col md={6}>
                  <OptimizedSelect
                    label="Asset Group"
                    name="assetGroup"
                    options={effectiveAssetGroupOptions}
                    value={newAsset.assetGroup}
                    onChange={handleSelectChange}
                    placeholder={!newAsset.sub_category_id ? "Pilih Sub Kategori dulu" : (effectiveAssetGroupOptions.length === 0 ? "Loading..." : "Pilih Asset Group")}
                    isDisabled={!newAsset.sub_category_id}
                    error={errors.assetGroup}
                  />
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Select
                      options={effectiveStatusOptions}
                      value={effectiveStatusOptions.find(o => o.value === newAsset.status)}
                      onChange={(opt) => handleSelectChange('status', opt)}
                      placeholder="Pilih Status"
                      styles={customSelectStyles}
                      aria-label="Status Aset"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 2: Informasi Pemegang */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <SectionHeader icon={FaUser} title="Informasi Pemegang" />
              <Row className="g-3">
                <Col md={6}>
                  <OptimizedSelect
                    label="NIK Pemegang"
                    name="nik"
                    options={filteredKaryawanOptions}
                    value={newAsset.nik}
                    onChange={handleSelectChange}
                    placeholder={loadingKaryawan ? "Loading..." : "Cari Karyawan (NIK/Nama)"}
                    isLoading={loadingKaryawan}
                    isSearchable
                  />
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Departemen</Form.Label>
                    <Form.Control
                      type="text"
                      name="dept"
                      value={newAsset.dept}
                      placeholder="Otomatis terisi"
                      readOnly
                      aria-label="Departemen"
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 3: Spesifikasi & Pembelian */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
<SectionHeader icon={FaCalendarAlt} title="Spesifikasi Teknis & Pembelian" />
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hostname</Form.Label>
                    <Form.Control
                      type="text"
                      name="hostname"
                      value={newAsset.hostname}
                      onChange={onInputChange}
                      placeholder="Contoh: DELL-XPS-001"
                      aria-label="Hostname"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tahun Pembelian</Form.Label>
                    <Form.Control
                      type="number"
                      name="tahunBeli"
                      value={newAsset.tahunBeli}
                      onChange={onInputChange}
                      placeholder="Contoh: 2024"
                      min="1900"
                      max="2100"
                      aria-label="Tahun Pembelian"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>No. PO</Form.Label>
                    <Form.Control
                      type="text"
                      name="po_number"
                      value={newAsset.po_number}
                      onChange={onInputChange}
                      placeholder="Contoh: PO-2024-001"
                      aria-label="Nomor PO"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>No. Invoice</Form.Label>
                    <Form.Control
                      type="text"
                      name="invoice_number"
                      value={newAsset.invoice_number}
                      onChange={onInputChange}
                      placeholder="Contoh: INV-2024-001"
                      aria-label="Nomor Invoice"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Harga Pembelian</Form.Label>
                    <Form.Control
                      type="text"
                      name="purchase_price_actual"
                      value={priceDisplay}
                      onChange={onInputChange}
                      placeholder="Rp 0"
                      aria-label="Harga Pembelian"
                    />
                  </Form.Group>
                </Col>
                {/* NEW FIELDS for AssetTable */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="type"
                      value={newAsset.type || ''}
                      onChange={onInputChange}
                      placeholder="Contoh: Laptop/Server"
                      aria-label="Type"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tahun Depreciation</Form.Label>
                    <Form.Control
                      type="number"
                      name="tahunDepreciation"
                      value={newAsset.tahunDepreciation || ''}
                      onChange={onInputChange}
                      placeholder="Contoh: 2028"
                      min="1900"
                      max="2100"
                      aria-label="Tahun Depreciation"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>IP Address Main</Form.Label>
                    <Form.Control
                      type="text"
                      name="mainIpAdress"
                      value={newAsset.mainIpAdress || ''}
                      onChange={onInputChange}
                      placeholder="192.168.1.100"
                      aria-label="Main IP Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>IP Address Backup</Form.Label>
                    <Form.Control
                      type="text"
                      name="backupIpAdress"
                      value={newAsset.backupIpAdress || ''}
                      onChange={onInputChange}
                      placeholder="192.168.1.101"
                      aria-label="Backup IP Address"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 4: Dokumen */}
          <Card className="mb-3 border-0 shadow-sm">
            <Card.Body>
              <SectionHeader icon={FaFileAlt} title="Dokumen & Lampiran" />
              <Form.Group>
                <Form.Label>Lampiran PDF (Filing Dokumen)</Form.Label>
                <Form.Control
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileChange(e, alertWarning)}
                  aria-label="Upload Lampiran PDF"
                  className="mb-3"
                />
                {attachments.length > 0 && (
                  <div className="mt-2">
                    {attachments.map((file, index) => (
                      <div 
                        key={index} 
                        className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded"
                      >
                        <span className="text-success d-flex align-items-center gap-2">
                          <FaPaperclip />
                          <span className="text-truncate" style={{ maxWidth: '300px' }} title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-muted small">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-danger p-0 ms-2" 
                          onClick={() => removeAttachment(index)}
                          aria-label={`Hapus lampiran ${file.name}`}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Form.Text className="text-muted d-block">
                  Max ukuran file 10MB per file. Format: PDF
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="bg-light py-3" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button 
          variant="secondary" 
          onClick={onHide} 
          disabled={saving}
          className="px-4"
        >
          <FaTimes className="me-1" /> Batal
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={saving}
          className="px-4"
        >
          {saving ? (
            <><Spinner animation="border" size="sm" className="me-1" /> Menyimpan...</>
          ) : (
            <><FaSave className="me-1" /> Simpan</>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAssetModal;

