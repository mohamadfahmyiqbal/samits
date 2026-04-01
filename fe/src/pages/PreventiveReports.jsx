import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { ReloadOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../services/api';



const PreventiveReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', period: 'month' });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance/preventive-reports', { params: filters });
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching preventive reports:', error);
      // Fallback mock data untuk development
      setReports([
        {
          id: 1,
          asset: 'Laptop XYZ-001',
          scheduleDate: '2026-02-15',
          completedDate: '2026-02-14',
          status: 'completed',
          technician: 'John Doe',
          downtime: '0.5 hours'
        },
        {
          id: 2,
          asset: 'Server ABC-123',
          scheduleDate: '2026-02-20',
          completedDate: null,
          status: 'pending',
          technician: 'Jane Smith',
          downtime: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // TODO: Implement export Excel/PDF
    alert('Export functionality coming soon');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 mb-0">Preventive Maintenance Reports</h2>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={fetchReports}>
                <ReloadOutlined /> Refresh
              </Button>
              <Button variant="success" onClick={exportReport}>
                <DownloadOutlined /> Export
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading reports...</p>
            </div>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Asset</th>
                        <th>Scheduled</th>
                        <th>Completed</th>
                        <th>Status</th>
                        <th>Technician</th>
                        <th>Downtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td>{report.asset}</td>
                          <td>{report.scheduleDate}</td>
                          <td>{report.completedDate || '-'}</td>
                          <td>
                            <Badge 
                              bg={report.status === 'completed' ? 'success' : 'warning'}
                              className="px-2 py-1"
                            >
                              {report.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td>{report.technician}</td>
                          <td>{report.downtime || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PreventiveReports;

