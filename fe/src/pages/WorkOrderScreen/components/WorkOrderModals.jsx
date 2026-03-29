import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { createWorkOrder, updateWorkOrder } from '../service/WorkOrderService.js';

const WorkOrderModals = ({
  showCreate,
  onCloseCreate,
  showEdit,
  editWorkOrder,
  onCloseEdit,
  onRefresh,
  technicians,
  assets,
  showAssign,
  onCloseAssign,
  selectedWorkOrder,
  showComplete,
  onCloseComplete,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'medium',
    category: 'preventive',
    technicianId: '',
    assignNotes: '',
    result: 'success',
    timeSpent: '',
    partsUsed: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit mode
  useEffect(() => {
    if (editWorkOrder) {
      setFormData({
        title: editWorkOrder.title || '',
        description: editWorkOrder.description || '',
        assetId: editWorkOrder.assetId || '',
        priority: editWorkOrder.priority || 'medium',
        category: editWorkOrder.category || 'preventive',
        technicianId: '',
        assignNotes: '',
        result: 'success',
        timeSpent: '',
        partsUsed: '',
        notes: '',
      });
    }
  }, [editWorkOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editWorkOrder?.id) {
        await updateWorkOrder(editWorkOrder.id, formData);
        onShowToast('Work Order berhasil diupdate', 'success');
      } else {
        await createWorkOrder(formData);
        onShowToast('Work Order berhasil dibuat', 'success');
      }
      onRefresh();
      onCloseEdit();
      onCloseCreate();
      setFormData({
        title: '',
        description: '',
        assetId: '',
        priority: 'medium',
        category: 'preventive',
        technicianId: '',
        assignNotes: '',
        result: 'success',
        timeSpent: '',
        partsUsed: '',
        notes: '',
      });
    } catch (err) {
      setError(err.message);
      onShowToast('Error: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement assignWorkOrder API when available
      // await assignWorkOrder(selectedWorkOrder.id, { technicianId: formData.technicianId, notes: formData.assignNotes });
      onRefresh();
      onCloseAssign();
      onShowToast('Technician assigned successfully', 'success');
      setFormData({ ...formData, technicianId: '', assignNotes: '' });
    } catch (err) {
      setError(err.message);
      onShowToast('Error: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement completeWorkOrder API when available
      // await completeWorkOrder(selectedWorkOrder.id, { result: formData.result, timeSpent: formData.timeSpent, partsUsed: formData.partsUsed, notes: formData.notes });
      onRefresh();
      onCloseComplete();
      onShowToast('Work Order completed successfully', 'success');
      setFormData({ ...formData, result: 'success', timeSpent: '', partsUsed: '', notes: '' });
    } catch (err) {
      setError(err.message);
      onShowToast('Error: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Create/Edit Modal */}
      <Modal
        show={showCreate || showEdit}
        onHide={() => {
          onCloseCreate();
          onCloseEdit();
        }}
        size='lg'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='bi bi-plus-circle me-2'></i>
            {editWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant='danger'>{error}</Alert>}
            <Row>
              <Col md={8}>
                <Form.Group className='mb-3'>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                    <option value='emergency'>Emergency</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Asset *</Form.Label>
                  <Form.Select
                    required
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  >
                    <option value=''>Pilih Asset</option>
                    {assets?.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.assetNo} - {asset.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value='preventive'>Preventive Maintenance</option>
                    <option value='corrective'>Corrective Maintenance</option>
                    <option value='breakdown'>Breakdown</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => {
                onCloseCreate();
                onCloseEdit();
              }}
            >
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Saving...
                </>
              ) : (
                'Save Work Order'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Assign Modal */}
      <Modal show={showAssign} onHide={onCloseAssign}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Technician</Modal.Title>
        </Modal.Header>
        <Form as='form' onSubmit={handleAssign}>
          <Modal.Body>
            <h6>
              WO-{(selectedWorkOrder?.id || selectedWorkOrder?.wo_id || 'N/A').toString().slice(-6)}
              : {selectedWorkOrder?.title}
            </h6>
            <Form.Group className='mb-3'>
              <Form.Label>Technician</Form.Label>
              <Form.Select
                value={formData.technicianId || ''}
                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
              >
                <option value=''>Pilih Technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as='textarea'
                placeholder='Assignment notes...'
                value={formData.assignNotes || ''}
                onChange={(e) => setFormData({ ...formData, assignNotes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={onCloseAssign}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={loading}>
              Assign
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Complete Modal */}
      <Modal show={showComplete} onHide={onCloseComplete} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Complete Work Order</Modal.Title>
        </Modal.Header>
        <Form as='form' onSubmit={handleComplete}>
          <Modal.Body>
            <h6>
              WO-{(selectedWorkOrder?.id || selectedWorkOrder?.wo_id || 'N/A').toString().slice(-6)}
              : {selectedWorkOrder?.title}
            </h6>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Result</Form.Label>
                  <Form.Select
                    value={formData.result || ''}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  >
                    <option value='success'>Success - Fixed</option>
                    <option value='partial'>Partial Success</option>
                    <option value='failed'>Failed - Needs Further Work</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Time Spent (hours)</Form.Label>
                  <Form.Control
                    type='number'
                    value={formData.timeSpent || ''}
                    onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className='mb-3'>
              <Form.Label>Parts Used</Form.Label>
              <Form.Control
                type='text'
                placeholder='Part numbers used...'
                value={formData.partsUsed || ''}
                onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Completion Notes</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                placeholder='Work performed, findings, recommendations...'
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={onCloseComplete}>
              Cancel
            </Button>
            <Button variant='success' type='submit' disabled={loading}>
              Complete WO
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default WorkOrderModals;
