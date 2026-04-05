import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { assignWorkOrder } from '../../service/WorkOrderService.js';

const AssignTechnicianModal = ({
  show,
  onClose,
  selectedWorkOrder,
  technicians = [],
  onShowToast,
  onRefresh,
}) => {
  const [formData, setFormData] = useState({ technicianId: '', assignNotes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const workOrderId = selectedWorkOrder?.id || selectedWorkOrder?.wo_id;
      if (!workOrderId) throw new Error('Tidak ada Work Order terpilih');
      await assignWorkOrder(workOrderId, {
        technicianId: formData.technicianId,
        notes: formData.assignNotes,
      });
      onRefresh();
      onClose();
      onShowToast('Technician assigned successfully', 'success');
    } catch (err) {
      setError(err.message);
      onShowToast('Error: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Technician</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleAssign}>
        <Modal.Body>
          <h6>
            WO-{(selectedWorkOrder?.id || selectedWorkOrder?.wo_id || 'N/A').toString().slice(-6)}{' '}
            : {selectedWorkOrder?.title}
          </h6>
          {error && <Alert variant='danger'>{error}</Alert>}
          <Form.Group className='mb-3'>
            <Form.Label>Technician</Form.Label>
            <Form.Select
              value={formData.technicianId}
              onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
            >
              <option value=''>Pilih Technician</option>
              {technicians.map((tech) => (
                <option key={`tech-${tech.id}`} value={tech.id}>
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
              value={formData.assignNotes}
              onChange={(e) => setFormData({ ...formData, assignNotes: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' type='submit' disabled={loading}>
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssignTechnicianModal;
