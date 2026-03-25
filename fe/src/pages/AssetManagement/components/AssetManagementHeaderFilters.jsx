import React from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";

export default function AssetManagementHeaderFilters({
  title = "Data Asset Management",
  error,
  search,
  searchYear,
  onSearchChange,
  onSearchYearChange,
  onOpenAddModal,
}) {
  return (
    <>
      <h3 className="mb-4">{title}</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <Button onClick={onOpenAddModal} variant="primary">
            + Tambah Asset
          </Button>
        </Col>
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cari No.Asset, Type, Nama, Hostname..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="number"
            placeholder="Filter Tahun Beli"
            value={searchYear}
            onChange={(e) => onSearchYearChange(e.target.value)}
          />
        </Col>
      </Row>
    </>
  );
}
