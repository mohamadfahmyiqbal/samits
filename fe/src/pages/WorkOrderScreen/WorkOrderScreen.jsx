import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import ChecksheetBuilder from './components/ChecksheetBuilder.jsx';

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
    startWorkOrder,
    completeWorkOrder,
  } = useWorkOrderData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editWorkOrder, setEditWorkOrder] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [assets, setAssets] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showChecklistBuilder, setShowChecklistBuilder] = useState(false);
  const ITEMS_PER_PAGE = 25;
  const { paginatedOrders, totalPages } = useMemo(() => {
    const total = workOrders.length;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const sliceStart = (currentPage - 1) * ITEMS_PER_PAGE;
    const sliceEnd = sliceStart + ITEMS_PER_PAGE;

    return {
      paginatedOrders: workOrders.slice(sliceStart, sliceEnd),
      totalPages: pages,
    };
  }, [workOrders, currentPage]);

  // Reset pagination when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Load assets on mount
  useEffect(() => {
    let mounted = true;
    const loadAssets = async () => {
      try {
        const response = await fetchAssets();
        if (!mounted) return;
        setAssets(response.data || response || []);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load assets:', err);
      }
    };
    loadAssets();
    return () => {
      mounted = false;
    };
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

  const handleAction = (action, wo) => {
    setSelectedWorkOrder(wo);
    switch (action) {
      case 'assign':
        setShowAssignModal(true);
        break;
      case 'start':
      case 'complete':
        setModalAction(action);
        setShowActionModal(true);
        break;
      default:
        break;
    }
  };

  const handleCloseAssign = useCallback(() => {
    setShowAssignModal(false);
    setSelectedWorkOrder(null);
  }, []);

  const handleCloseAction = useCallback(() => {
    setShowActionModal(false);
    setModalAction(null);
    setSelectedWorkOrder(null);
  }, []);

  const handleStartWorkOrder = useCallback(
    async (payload = {}) => {
      const workOrderId = selectedWorkOrder?.id || selectedWorkOrder?.wo_id;
      if (!workOrderId) {
        setToast({ show: true, message: 'Tidak ada work order terpilih', variant: 'warning' });
        handleCloseAction();
        return;
      }

      try {
        await startWorkOrder(workOrderId, payload);
        setToast({ show: true, message: 'Work Order dimulai', variant: 'success' });
        refreshData();
      } catch (err) {
        setToast({ show: true, message: 'Error: ' + err.message, variant: 'danger' });
      } finally {
        handleCloseAction();
      }
    },
    [startWorkOrder, selectedWorkOrder, refreshData, handleCloseAction],
  );

  const handleCompleteWorkOrder = useCallback(
    async (payload = {}) => {
      const workOrderId = selectedWorkOrder?.id || selectedWorkOrder?.wo_id;
      if (!workOrderId) {
        setToast({ show: true, message: 'Tidak ada work order terpilih', variant: 'warning' });
        handleCloseAction();
        return;
      }

      try {
        await completeWorkOrder(workOrderId, payload);
        setToast({ show: true, message: 'Work Order selesai', variant: 'success' });
        refreshData();
      } catch (err) {
        setToast({ show: true, message: 'Error: ' + err.message, variant: 'danger' });
      } finally {
        handleCloseAction();
      }
    },
    [completeWorkOrder, selectedWorkOrder, refreshData, handleCloseAction],
  );

  if (error) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>
        <Alert.Heading>Gagal memuat work order</Alert.Heading>
          <pre>{error}</pre>
          <Button onClick={handleRefresh} variant='outline-danger'>
            Coba Lagi
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
                Work Order
              </h1>
              <p className='text-muted mb-0'>Kelola work order perawatan dan penugasannya.</p>
            </div>
          <div className='stats-badge-group d-flex flex-wrap gap-2'>
            <Badge bg='info' className='py-2 px-3'>
              Total: {stats.total || 0}
            </Badge>
              <Badge bg='warning' className='py-2 px-3'>
                Terbuka: {stats.open || 0}
              </Badge>
              <Badge bg='primary' className='py-2 px-3'>
                Berjalan: {stats.inProgress || 0}
              </Badge>
              <Badge bg='success' className='py-2 px-3'>
                Selesai: {stats.completed || 0}
              </Badge>
            </div>
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={() => setShowChecklistBuilder(true)}
            >
              Kelola Checksheet
            </Button>
          </div>

      <Row className='g-3 mb-4'>
            {[
              { label: 'Rata-rata Penugasan', value: stats.assignAvg || '-', variant: 'outline-primary' },
              { label: 'Rata-rata Penyelesaian', value: stats.closeAvg || '-', variant: 'outline-success' },
              { label: 'Belum Ditugaskan', value: stats.unassigned || '-', variant: 'outline-danger' },
            ].map((card) => (
              <Col md={4} key={card.label}>
                <div className={`border rounded-3 p-3 bg-white shadow-sm ${card.variant}`}>
                  <small className='text-muted'>{card.label}</small>
                  <h5 className='mb-0 fw-semibold'>{card.value}</h5>
                </div>
              </Col>
            ))}
          </Row>

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
        actionMode={modalAction}
        showAction={showActionModal}
        onCloseAction={handleCloseAction}
        onStartConfirm={handleStartWorkOrder}
        onCompleteConfirm={handleCompleteWorkOrder}
        onShowToast={(msg, variant) => setToast({ show: true, message: msg, variant })}
      />
      <ChecksheetBuilder
        show={showChecklistBuilder}
        onHide={() => setShowChecklistBuilder(false)}
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
