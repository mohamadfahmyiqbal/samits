import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
// SectionHeader & OptimizedSelect inline
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="d-flex align-items-center mb-3">
    <Icon className="me-2 fs-4" />
    <h5 className="mb-0 fw-bold">{title}</h5>
  </div>
);

import Select from 'react-select';

const OptimizedSelect = ({ label, name, options, value, onChange, placeholder, isDisabled, required, error, isLoading, isSearchable, isClearable, ...props }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isSearchable={isSearchable}
      isClearable={isClearable}
      styles={customSelectStyles}
      {...props}
    />
    {error && <Form.Text className="text-danger">{error}</Form.Text>}
  </Form.Group>
);

import { customSelectStyles } from '../constants/assetConstants';


const OwnerSection = ({
  newAsset,
  filteredKaryawanOptions,
  getSelectValue,
  handleSelectChange,
  setNewAsset,
  loadingKaryawan
}) => {
  return (
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
                handleSelectChange('nik', opt);
                if (opt?.dept) {
                  setNewAsset(prev => ({ ...prev, dept: opt.dept }));
                } else {
                  setNewAsset(prev => ({ ...prev, dept: '' }));
                }
              }}
              isLoading={loadingKaryawan}
              isSearchable
              isClearable
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
  );
};

export default React.memo(OwnerSection);

