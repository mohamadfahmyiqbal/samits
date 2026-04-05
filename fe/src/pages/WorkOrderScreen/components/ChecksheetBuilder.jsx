import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import useChecklistTemplates from '../hooks/useChecklistTemplates.js';

const EMPTY_ITEM = { no: 1, description: '', range: '' };

const normalizeId = (template = {}) => {
  if (template.id) return template.id;
  const cat = String(template.category || '').trim().toLowerCase();
  const sub = String(template.subCategory || '').trim().toLowerCase();
  return `${cat}-${sub}`.replace(/\s+/g, '-');
};

const ensureItems = (items = []) =>
  items.map((item, index) => ({
    no: item.no || index + 1,
    description: item.description || '',
    range: item.range || '',
  }));

const ChecksheetBuilder = ({ show, onHide }) => {
  const { templates, upsertTemplate, deleteTemplate } = useChecklistTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [draft, setDraft] = useState({
    id: '',
    category: '',
    subCategory: '',
    items: [],
  });

  const templateOptions = useMemo(() => templates, [templates]);

  useEffect(() => {
    if (!templateOptions.length) {
      setDraft({ id: '', category: '', subCategory: '', items: [] });
      setSelectedTemplateId('');
      return;
    }
    const targetId =
      selectedTemplateId || templateOptions[0]?.id || templateOptions[0]?.category || '';
    setSelectedTemplateId(targetId);
  }, [templateOptions]);

  useEffect(() => {
    const current = templateOptions.find((t) => t.id === selectedTemplateId);
    if (current) {
      setDraft({
        id: current.id,
        category: current.category || '',
        subCategory: current.subCategory || '',
        items: ensureItems(current.items),
      });
    }
  }, [selectedTemplateId, templateOptions]);

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleAddItem = () => {
    setDraft((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM, no: prev.items.length + 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, no: idx + 1 })),
    }));
  };

  const handleSave = () => {
    if (!draft.category.trim() || !draft.subCategory.trim() || !draft.items.length) {
      return;
    }
    upsertTemplate({
      ...draft,
      id: normalizeId(draft),
      items: ensureItems(draft.items),
    });
  };

  const handleDelete = () => {
    if (!draft.id) return;
    deleteTemplate(draft.id);
    setSelectedTemplateId('');
  };

  return (
    <Modal show={show} onHide={onHide} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Checksheet Work Order</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className='mb-3'>
          <Form.Label>Template yang tersedia</Form.Label>
          <Form.Select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            {templateOptions.map((template) => (
              <option key={template.id} value={template.id}>
                {template.category || 'Tanpa Kategori'} / {template.subCategory || 'Umum'}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className='row mb-3'>
          <Form.Label className='col-sm-2 col-form-label'>Kategori</Form.Label>
          <div className='col-sm-10'>
            <Form.Control
              value={draft.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder='Contoh: Hardware'
            />
          </div>
        </Form.Group>
        <Form.Group className='row mb-4'>
          <Form.Label className='col-sm-2 col-form-label'>Sub kategori</Form.Label>
          <div className='col-sm-10'>
            <Form.Control
              value={draft.subCategory}
              onChange={(e) => handleFieldChange('subCategory', e.target.value)}
              placeholder='Contoh: CCTV Outdoor'
            />
          </div>
        </Form.Group>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h6 className='mb-0'>Item Checklist</h6>
          <Button size='sm' onClick={handleAddItem}>
            Tambah Item
          </Button>
        </div>
        <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>NO</th>
              <th style={{ width: '40%' }}>URAIAN</th>
              <th style={{ width: '40%' }}>RANGE</th>
              <th style={{ width: '15%' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item, index) => (
              <tr key={`builder-item-${index}`}>
                <td className='align-middle'>{item.no}</td>
                <td>
                  <Form.Control
                    size='sm'
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    size='sm'
                    value={item.range}
                    onChange={(e) => handleItemChange(index, 'range', e.target.value)}
                  />
                </td>
                <td className='align-middle'>
                  <Button variant='outline-danger' size='sm' onClick={() => handleRemoveItem(index)}>
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Tutup
        </Button>
        <Button
          variant='primary'
          onClick={handleSave}
          disabled={!draft.category || !draft.subCategory || !draft.items.length}
        >
          Simpan Template
        </Button>
        <Button variant='danger' onClick={handleDelete} disabled={!draft.id}>
          Hapus Template
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChecksheetBuilder;
