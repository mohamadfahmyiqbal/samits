import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FileSearchOutlined, CheckCircleOutlined, WarningOutlined, CalendarOutlined } from '@ant-design/icons';

const PreventiveReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setReports([
        {
          id: 1,
          report_code: 'PR-2024-001',
          equipment: 'Server HP ProLiant',
          date: '2024-03-28',
          technician: 'John Doe',
          status: 'completed',
          findings: 'All systems normal',
          next_scheduled: '2024-06-28'
        },
        {
          id: 2,
          report_code: 'PR-2024-002',
          equipment: 'UPS System',
          date: '2024-03-25',
          technician: 'Jane Smith',
          status: 'minor_issues',
          findings: 'Battery calibration needed',
          next_scheduled: '2024-04-25'
        }
      ]);
      setStats({ total: 156, completed: 142, pending: 14 });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p>Loading preventive reports...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="preventive-reports-page">
      <div className="page-header mb-4">
        <h1><CalendarOutlined /> Preventive Maintenance Reports</h1>
        <p>Laporan hasil preventive maintenance semua aset</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="text-primary">{stats.total}</h2>
              <p className="mb-0">Total Reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-success text-white">
            <Card.Body>
              <h2>{stats.completed}</h2>
              <p className="mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-warning text-dark">
            <Card.Body>
              <h2>{stats.pending}</h2>
              <p className="mb-0">Pending Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2>95%</h2>
              <p className="mb-0">Compliance Rate</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <h5>Daftar Laporan</h5>
          <Button variant="outline-primary">
            <FileSearchOutlined /> Export PDF
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Equipment</th>
                <th>Tanggal</th>
                <th>Teknisi</th>
                <th>Status</th>
                <th>Findings</th>
                <th>Next PM</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td><strong>{report.report_code}</strong></td>
                  <td>{report.equipment}</td>
                  <td>{report.date}</td>
                  <td>{report.technician}</td>
                  <td>
                    <Badge bg={report.status === 'completed' ? 'success' : report.status === 'minor_issues' ? 'warning' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </td>
                  <td>{report.findings}</td>
                  <td>{report.next_scheduled}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PreventiveReports;

