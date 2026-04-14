import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ModalMulaiMTC({ show, onClose, log, children }) {
  if (!log) return null;
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Mulai Maintenance: {log.assetId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
