import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { Modal, Button, Row, Col, Spinner, Table, Form } from 'react-bootstrap';
import Select from 'react-select';
import { format } from 'date-fns';
import { alertWarning, alertConfirm } from '../../../comp/Notification';

const hasFormData = (data) => {
  return (
    data.assetMainTypeId ||
    data.categoryId ||
    data.subCategoryId ||
    data.assetId ||
    data.scheduledDate ||
    data.pic ||
    data.detail ||
    data.hostname
  );
};

function ScheduleForm({
  show,
  onHide,
  formData,
  filteredAssets,
  isSubmitting,
  isEditing,
  itemsLoading,
  onMainTypeChange,
  onCategoryChange,
  onSubCategoryChange,
  onAssetChange,
  onFormChange,
  onSubmit,
  mainTypeOptions,
  categoryOptions,
  subCategoryOptions,
  karyawanData,
}) {
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const sortedMainTypes = useMemo(() => {
    if (!mainTypeOptions || !Array.isArray(mainTypeOptions)) return [];
    return [...mainTypeOptions].sort((a, b) => a.label.localeCompare(b.label));
  }, [mainTypeOptions]);

  const sortedCategories = useMemo(() => {
    if (!categoryOptions || !Array.isArray(categoryOptions)) return [];
    return [...categoryOptions].sort((a, b) => a.label.localeCompare(b.label));
  }, [categoryOptions]);

  const sortedSubCategories = useMemo(() => {
    if (!subCategoryOptions || !Array.isArray(subCategoryOptions)) return [];
    return [...subCategoryOptions].sort((a, b) => a.label.localeCompare(b.label));
  }, [subCategoryOptions]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => (a.noAsset || '').localeCompare(b.noAsset || ''));
  }, [filteredAssets]);

  const sortedKaryawan = useMemo(() => {
    if (!karyawanData || !Array.isArray(karyawanData)) return [];
    return [...karyawanData].sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  }, [karyawanData]);

  const picOptions = useMemo(() => {
    return sortedKaryawan.map((karyawan) => ({
      value: karyawan.nama,
      label:
        `${karyawan.nik} - ${karyawan.nama} ${karyawan.dept ? `(${karyawan.dept})` : ''}`.trim(),
    }));
  }, [sortedKaryawan]);

  const handleClose = useCallback(() => {
    if (!isEditing && hasFormData(formData)) {
      alertConfirm({
        title: 'Tutup Form',
        text: 'Apakah Anda yakin ingin menutup form? Data yang sudah diisi akan hilang.',
        onConfirm: () => onHide(),
      });
    } else {
      onHide();
    }
  }, [formData, onHide, isEditing]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') handleClose();
    },
    [handleClose]
  );

  const isFormIncomplete = useMemo(() => {
    if (isEditing) {
      return !formData.assetId || !formData.scheduledDate;
    }
    return (
      !formData.assetMainTypeId ||
      !formData.categoryId ||
      !formData.subCategoryId ||
      !formData.assetId ||
      !formData.scheduledDate
    );
  }, [formData, isEditing]);

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (isFormIncomplete) {
        alertWarning('Mohon lengkapi semua field yang wajib diisi (*)');
        return;
      }

      onSubmit(e);
    },
    [isFormIncomplete, onSubmit]
  );

  useEffect(() => {
    if (show && firstInputRef.current && !isEditing) {
      const timer = setTimeout(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [show, isEditing]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lg'
      backdrop='static'
      keyboard={true}
      centered
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton className='bg-light'>
        <Modal.Title className='fw-bold text-primary'>
          {isEditing ? 'Edit Schedule Maintenance' : 'Tambah Schedule Maintenance'}
        </Modal.Title>
      </Modal.Header>

      <Form ref={formRef} onSubmit={handleSubmitForm}>
        <Modal.Body>
          {/* Section 1: Asset Information (Disamakan layoutnya) */}
          <Row className='g-3'>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>
                  Main Type <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Select
                  ref={firstInputRef}
                  value={formData.assetMainTypeId}
                  onChange={onMainTypeChange}
                  required
                  disabled={isEditing} // Disabled saat edit
                >
                  {isEditing ? (
                    <option>{formData.assetMainTypeName}</option>
                  ) : (
                    <>
                      <option value=''>-- Pilih Main Type --</option>
                      {sortedMainTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>
                  Kategori <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Select
                  value={formData.categoryId}
                  onChange={onCategoryChange}
                  disabled={isEditing || !formData.assetMainTypeId}
                  required
                >
                  {isEditing ? (
                    <option>{formData.categoryName || formData.assetMainTypeName}</option>
                  ) : (
                    <>
                      <option value=''>-- Pilih Kategori --</option>
                      {sortedCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className='g-3'>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>
                  Sub Kategori <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Select
                  value={formData.subCategoryId}
                  onChange={onSubCategoryChange}
                  disabled={isEditing || !formData.categoryId}
                  required
                >
                  {isEditing ? (
                    <option>{formData.subCategoryName}</option>
                  ) : (
                    <>
                      <option value=''>-- Pilih Sub Kategori --</option>
                      {sortedSubCategories.map((sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                    </>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>No. Asset / Hostname</Form.Label>
                <Form.Control
                  type='text'
                  value={`${formData.assetId} ${formData.hostname ? `(${formData.hostname})` : ''}`}
                  disabled
                  readOnly
                  className='bg-light'
                />
              </Form.Group>
            </Col>
          </Row>

          {!isEditing && (
            <Row className='g-3'>
              <Col md={12}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-medium'>
                    Daftar Asset Tersedia <span className='text-danger'>*</span>
                  </Form.Label>
                  {sortedAssets.length === 0 ? (
                    <div className='p-3 bg-light border rounded text-center'>
                      <small className='text-muted'>
                        Pilih kriteria di atas untuk melihat daftar asset.
                      </small>
                    </div>
                  ) : itemsLoading ? (
                    <div className='d-flex justify-content-center align-items-center py-4 gap-2'>
                      <Spinner animation='border' size='sm' role='status' aria-hidden='true' />
                      <small>Memuat item...</small>
                    </div>
                  ) : (
                    <div className='table-responsive border rounded' style={{ maxHeight: '200px' }}>
                      <Table size='sm' bordered hover className='mb-0'>
                        <thead className='table-light sticky-top'>
                          <tr>
                            <th className='text-center' style={{ width: '50px' }}>
                              Pilih
                            </th>
                            <th>No. Asset</th>
                            <th>Hostname</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAssets.map((asset) => (
                            <tr key={asset.noAsset}>
                              <td className='text-center align-middle'>
                                <Form.Check
                                  type='radio' // Gunakan radio karena hanya satu yang boleh dipilih
                                  controlId='assetSelection'
                                  checked={formData.assetId === asset.noAsset}
                                  onChange={() => onAssetChange(asset.noAsset)}
                                />
                              </td>
                              <td className='small'>{asset.noAsset}</td>
                              <td className='small text-truncate' style={{ maxWidth: '150px' }}>
                                {asset.hostname || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          <hr className='my-4' />

          {/* Section 2: Schedule Details */}
          <Row className='g-3'>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>
                  Tanggal & Jam Mulai <span className='text-danger'>*</span>
                </Form.Label>
                <Row className='g-2'>
                  <Col>
                    <Form.Control
                      type='date'
                      value={formData.scheduledDate}
                      onChange={(e) => onFormChange('scheduledDate', e.target.value)}
                      required
                      min={isEditing ? undefined : today}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type='time'
                      value={formData.scheduledTime || ''}
                      onChange={(e) => onFormChange('scheduledTime', e.target.value)}
                      required
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>
                  Tanggal & Jam Selesai <span className='text-danger'>*</span>
                </Form.Label>
                <Row className='g-2'>
                  <Col>
                    <Form.Control
                      type='date'
                      value={formData.scheduledEndDate || ''}
                      onChange={(e) => onFormChange('scheduledEndDate', e.target.value)}
                      min={formData.scheduledDate || today}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type='time'
                      value={formData.scheduledEndTime || ''}
                      onChange={(e) => onFormChange('scheduledEndTime', e.target.value)}
                      required
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row className='g-3'>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>PIC Pelaksana</Form.Label>
                <Select
                  options={picOptions}
                  value={picOptions.find((opt) => opt.value === formData.pic) || null}
                  onChange={(opt) => onFormChange('pic', opt?.value || '')}
                  isClearable
                  isSearchable
                  placeholder='Cari PIC (NIK / Nama)'
                  styles={{
                    control: (base) => ({ ...base, minHeight: '38px' }),
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fw-medium'>Detail / Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={1}
                  value={formData.detail}
                  onChange={(e) => onFormChange('detail', e.target.value)}
                  placeholder='Ringkasan tugas...'
                  style={{ minHeight: '38px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className='mb-0'>
                <Form.Label className='fw-medium text-muted small text-uppercase'>
                  Catatan Tambahan
                </Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => onFormChange('notes', e.target.value)}
                  placeholder='Informasi tambahan jika ada...'
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className='bg-light'>
          <Button variant='outline-secondary' onClick={handleClose} type='button' className='px-4'>
            Batal
          </Button>
          <Button
            variant='primary'
            type='submit'
            disabled={isSubmitting || isFormIncomplete}
            className='px-4 shadow-sm'
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className='me-2'
                />
                Menyimpan...
              </>
            ) : isEditing ? (
              'Simpan Perubahan'
            ) : (
              'Simpan Jadwal'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default React.memo(ScheduleForm);
