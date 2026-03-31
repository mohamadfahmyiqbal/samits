import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { createWorkOrder, updateWorkOrder } from '../../service/WorkOrderService.js';

const CreateEditModal = ({
  show,
  onClose,
  showEdit,
  editWorkOrder,
  onRefresh,
  onShowToast,
  assets = [],
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

  useEffect(() => {
    if (showEdit && editWorkOrder) {
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
  }, [showEdit, editWorkOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (showEdit && editWorkOrder?.id) {
        await updateWorkOrder(editWorkOrder.id, formData);
        onShowToast('Work Order berhasil diupdate', 'success');
      } else {
        await createWorkOrder(formData);
        onShowToast('Work Order berhasil dibuat', 'success');
      }
      onRefresh();
      onClose();
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

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className='bi bi-plus-circle me-2'></i>
          {showEdit ? 'Edit Work Order' : 'Create New Work Order'}
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
                    <option key={`asset-${asset.id}`} value={asset.id}>
                      {asset.assetNo || asset.asset_tag} - {asset.name || asset.hostname}
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
          <Button variant='secondary' onClick={handleClose}>
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
  );
};

export default CreateEditModal;
