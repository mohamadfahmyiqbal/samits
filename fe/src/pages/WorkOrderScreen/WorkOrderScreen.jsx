import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Button } from 'react-bootstrap';
import { useWorkOrderData } from './hooks/useWorkOrderData.js';
import WorkOrderTable from './components/WorkOrderTable.jsx';
import WorkOrderFilter from './components/WorkOrderFilter.jsx';
import WorkOrderModals from './components/WorkOrderModals.jsx';

const WorkOrderScreen = () => {
  const {
    workOrders,
    technicians,
    stats,
    loading,
    error,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    refreshData,
    getStatusConfig,
    deleteWorkOrder
  } = useWorkOrderData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWorkOrder, setEditWorkOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const paginatedOrders = workOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(workOrders.length / ITEMS_PER_PAGE);

  const handleCreateNew = () => setShowCreateModal(true);
  const handleCloseCreate = () => setShowCreateModal(false);

  const handleEdit = (wo) => {
    setEditWorkOrder(wo);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditWorkOrder(null);
  };

  const handleRefresh = () => {
    refreshData();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleDelete = async (id) => {
    if (window.confirm('Hapus Work Order ini?')) {
      try {
        await deleteWorkOrder(id);
        refreshData();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleAction = async (action, wo) => {
    // Handle assign, start, complete actions
    console.log('Action:', action, wo);
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Work Orders</Alert.Heading>
          <pre>{error}</pre>
          <Button onClick={handleRefresh} variant="outline-danger">
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-bold mb-1">
                <i className="bi bi-list-task text-primary me-3"></i>
                Work Orders
              </h1>
              <p className="text-muted mb-0">
                Manage maintenance work orders and assignments
              </p>
            </div>
            <div className="stats-badge-group">
              <Badge bg="info" className="me-2 py-2 px-3">
                Total: {stats.total || 0}
              </Badge>
              <Badge bg="warning" className="me-2 py-2 px-3">
                Open: {stats.open || 0}
              </Badge>
              <Badge bg="primary" className="me-2 py-2 px-3">
                In Progress: {stats.inProgress || 0}
              </Badge>
            </div>
          </div>

          <WorkOrderFilter
            filters={filters}
            setFilters={setFilters}
            technicians={technicians}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={handleRefresh}
            onCreateNew={handleCreateNew}
          />

          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <WorkOrderTable
                workOrders={paginatedOrders}
                loading={loading}
                onEdit={handleEdit}
                onAssign={(wo) => handleAction('assign', wo)}
                onStart={(wo) => handleAction('start', wo)}
                onComplete={(wo) => handleAction('complete', wo)}
                onDelete={handleDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <WorkOrderModals
        showCreate={showCreateModal}
        onCloseCreate={handleCloseCreate}
        showEdit={showEditModal}
        editWorkOrder={editWorkOrder}
        onCloseEdit={handleCloseEdit}
        onRefresh={refreshData}
        technicians={technicians}
        assets={[]} // Integrate with AssetService later
      />
    </Container>
  );
};

export default WorkOrderScreen;

