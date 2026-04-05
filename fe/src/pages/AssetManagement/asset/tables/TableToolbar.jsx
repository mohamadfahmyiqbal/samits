// src/comp/asset/tables/TableToolbar.jsx

import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';

const TableToolbar = ({ onSearch, onExport, exportDisabled, onAdd }) => {
  return (
    <Row className="mb-3 align-items-center">
      <Col md={4}>
        <Form.Control
          type="text"
          placeholder="Cari data..."
          onChange={(e) => onSearch(e.target.value)}
          className="me-2"
        />
      </Col>
      <Col md={8} className="d-flex justify-content-end">
        {onAdd && (
          <Button variant="success" onClick={onAdd} className="me-2">
            Tambah Aset
          </Button>
        )}
        <Button variant="primary" onClick={onExport} disabled={exportDisabled}>
          Export Excel
        </Button>
      </Col>
    </Row>
  );
};

export default TableToolbar;
