import React from 'react';
import { Container, Card, Alert } from 'react-bootstrap';

const PlaceholderPage = ({ title, description }) => {
  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{title}</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <Alert.Heading>Halaman Dalam Pengembangan</Alert.Heading>
            <p>{description || 'Fitur ini sedang dalam tahap pengembangan.'}</p>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlaceholderPage;
