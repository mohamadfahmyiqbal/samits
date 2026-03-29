import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Button,
  Badge,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import { useWorkOrderData } from './hooks/useWorkOrderData.js';
import { fetchAssets } from '../../services/AssetService.js';
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
    deleteWorkOrder,
  } = useWorkOrderData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editWorkOrder, setEditWorkOrder] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [assets, setAssets] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const ITEMS_PER_PAGE = 25;
  const paginatedOrders = workOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(workOrders.length / ITEMS_PER_PAGE);

  // Reset pagination when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Load assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetchAssets();
        setAssets(response.data || response || []);
      } catch (err) {
        console.error('Failed to load assets:', err);
      }
    };
    loadAssets();
  }, []);

  const handleCreateNew = () => setShowCreateModal(true);
  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setSelectedWorkOrder(null);
  };

  const handleEdit = (wo) => {
    setSelectedWorkOrder(wo);
    setEditWorkOrder(wo);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditWorkOrder(null);
    setSelectedWorkOrder(null);
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
        setToast({ show: true, message: 'Work Order berhasil dihapus', variant: 'success' });
      } catch (err) {
        setToast({ show: true, message: 'Error: ' + err.message, variant: 'danger' });
      }
    }
  };

  const handleAction = async (action, wo) => {
    setSelectedWorkOrder(wo);
    switch (action) {
      case 'assign':
        setShowAssignModal(true);
        break;
      case 'start':
        try {
          // TODO: Implement startWorkOrder API when available
          setToast({ show: true, message: 'Work Order dimulai', variant: 'success' });
          refreshData();
        } catch (err) {
          setToast({ show: true, message: 'Error: ' + err.message, variant: 'danger' });
        }
        break;
      case 'complete':
        setShowCompleteModal(true);
        break;
      default:
        break;
    }
  };

  const handleCloseAssign = () => {
    setShowAssignModal(false);
    setSelectedWorkOrder(null);
  };

  const handleCloseComplete = () => {
    setShowCompleteModal(false);
    setSelectedWorkOrder(null);
  };

  if (error) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>
          <Alert.Heading>Error Loading Work Orders</Alert.Heading>
          <pre>{error}</pre>
          <Button onClick={handleRefresh} variant='outline-danger'>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className='py-4'>
      <Row>
        <Col>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='fw-bold mb-1'>
                <i className='bi bi-list-task text-primary me-3'></i>
                Work Orders
              </h1>
              <p className='text-muted mb-0'>Manage maintenance work orders and assignments</p>
            </div>
            <div className='stats-badge-group'>
              <Badge bg='info' className='me-2 py-2 px-3'>
                Total: {stats.total || 0}
              </Badge>
              <Badge bg='warning' className='me-2 py-2 px-3'>
                Open: {stats.open || 0}
              </Badge>
              <Badge bg='primary' className='me-2 py-2 px-3'>
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

          <Card className='shadow-sm border-0'>
            <Card.Body className='p-0'>
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
        assets={assets}
        showAssign={showAssignModal}
        onCloseAssign={handleCloseAssign}
        selectedWorkOrder={selectedWorkOrder}
        showComplete={showCompleteModal}
        onCloseComplete={handleCloseComplete}
        onShowToast={(msg, variant) => setToast({ show: true, message: msg, variant })}
      />
      <ToastContainer position='top-end' className='p-3'>
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className='me-auto'>{toast.variant === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default WorkOrderScreen;
