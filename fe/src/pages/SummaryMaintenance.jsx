import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../services/api';



const SummaryMaintenance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchMaintenanceSummary();
  }, [period]);

  const fetchMaintenanceSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenance/summary?period=${period}`);
      setData(response.data || mockData);
    } catch (error) {
      console.error('Maintenance summary error:', error);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const mockData = [
    { type: 'Preventive', total: 45, completed: 42, pending: 3, mtbf: '28 days', cost: 'Rp 12.5M' },
    { type: 'Corrective', total: 12, completed: 12, pending: 0, mtbf: '15 days', cost: 'Rp 8.2M' },
    { type: 'Predictive', total: 8, completed: 6, pending: 2, mtbf: '90 days', cost: 'Rp 3.1M' },
  ];

  const exportSummary = () => {
    alert('Maintenance Summary Export');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Summary Maintenance</h2>
          <p className="text-muted">Statistik maintenance berdasarkan periode</p>
        </Col>
        <Col md="auto">
          <Button variant="outline-primary" onClick={fetchMaintenanceSummary} className="me-2">
            <ReloadOutlined /> Refresh
          </Button>
          <Button variant="success" onClick={exportSummary}>
            <DownloadOutlined /> Export
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto" />
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead className="table-dark">
                <tr>
                  <th>Tipe</th>
                  <th>Total</th>
                  <th>Selesai</th>
                  <th>Pending</th>
                  <th>MTBF</th>
                  <th>Biaya</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.type}</strong></td>
                    <td>{row.total}</td>
                    <td><Badge bg="success">{row.completed}</Badge></td>
                    <td className="text-warning">{row.pending}</td>
                    <td>{row.mtbf}</td>
                    <td className="text-success fw-bold">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default SummaryMaintenance;

