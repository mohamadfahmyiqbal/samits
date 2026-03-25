import React from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';

const WorkOrderFilter = ({ 
  filters, 
  setFilters, 
  technicians, 
  stats,
  searchTerm, 
  setSearchTerm,
  onRefresh,
  onCreateNew 
}) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <Row className="g-3 align-items-end">
          {/* Search */}
          <Col md={3}>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <Form.Control
                type="text"
                placeholder="Search WO ID, title, asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Col>

          {/* Status Filter */}
          <Col md={2}>
            <Form.Select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>

          {/* Priority Filter */}
          <Col md={2}>
            <Form.Select 
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </Form.Select>
          </Col>

          {/* Technician Filter */}
          <Col md={2}>
            <Form.Select 
              value={filters.technician}
              onChange={(e) => setFilters({...filters, technician: e.target.value})}
            >
              <option value="all">All Technicians</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </Form.Select>
          </Col>

          {/* Stats Cards */}
          <Col md={2} className="text-center">
            <div className="d-flex flex-column gap-1">
              <small className="text-muted">Open</small>
              <Badge bg="warning">{stats.open || 0}</Badge>
            </div>
            <div className="d-flex flex-column gap-1 mt-1">
              <small className="text-muted">In Progress</small>
              <Badge bg="primary">{stats.inProgress || 0}</Badge>
            </div>
          </Col>

          {/* Actions */}
          <Col md={1}>
            <div className="d-flex gap-1">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={onRefresh}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={onCreateNew}
              >
                <i className="bi bi-plus"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WorkOrderFilter;

