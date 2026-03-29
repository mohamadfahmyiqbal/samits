import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function DashboardMaintenance() {
  return (
    <Container className='py-4'>
      <h4 className='mb-4'>Dashboard Maintenance</h4>
      <Row>
        <Col md={6}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Jadwal Maintenance</Card.Title>
              <Card.Text>Fitur jadwal maintenance akan segera hadir.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Work Orders</Card.Title>
              <Card.Text>Fitur work orders akan segera hadir.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
