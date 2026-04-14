import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ModalSop({ show, onClose, sop, onSave, editMode }) {
  const [value, setValue] = useState(sop || '');

  useEffect(() => {
    setValue(sop || '');
  }, [sop]);

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Update SOP' : 'Detail SOP'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editMode ? (
          <Form.Control as='textarea' rows={6} value={value} onChange={(e) => setValue(e.target.value)} />
        ) : (
          <div style={{ whiteSpace: 'pre-line' }}>{value || 'SOP belum tersedia.'}</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onClose}>
          {editMode ? 'Cancel' : 'Close'}
        </Button>
        {editMode && (
          <Button
            variant='primary'
            onClick={() => {
              if (onSave) onSave(value);
              onClose();
            }}
          >
            Save
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
