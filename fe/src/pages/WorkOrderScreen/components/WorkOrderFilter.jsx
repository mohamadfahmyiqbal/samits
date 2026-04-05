import React from 'react';
import { Row, Col, Button, Form, Badge, Stack } from 'react-bootstrap';

const WorkOrderFilter = ({
  filters,
  setFilters,
  technicians,
  stats,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onCreateNew,
}) => {
  const onFilterChange = (key, value) => setFilters({ ...filters, [key]: value });

  return (
    <div className='card border-0 shadow-sm mb-4'>
      <div className='card-body p-4'>
        <Row className='g-3 align-items-center mb-3'>
          <Col md={7}>
            <div className='input-group shadow-sm'>
              <span className='input-group-text bg-white'>
                <i className='bi bi-search'></i>
              </span>
              <Form.Control
                type='search'
                placeholder='Cari WO ID, judul, asset, atau technician...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='border-start-0'
              />
            </div>
            <small className='text-muted'>Tekan enter untuk memperbarui hasil pencarian.</small>
          </Col>
          <Col md={3}>
            <Stack direction='horizontal' gap={2} className='justify-content-end'>
              <Button variant='outline-secondary' size='sm' onClick={onRefresh}>
                <i className='bi bi-arrow-clockwise'></i> Refresh
              </Button>
              <Button variant='primary' size='sm' onClick={onCreateNew}>
                <i className='bi bi-plus-circle me-1'></i> WO Baru
              </Button>
            </Stack>
          </Col>
          <Col md={2}>
            <Stack gap={1} className='text-end'>
              <span className='text-muted small'>Open</span>
              <Badge bg='warning' pill>
                {stats.open || 0}
              </Badge>
              <span className='text-muted small mt-2'>In Progress</span>
              <Badge bg='primary' pill>
                {stats.inProgress || 0}
              </Badge>
            </Stack>
          </Col>
        </Row>

        <Row className='g-3 align-items-center'>
          <Col md={4}>
            <Form.Select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className='shadow-sm'
            >
              <option value='all'>Semua Status</option>
              <option value='open'>Open</option>
              <option value='assigned'>Assigned</option>
              <option value='in_progress'>In Progress</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className='shadow-sm'
            >
              <option value='all'>Semua Prioritas</option>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
              <option value='emergency'>Emergency</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filters.technician}
              onChange={(e) => onFilterChange('technician', e.target.value)}
              className='shadow-sm'
            >
              <option value='all'>Semua Teknisi</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Badge bg='info' pill className='w-100 py-2'>
              Tracking {stats.total || 0} WO
            </Badge>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WorkOrderFilter;
