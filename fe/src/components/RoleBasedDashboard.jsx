import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useUserRole } from '../hooks/useUserRole';

export default function RoleBasedDashboard() {
  const { userRole, hasRole } = useUserRole();

  // Role-based dashboard content
  if (hasRole('MAINTENANCE')) {
    return (
      <Container className='py-4'>
        <h4 className='mb-4'>Dashboard Maintenance</h4>
        <Row>
          <Col md={6}>
            <Card className='mb-3'>
              <Card.Body>
                <Card.Title>Jadwal Maintenance</Card.Title>
                <Card.Text>Kelola jadwal pemeliharaan aset.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className='mb-3'>
              <Card.Body>
                <Card.Title>Work Orders</Card.Title>
                <Card.Text>Daftar pekerjaan maintenance.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (hasRole('USER')) {
    return (
      <Container className='py-4'>
        <h4 className='mb-4'>Dashboard User</h4>
        <Row>
          <Col md={6}>
            <Card className='mb-3'>
              <Card.Body>
                <Card.Title>Laporan Abnormal</Card.Title>
                <Card.Text>Laporkan ketidaknormalan aset.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className='mb-3'>
              <Card.Body>
                <Card.Title>Job Request</Card.Title>
                <Card.Text>Ajukan permintaan pekerjaan.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Default: SUPERADMIN, ASSET_CONTROLLER, APPROVER
  return (
    <Container className='py-4'>
      <h4 className='mb-4'>
        Dashboard{' '}
        <Badge bg='primary' className='fs-6'>
          {userRole}
        </Badge>
      </h4>
      <Row>
        <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Total Aset</Card.Title>
              <Card.Text className='fs-2 text-primary'>0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Maintenance Pending</Card.Title>
              <Card.Text className='fs-2 text-warning'>0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Approval Request</Card.Title>
              <Card.Text className='fs-2 text-info'>0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
