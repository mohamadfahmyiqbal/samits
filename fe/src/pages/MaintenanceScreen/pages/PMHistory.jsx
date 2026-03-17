import React, { useContext, useState, useMemo, useCallback } from "react";
import { Row, Col, Form, Button, Table, Badge, Card, Alert, Spinner } from "react-bootstrap";
import { MaintenanceContext } from "../../../context/MaintenanceContext";
import * as XLSX from 'xlsx';
import PropTypes from "prop-types";

// Utils
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID');
};

const exportToExcel = (data, filename = 'pm-history.xlsx') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PM History");
  XLSX.writeFile(wb, filename);
};

// Custom Hook
const usePMHistoryFilter = (history = []) => {
  const [filter, setFilter] = useState({ 
    dateFrom: "", 
    dateTo: "", 
    category: "All", 
    status: "All",
    search: ""
  });

  const filteredHistory = useMemo(() => {
    let result = history.filter(h => {
      const date = new Date(h.completedDate || h.scheduledDate);
      const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : null;
      const toDate = filter.dateTo ? new Date(filter.dateTo) : null;
      
      return (
        (!fromDate || date >= fromDate) &&
        (!toDate || date <= toDate) &&
        (filter.category === "All" || h.category === filter.category) &&
        (filter.status === "All" || h.status === filter.status) &&
        (!filter.search || 
          h.assetName?.toLowerCase().includes(filter.search.toLowerCase()) ||
          h.itItemId?.toLowerCase().includes(filter.search.toLowerCase()) ||
          h.detail?.toLowerCase().includes(filter.search.toLowerCase())
        )
      );
    });

    // Sort by completedDate desc
    return result.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  }, [history, filter]);

  const summary = useMemo(() => {
    const catCount = {};
    const statusCount = {};
    
    filteredHistory.forEach(h => {
      catCount[h.category] = (catCount[h.category] || 0) + 1;
      statusCount[h.status] = (statusCount[h.status] || 0) + 1;
    });

    return { category: catCount, status: statusCount };
  }, [filteredHistory]);

  return { filteredHistory, filter, setFilter, summary };
};

// Main Component
export default function PMHistory() {
  const { pmhistory = [], loading, error } = useContext(MaintenanceContext) || {};
  const { filteredHistory, filter, setFilter, summary } = usePMHistoryFilter(pmhistory);

  const handleExport = useCallback(() => {
    exportToExcel(filteredHistory.map(h => ({
      'Asset ID': h.itItemId,
      'Asset Name': h.assetName,
      'Kategori': h.category,
      'Jadwal': formatDate(h.scheduledDate),
      'Selesai': formatDate(h.completedDate),
      'Status': h.status,
      'PIC': h.pic,
      'Detail': h.detail,
      'Notes': h.notes || ''
    })), `PM-History-${new Date().toISOString().slice(0,10)}.xlsx`);
  }, [filteredHistory]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-clock-history me-2 text-secondary"></i>
            PM History
          </h2>
          <p className="text-muted">Riwayat semua Preventive Maintenance</p>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="success" onClick={handleExport} className="me-2">
            <i className="bi bi-file-earmark-excel me-1"></i>
            Export Excel
          </Button>
          <Badge bg="secondary" className="py-2 px-3">
            {filteredHistory.length} records
          </Badge>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="fs-2 fw-bold text-success mb-1">{Object.values(summary.status).filter(s => s).reduce((a,b)=>a+b, 0)}</div>
              <div className="text-muted">Total History</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="fs-2 fw-bold text-info mb-1">
                {summary.status?.completed || 0}
              </div>
              <div className="text-muted">Selesai</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="fs-2 fw-bold text-warning mb-1">
                {summary.status?.overdue || 0}
              </div>
              <div className="text-muted">Terlambat</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="fs-2 fw-bold text-primary mb-1">
                {Object.keys(summary.category).length}
              </div>
              <div className="text-muted">Kategori</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Form */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Dari Tanggal</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.dateFrom} 
                  onChange={e => setFilter(p => ({...p, dateFrom: e.target.value}))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Sampai Tanggal</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.dateTo} 
                  onChange={e => setFilter(p => ({...p, dateTo: e.target.value}))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select 
                  value={filter.category} 
                  onChange={e => setFilter(p => ({...p, category: e.target.value}))}
                >
                  <option>All</option>
                  {[...new Set(pmhistory.map(h => h.category))].map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filter.status} 
                  onChange={e => setFilter(p => ({...p, status: e.target.value}))}
                >
                  <option>All</option>
                  <option>completed</option>
                  <option>overdue</option>
                  <option>cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Cari</Form.Label>
                <Form.Control 
                  placeholder="Asset / Detail..."
                  value={filter.search} 
                  onChange={e => setFilter(p => ({...p, search: e.target.value}))}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button 
                variant="outline-secondary" 
                className="mt-auto h-100 w-100" 
                onClick={() => setFilter({ dateFrom: "", dateTo: "", category: "All", status: "All", search: "" })}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* History Table */}
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
              <h5>Tidak ada riwayat PM</h5>
              <p className="text-muted">Belum ada maintenance yang selesai tercatat.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "60vh", overflow: "auto" }}>
              <Table striped bordered hover responsive className="mb-0">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th>Tanggal Selesai</th>
                    <th>Asset</th>
                    <th>Kategori</th>
                    <th>Task Detail</th>
                    <th>PIC</th>
                    <th>Status</th>
                    <th>Durasi</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((history, idx) => (
                    <tr key={history.id || idx}>
                      <td>
                        <Badge bg="secondary">{formatDate(history.completedDate)}</Badge>
                      </td>
                      <td>
                        <strong>{history.assetName || history.itItemId}</strong>
                      </td>
                      <td>
                        <Badge bg="info">{history.category}</Badge>
                      </td>
                      <td>{history.detail}</td>
                      <td>{history.pic}</td>
                      <td>
                        <Badge bg={history.status === 'completed' ? 'success' : 
                                  history.status === 'overdue' ? 'danger' : 'secondary'}>
                          {history.status}
                        </Badge>
                      </td>
                      <td>{history.duration || 'N/A'}</td>
                      <td>{history.notes ? history.notes.substring(0, 50) + '...' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

PMHistory.propTypes = {
  pmhistory: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string
};

