import React from 'react';
import { Row, Col, Form, Card } from 'react-bootstrap';
import Select from 'react-select';
import { FaServer } from 'react-icons/fa';
import {
  customSelectStyles,
  defaultStatusOptions,
  defaultAssetGroupOptions
} from '../constants/assetConstants';
// Inline SectionHeader dan OptimizedSelect karena path tidak ada
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="d-flex align-items-center mb-3">
    <Icon className="me-2 fs-4" />
    <h5 className="mb-0 fw-bold">{title}</h5>
  </div>
);

const OptimizedSelect = ({ label, name, options, value, onChange, placeholder, isDisabled, required, error, isLoading, ...props }) => (
  <Form.Group className="mb-3">
    <Form.Label>
      {label} {required && <span className="text-danger">*</span>}
    </Form.Label>
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      styles={customSelectStyles}
      {...props}
    />
    {error && <Form.Text className="text-danger">{error}</Form.Text>}
  </Form.Group>
);

const BasicInfoSection = ({
  newAsset,
  errors,
  mainTypeOptions,
  categoryOptionsApi,
  subCategoryOptionsApi,
  classificationOptions,
  statusOptions,
  assetGroupOptions,
  defaultStatusOptions,
  defaultAssetGroupOptions,
  isPC,
  loadingClassification,
  getSelectValue,
  handleSelectChange,
  onInputChange,
  isEdit,
  firstInputRef
}) => {
  const effectiveStatusOptions = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;
  const effectiveAssetGroupOptions = assetGroupOptions.length > 0 ? assetGroupOptions : defaultAssetGroupOptions;

  return (
    <div>
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
                  value={newAsset.noAsset || ''}
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
                  value={newAsset.nama || ''}
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
                value={getSelectValue(mainTypeOptions, String(newAsset.asset_main_type_id))}
                onChange={(opt) => handleSelectChange('asset_main_type_id', opt)}
                placeholder={!mainTypeOptions.length ? "Memuat Main Type..." : "Pilih Main Type"}
                required
                error={errors.asset_main_type_id}
              />
            </Col>
            <Col md={6}>
              <OptimizedSelect
                label="Kategori"
                name="category_id"
                options={categoryOptionsApi}
                value={getSelectValue(categoryOptionsApi, newAsset.category_id)}
                onChange={(opt) => handleSelectChange('category_id', opt)}
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
                onChange={(opt) => handleSelectChange('sub_category_id', opt)}
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
                  onChange={(opt) => handleSelectChange('classification_id', opt)}
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
                onChange={(opt) => handleSelectChange('assetGroup', opt)}
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
                  isClearable
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default React.memo(BasicInfoSection);

