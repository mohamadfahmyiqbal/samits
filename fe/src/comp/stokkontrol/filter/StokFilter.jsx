import React, { useMemo } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

export default function StokFilter({
  search,
  setSearch,
  filterCategory,
  setFilterCategory,
  stokData,
  openAddModal,
  exportExcel
}) {
  const categoryOptions = useMemo(() => {
    const categories = (stokData || []).map((d) => d.category);
    return ["All", ...Array.from(new Set(categories))];
  }, [stokData]);

  return (
    <Row className="mb-3">
      <Col md={3}>
        <Form.Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categoryOptions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Form.Select>
      </Col>

      <Col md={4}>
        <Form.Control
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>

      <Col md={5} className="text-end">
        <Button variant="success" onClick={openAddModal}>
          + Tambah
        </Button>{" "}
        <Button variant="primary" onClick={exportExcel}>
          📥 Export Excel
        </Button>
      </Col>
    </Row>
  );
}
