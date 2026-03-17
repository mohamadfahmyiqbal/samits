import React from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useSchedule } from "../context/ScheduleContext";

const ScheduleFilters = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    categoryOptions,
    viewMode,
    handleViewModeChange,
    form
  } = useSchedule();

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <Row className="align-items-center g-3">
          <Col lg={3} md={4}>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Cari Asset / PIC / Detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          
          <Col lg={2} md={4}>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white">
                <i className="bi bi-filter text-muted"></i>
              </InputGroup.Text>
              <Form.Select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border-start-0 fw-semibold"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "Semua Kategori" : cat}</option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>

          <Col lg={4} md={4} className="text-center">
            <div className="btn-group shadow-sm" role="group">
              {['daily', 'monthly', 'yearly'].map((mode) => (
                <Button 
                  key={mode}
                  variant={viewMode === mode ? "primary" : "outline-primary"}
                  onClick={() => handleViewModeChange(mode)}
                  className={viewMode !== mode ? "text-dark bg-white" : ""}
                >
                  <i className={`bi bi-${mode === 'daily' ? 'clock' : mode === 'monthly' ? 'calendar-month' : 'calendar3'} me-1`}></i>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </Col>

          <Col lg={3} md={12} className="text-end">
            <Button variant="primary" onClick={form.handleOpenForm} className="shadow-sm w-100 w-md-auto">
              <i className="bi bi-plus-circle-fill me-1"></i>
              Tambah Schedule
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ScheduleFilters;
