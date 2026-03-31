import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useChecksheetManagement } from '../context/ChecksheetManagementContext';
import maintenanceChecklistService from '../../../services/maintenanceChecklist.service.js';

const initialItem = () => ({
  description: '',
  range: '',
  results: [''],
  notes: '',
  status: 'pending',
});

const getCategoryLabel = (category) =>
  category?.category || category?.category_name || category?.name || '';

const getSubCategoryLabel = (subCategory) =>
  subCategory?.sub_category_name ||
  subCategory?.sub_category ||
  subCategory?.name ||
  subCategory?.label ||
  '';

const parseResultsFromString = (value) =>
  value
    ? value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [''];

const ChecksheetManagementModals = () => {
  const { state, dispatch } = useChecksheetManagement();
  const [workType, setWorkType] = useState('preventive');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([initialItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(state.activeSubCategoryId);
  const selectedTemplate = state.selectedTemplate;
  const selectedChecksheet = state.selectedChecksheet;

  const activeCategory = useMemo(() => {
    return state.categories.find(
      (cat) =>
        (cat.category_id && cat.category_id === state.activeCategoryId) ||
        String(cat.id) === String(state.activeCategoryId),
    );
  }, [state.categories, state.activeCategoryId]);

  const subCategories = state.subCategories || [];

  const activeSubCategory = useMemo(() => {
    return subCategories.find(
      (sub) =>
        (sub.sub_category_id && sub.sub_category_id === state.activeSubCategoryId) ||
        String(sub.id) === String(state.activeSubCategoryId),
    );
  }, [subCategories, state.activeSubCategoryId]);

  const categoryLabel = getCategoryLabel(activeCategory);
  const subCategoryLabel = getSubCategoryLabel(activeSubCategory);

  const availableSubCategories = useMemo(() => subCategories, [subCategories]);
  const selectedSubCategory = useMemo(
    () =>
      availableSubCategories.find(
        (sub) =>
          (sub.sub_category_id && sub.sub_category_id === selectedSubCategoryId) ||
          String(sub.id) === String(selectedSubCategoryId),
      ) || null,
    [availableSubCategories, selectedSubCategoryId],
  );
  const selectedSubCategoryLabel = getSubCategoryLabel(selectedSubCategory);

  useEffect(() => {
    if (state.showCreateModal) {
      setWorkType('preventive');
      setItems([initialItem()]);
      setError('');
      setEditError('');
      setTitle('');
      setSelectedTemplateId('');
      setSelectedSubCategoryId(state.activeSubCategoryId);
    }
  }, [state.showCreateModal, state.activeSubCategoryId]);

  useEffect(() => {
    if (state.showEditModal && selectedChecksheet) {
      setEditError('');
      setWorkType(selectedChecksheet.work_type || 'preventive');
      setTitle(selectedChecksheet.template_label || '');
      setSelectedTemplateId(selectedChecksheet.template_id ? String(selectedChecksheet.template_id) : '');
      setItems([
        {
          description: selectedChecksheet.item_description || '',
          range: selectedChecksheet.item_range || '',
          results: parseResultsFromString(selectedChecksheet.result),
          notes: selectedChecksheet.notes || '',
          status: selectedChecksheet.status || 'pending',
        },
      ]);
    }
  }, [state.showEditModal, selectedChecksheet]);

  useEffect(() => {
    let aborted = false;

    const loadTemplates = async () => {
      if (!selectedSubCategoryLabel) {
        setTemplates([]);
        if (!state.showEditModal) {
          setSelectedTemplateId('');
        }
        return;
      }

      try {
        const response = await maintenanceChecklistService.listTemplates({
          sub_category: selectedSubCategoryLabel,
        });
        if (!aborted) {
          setTemplates(response.data || []);
          if (!state.showEditModal) {
            setSelectedTemplateId('');
          }
        }
      } catch (err) {
        if (!aborted) {
          setTemplates([]);
          if (!state.showEditModal) {
            setSelectedTemplateId('');
          }
        }
      }
    };

    loadTemplates();

    return () => {
      aborted = true;
    };
  }, [selectedSubCategoryLabel, state.showEditModal]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = templates.find(
      (tmpl) => String(tmpl.template_id) === String(selectedTemplateId),
    );
    if (template) {
      setTitle(template.template_label);
    }
  }, [selectedTemplateId, templates]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleResultChange = (itemIndex, resultIndex, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const updatedResults = [...item.results];
        updatedResults[resultIndex] = value;
        return { ...item, results: updatedResults };
      }),
    );
  };

  const addResultLine = (itemIndex) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        return { ...item, results: [...item.results, ''] };
      }),
    );
  };

  const removeResultLine = (itemIndex, resultIndex) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const updatedResults = item.results.filter((_, i) => i !== resultIndex);
        return { ...item, results: updatedResults.length ? updatedResults : [''] };
      }),
    );
  };

  const addItem = () => setItems((prev) => [...prev, initialItem()]);

  const removeItem = (index) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const closeModal = (modal) => {
    dispatch({ type: 'SET_MODAL', modal, payload: false });
  };

  const closeEditModal = () => {
    setEditError('');
    dispatch({ type: 'SET_MODAL', modal: 'showEditModal', payload: false });
  };

  const handleSubmit = async () => {
    setError('');

    const targetSubCategoryLabel = selectedSubCategoryLabel || subCategoryLabel;

    if (!categoryLabel || !targetSubCategoryLabel) {
      setError('Silakan pilih kategori dan sub kategori terlebih dahulu.');
      return;
    }

    const normalizedItems = items
      .map((item) => {
        const filteredResults = Array.isArray(item.results)
          ? item.results.map((val) => val?.trim()).filter(Boolean)
          : [];

        return {
          item_description: item.description?.trim(),
          item_range: item.range?.trim() || null,
          result: filteredResults.join('\n') || null,
          notes: item.notes?.trim() || null,
          status: item.status || 'pending',
        };
      })
      .filter((item) => Boolean(item.item_description));

    if (!normalizedItems.length) {
      setError('Tambahkan paling tidak satu item dengan deskripsi.');
      return;
    }

    const selectedTemplate = templates.find(
      (template) => String(template.template_id) === String(selectedTemplateId),
    );
    const templateLabelToSave = selectedTemplate
      ? selectedTemplate.template_label
      : title?.trim() || null;

    const payload = {
      wo_id: null,
      work_type: workType,
      category: categoryLabel,
      sub_category: targetSubCategoryLabel,
      template_id: selectedTemplate ? String(selectedTemplate.template_id) : null,
      template_label: templateLabelToSave,
      items: normalizedItems,
    };

    try {
      setSaving(true);
      await maintenanceChecklistService.create(payload);
      dispatch({ type: 'BUMP_REFRESH_KEY' });
      closeModal('showCreateModal');
    } catch (apiError) {
      setError(apiError.message || 'Gagal membuat checklist, silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedChecksheet) {
      setEditError('Checklist tidak ditemukan.');
      return;
    }

    const currentItem = items[0] || initialItem();
    const description = currentItem.description?.trim();
    if (!description) {
      setEditError('Uraian tidak boleh kosong.');
      return;
    }

    const resultLines = Array.isArray(currentItem.results)
      ? currentItem.results.map((line) => line?.trim()).filter(Boolean)
      : [];

    const payload = {
      item_description: description,
      item_range: currentItem.range?.trim() || null,
      result: resultLines.length ? resultLines.join('\n') : null,
      notes: currentItem.notes?.trim() || null,
      status: currentItem.status || 'pending',
    };

    try {
      setEditSaving(true);
      await maintenanceChecklistService.update(selectedChecksheet.checklist_id, payload);
      dispatch({ type: 'BUMP_REFRESH_KEY' });
      closeEditModal();
    } catch (apiError) {
      setEditError(apiError.message || 'Gagal mengupdate checklist');
    } finally {
      setEditSaving(false);
    }
  };

  const mode = state.showEditModal ? 'edit' : 'create';
  const showModal = state.showCreateModal || state.showEditModal;
  const activeError = mode === 'edit' ? editError : error;
  const isSubmitting = mode === 'edit' ? editSaving : saving;
  const handleClose = mode === 'edit' ? closeEditModal : () => closeModal('showCreateModal');
  const handlePrimaryAction = mode === 'edit' ? handleEditSubmit : handleSubmit;
  const primaryLabel = mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Checklist';

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'edit' ? 'Edit Checklist' : 'Buat Checklist Maintenance'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {activeError && (
          <Alert variant="danger" className="mb-3">
            {activeError}
          </Alert>
        )}

        <Form>
          <Row className="g-3 mb-3">
            <Col md={12}>
              <Form.Group controlId="checklistWorkType">
                <Form.Label>Jenis Pekerjaan</Form.Label>
                <Form.Select value={workType} onChange={(evt) => setWorkType(evt.target.value)}>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="inspection">Inspection</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="checklistCategory">
                <Form.Label>Kategori</Form.Label>
                <Form.Control type="text" readOnly value={categoryLabel || '-'} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="checklistSubCategory">
                <Form.Label>Sub Kategori</Form.Label>
                <Form.Select
                  value={selectedSubCategoryId || ''}
                  onChange={(evt) => setSelectedSubCategoryId(evt.target.value)}
                >
                  <option value="">Pilih Sub Kategori</option>
                  {availableSubCategories.map((sub) => {
                    const id = sub.sub_category_id || sub.id;
                    return (
                      <option key={id} value={id}>
                        {getSubCategoryLabel(sub)}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={12}>
              <Form.Group controlId="checklistTemplate">
                <Form.Label>Pilih Template Standar</Form.Label>
                <Form.Select
                  value={selectedTemplateId || ''}
                  onChange={(evt) => setSelectedTemplateId(evt.target.value || '')}
                >
                  <option value="">Buat manual / tanpa template</option>
                  {templates.map((template) => (
                    <option key={template.template_id} value={template.template_id}>
                      {template.template_label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Pilih standar yang sudah ada agar data bisa ditiru kembali.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={12}>
              <Form.Group controlId="checklistTitle">
                <Form.Label>Judul Checklist</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: Maintenance CCTV"
                  value={title}
                  onChange={(evt) => setTitle(evt.target.value)}
                />
                <Form.Text className="text-muted">Judul ini jadi acuan untuk template.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-4 mb-2 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">Item Checklist</h6>
              <small className="text-muted">
                Isi uraian, range, hasil, status, dan keterangan untuk setiap pengecekan.
              </small>
            </div>
            <Button variant="outline-primary" size="sm" onClick={addItem}>
              Tambah Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={`item-${index}`} className="border rounded-3 p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Item {index + 1}</strong>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Hapus
                </Button>
              </div>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group controlId={`itemDescription-${index}`}>
                    <Form.Label>Uraian</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Contoh: Periksa kondisi kabel"
                      value={item.description}
                      onChange={(evt) => handleItemChange(index, 'description', evt.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId={`itemRange-${index}`}>
                    <Form.Label>Range</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Contoh: Kabel tidak putus"
                      value={item.range}
                      onChange={(evt) => handleItemChange(index, 'range', evt.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId={`itemStatus-${index}`}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={item.status}
                      onChange={(evt) => handleItemChange(index, 'status', evt.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="done">Done</option>
                      <option value="skip">Skip</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId={`itemResult-${index}`}>
                    <Form.Label>Result (boleh lebih dari satu)</Form.Label>
                    {item.results.map((resultValue, resultIdx) => (
                      <div key={`result-${index}-${resultIdx}`} className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Contoh: Bracket rusak/tidak"
                          value={resultValue}
                          onChange={(evt) => handleResultChange(index, resultIdx, evt.target.value)}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => removeResultLine(index, resultIdx)}
                          disabled={item.results.length === 1}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button variant="link" size="sm" onClick={() => addResultLine(index)}>
                      Tambah Result
                    </Button>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId={`itemNotes-${index}`}>
                    <Form.Label>Keterangan</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Contoh: Perbaikan sudah dilakukan"
                      value={item.notes}
                      onChange={(evt) => handleItemChange(index, 'notes', evt.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Batal
        </Button>
        <Button variant="primary" onClick={handlePrimaryAction} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : primaryLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChecksheetManagementModals;
