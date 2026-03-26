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
import { formatRupiah } from '../constants/assetConstants';
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


const SpecSection = ({ newAsset, onInputChange }) => {
  return (
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
                value={formatDateForInput(newAsset.tahunBeli)}
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
  );
};

export default React.memo(SpecSection);

