import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function StokModal({ show, onHide, editMode, currentItem, setCurrentItem, saveItem }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Stok" : "Tambah Stok"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Nama</Form.Label>
          <Form.Control
            value={currentItem.name}
            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Kategori</Form.Label>
          <Form.Select
            value={currentItem.category}
            onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
          >
            <option>Part</option>
            <option>Consumable</option>
            <option>Tools</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Qty</Form.Label>
          <Form.Control
            type="number"
            value={currentItem.qty}
            onChange={(e) => setCurrentItem({ ...currentItem, qty: Number(e.target.value) })}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Lokasi</Form.Label>
          <Form.Control
            value={currentItem.location}
            onChange={(e) => setCurrentItem({ ...currentItem, location: e.target.value })}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={saveItem}>Simpan</Button>
      </Modal.Footer>
    </Modal>
  );
}
