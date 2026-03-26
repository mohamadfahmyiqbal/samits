import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
// SectionHeader inline
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="d-flex align-items-center mb-3">
    <Icon className="me-2 fs-4" />
    <h5 className="mb-0 fw-bold">{title}</h5>
  </div>
);
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    let formattedDate = '';
    if (typeof dateString === 'string') {
      if (dateString.length === 4) formattedDate = `${dateString}-01-01`;
      else if (dateString.length === 6) formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-01`;
      else if (dateString.length === 8) formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
      else formattedDate = dateString;
    } else {
      formattedDate = new Date(dateString).toISOString().split('T')[0];
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(formattedDate) ? formattedDate : '';
  } catch {
    return '';
  }
};


const FinanceSection = ({ newAsset, onInputChange }) => {
  return (
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
                value={formatDateForInput(newAsset.depreciation_end_date)}
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
  );
};

export default React.memo(FinanceSection);

