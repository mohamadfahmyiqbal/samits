import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function DashboardUser() {
  return (
    <Container className='py-4'>
      <h4 className='mb-4'>Dashboard User</h4>
      <Row>
        <Col md={6}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Laporan Abnormal</Card.Title>
              <Card.Text>Fitur laporan abnormal akan segera hadir.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Job Request</Card.Title>
              <Card.Text>Fitur job request akan segera hadir.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
