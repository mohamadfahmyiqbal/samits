import React, { useContext, useState, useMemo, useCallback } from "react";
import { Row, Col, Form, Button, Table, Badge, Card, Alert, Spinner } from "react-bootstrap";
import { MaintenanceContext } from "../../../context/MaintenanceContext";
import { formatDate, getStatusBadgeColor, getCategoryBadgeColor } from "../utils/scheduleUtils";
import PropTypes from "prop-types";

// Constants
const statusOrder = ["pending", "scheduled", "in-progress", "completed", "overdue", "cancelled"];
const badgeColors = {
  pending: "secondary",
  scheduled: "info",
  "in-progress": "warning",
  completed: "success",
  overdue: "danger",
  cancelled: "dark"
};

// Filter & Sort Hook
const usePMScheduleFilter = (logs) => {
  const [filter, setFilter] = useState({ category: "All", status: "All", search: "" });
  
  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => 
      (filter.category === "All" || log.category === filter.category) &&
      (filter.status === "All" || log.status === filter.status) &&
      (!filter.search || 
        log.assetName?.toLowerCase().includes(filter.search.toLowerCase()) ||
        log.itItemId?.toLowerCase().includes(filter.search.toLowerCase()) ||
        log.detail?.toLowerCase().includes(filter.search.toLowerCase())
      )
    );
    
    // Sort by scheduledDate desc, then status priority
    return result.sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      const statusIdxA = statusOrder.indexOf(a.status);
      const statusIdxB = statusOrder.indexOf(b.status);
      return statusIdxA - statusIdxB;
    });
  }, [logs, filter]);

  return { filteredLogs, filter, setFilter };
};

// Main Component
export default function PMSchedule() {
  const { pmlogs = [], loading, error, createPMLog, updatePMLog, deletePMLog } = useContext(MaintenanceContext) || {};
  const { filteredLogs, filter, setFilter } = usePMScheduleFilter(pmlogs);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itItemId: "",
    assetName: "",
    category: "",
    scheduledDate: "",
    frequency: "monthly", // daily/weekly/monthly/yearly
    detail: "",
    pic: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = useMemo(() => {
    return ["All", ...new Set(pmlogs.map(log => log.category))];
  }, [pmlogs]);

  const statusOptions = useMemo(() => ["All", ...statusOrder], []);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.itItemId || !formData.scheduledDate || !formData.detail) return;
    
    setSubmitting(true);
    try {
      await createPMLog(formData);
      setFormData({ itItemId: "", assetName: "", category: "", scheduledDate: "", frequency: "monthly", detail: "", pic: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Gagal tambah PM Schedule:", err);
      alert("Gagal tambah schedule: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }, [formData, createPMLog]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Hapus PM Schedule ini?")) return;
    try {
      await deletePMLog(id);
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  }, [deletePMLog]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <h2 className="fw-bold">
            <i className="bi bi-calendar-check me-2 text-primary"></i>
            PM Schedule
          </h2>
          <p className="text-muted mb-0">Kelola jadwal Preventive Maintenance berkala</p>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="primary" onClick={() => setShowForm(true)} className="shadow-sm">
            <i className="bi bi-plus-circle me-1"></i>
            Tambah PM Schedule
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select value={filter.category} onChange={e => setFilter(prev => ({...prev, category: e.target.value}))}>
                  {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={filter.status} onChange={e => setFilter(prev => ({...prev, status: e.target.value}))}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cari</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Asset ID / Nama / Detail..."
                  value={filter.search} 
                  onChange={e => setFilter(prev => ({...prev, search: e.target.value}))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="d-flex align-items-end h-100">
                <Button variant="outline-secondary" onClick={() => setFilter({category:"All", status:"All", search:""})}>
                  Reset
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
              <h5>Tidak ada PM Schedule</h5>
              <p className="text-muted">Buat jadwal maintenance pertama Anda.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "70vh", overflow: "auto" }}>
              <Table striped bordered hover responsive className="mb-0">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th>Asset</th>
                    <th>Kategori</th>
                    <th>Jadwal</th>
                    <th>Frekuensi</th>
                    <th>Detail</th>
                    <th>PIC</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id || log.itItemId}>
                      <td>
                        <strong>{log.assetName || log.itItemId}</strong>
                      </td>
                      <td>
                        <Badge bg={getCategoryBadgeColor?.(log.category) || "info"}>
                          {log.category}
                        </Badge>
                      </td>
                      <td>{formatDate(log.scheduledDate)}</td>
                      <td>
                        <Badge bg="secondary">{log.frequency?.toUpperCase()}</Badge>
                      </td>
                      <td>{log.detail}</td>
                      <td>{log.pic}</td>
                      <td>
                        <Badge bg={getStatusBadgeColor?.(log.status) || badgeColors[log.status] || "secondary"}>
                          {log.status}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          className="me-1"
                          onClick={() => handleDelete(log.id || log.itItemId)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Form Modal - Simplified */}
      {showForm && (
        <div className="modal show d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah PM Schedule</h5>
                <Button onClick={() => setShowForm(false)}>×</Button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Asset ID *</Form.Label>
                        <Form.Control 
                          value={formData.itItemId} 
                          onChange={e => handleFormChange("itItemId", e.target.value)}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nama Asset</Form.Label>
                        <Form.Control 
                          value={formData.assetName} 
                          onChange={e => handleFormChange("assetName", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Kategori</Form.Label>
                        <Form.Select 
                          value={formData.category} 
                          onChange={e => handleFormChange("category", e.target.value)}
                        >
                          <option value="">Pilih...</option>
                          {categoryOptions.slice(1).map(cat => <option key={cat}>{cat}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tanggal *</Form.Label>
                        <Form.Control 
                          type="date" 
                          value={formData.scheduledDate} 
                          onChange={e => handleFormChange("scheduledDate", e.target.value)}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Frekuensi</Form.Label>
                        <Form.Select 
                          value={formData.frequency} 
                          onChange={e => handleFormChange("frequency", e.target.value)}
                        >
                          <option value="daily">Harian</option>
                          <option value="weekly">Mingguan</option>
                          <option value="monthly">Bulanan</option>
                          <option value="yearly">Tahunan</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>PIC</Form.Label>
                        <Form.Control 
                          value={formData.pic} 
                          onChange={e => handleFormChange("pic", e.target.value)}
                          placeholder="Nama teknisi"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Detail Tugas *</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={formData.detail} 
                          onChange={e => handleFormChange("detail", e.target.value)}
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submitting} variant="primary">
                    {submitting ? <Spinner size="sm" /> : "Simpan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PMSchedule.propTypes = {
  pmlogs: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string
};

