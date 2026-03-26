import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { FaNetworkWired } from 'react-icons/fa';
// SectionHeader inline karena path tidak ada
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="d-flex align-items-center mb-3">
    <Icon className="me-2 fs-4" />
    <h5 className="mb-0 fw-bold">{title}</h5>
  </div>
);


const NetworkSection = ({ newAsset, onInputChange }) => {
  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <SectionHeader icon={FaNetworkWired} title="Network Options" />
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Hostname</Form.Label>
              <Form.Control 
                type="text" 
                name="hostname" 
                value={newAsset.hostname || ''} 
                onChange={onInputChange} 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>IP Main</Form.Label>
              <Form.Control 
                type="text" 
                name="mainIpAdress" 
                value={newAsset.mainIpAdress || ''} 
                onChange={onInputChange} 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>IP Backup</Form.Label>
              <Form.Control 
                type="text" 
                name="backupIpAdress" 
                value={newAsset.backupIpAdress || ''} 
                onChange={onInputChange} 
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default React.memo(NetworkSection);

