import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Alert, Form, Collapse } from 'react-bootstrap';
import { statusLabels } from '../../constants/workOrderConstants.js';
import useChecklistTemplates from '../../hooks/useChecklistTemplates.js';

const DetailRow = React.memo(({ label, children }) => (
  <div className='d-flex flex-column flex-sm-row gap-2 align-items-start mb-2'>
    <div className='text-muted small text-uppercase' style={{ minWidth: 120 }}>
      {label}
    </div>
    <div className='flex-fill'>{children}</div>
  </div>
));

const SummaryItem = React.memo(({ label, value }) => (
  <div className='col-12 col-sm-6 col-md-3'>
    <div className='text-muted small text-uppercase'>{label}</div>
    <div className='fw-semibold'>{value || '-'}</div>
  </div>
));

const getAssetForWorkOrder = (selectedWorkOrder, assets = []) => {
  if (!selectedWorkOrder) return null;
  const identifier = selectedWorkOrder.assetTag || selectedWorkOrder.assetId || '';
  const matchingAsset = assets.find((asset) => {
    const ids = [
      asset?.asset_tag,
      asset?.assetTag,
      asset?.noAsset,
      asset?.id,
      asset?.it_item_id,
    ]
      .map((val) => String(val || '').trim())
      .filter(Boolean);
    return identifier && ids.includes(String(identifier).trim());
  });
  if (matchingAsset) return matchingAsset;
  const planAsset = selectedWorkOrder.planAssets?.[0];
  if (planAsset) {
    return {
      asset_tag: planAsset.asset_tag || planAsset.hostname || '',
      assetTag: planAsset.asset_tag || planAsset.hostname || '',
      hostname: planAsset.hostname,
      it_item_id: planAsset.it_item_id,
      name: planAsset.asset_tag || planAsset.hostname,
    };
  }
  if (selectedWorkOrder.planHostname) {
    return {
      hostname: selectedWorkOrder.planHostname,
      asset_tag: selectedWorkOrder.planHostname,
      assetTag: selectedWorkOrder.planHostname,
    };
  }
  return null;
};

const detailChecklistPayload = (assetForWorkOrder, selectedWorkOrder, checklistState, checklistTemplate, assetCategoryName, assetSubCategoryName) => {
  const parseNumeric = (value) => {
    if (value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const candidateAssetId = assetForWorkOrder?.asset_id ?? assetForWorkOrder?.id ?? selectedWorkOrder?.assetId ?? selectedWorkOrder?.asset_id;
  const resolvedAssetId = parseNumeric(candidateAssetId);
  const resolvedItItemId = assetForWorkOrder?.it_item_id || selectedWorkOrder?.it_item_id || null;
  const templateLabel = checklistTemplate
    ? `${checklistTemplate.category || ''}${checklistTemplate.subCategory ? ` / ${checklistTemplate.subCategory}` : ''}`.trim()
    : null;
  return {
    checklist: checklistState,
    work_type: 'preventive',
    category: assetCategoryName || checklistTemplate?.category || 'Maintenance',
    sub_category: assetSubCategoryName || checklistTemplate?.subCategory || '',
    asset_id: resolvedAssetId,
    it_item_id: resolvedItItemId,
    template_id: checklistTemplate?.id || null,
    template_label: templateLabel || null,
  };
};

const ChecklistTable = ({ checklistState, onChange, loading }) => (
  <div className='rounded-3 border overflow-auto' style={{ maxHeight: 320 }}>
    <table className='table table-sm table-bordered mb-0'>
      <thead className='table-light'>
        <tr>
          <th style={{ width: '5%' }}>NO</th>
          <th style={{ width: '35%' }}>URAIAN</th>
          <th style={{ width: '25%' }}>RANGE</th>
          <th style={{ width: '20%' }}>RESULT</th>
          <th style={{ width: '15%' }}>KETERANGAN</th>
        </tr>
      </thead>
      <tbody>
        {checklistState.map((item, index) => (
          <tr key={`checklist-${item.no}-${index}`}>
            <td>{item.no}</td>
            <td>{item.description}</td>
            <td>{item.range}</td>
            <td>
              <Form.Control
                size='sm'
                value={item.result}
                onChange={(e) => onChange(index, 'result', e.target.value)}
                placeholder='Isi hasil pemeriksaan'
                disabled={loading}
              />
            </td>
            <td>
              <Form.Control
                size='sm'
                as='textarea'
                rows={1}
                value={item.notes}
                onChange={(e) => onChange(index, 'notes', e.target.value)}
                placeholder='Keterangan tambahan'
                disabled={loading}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const WorkOrderActionModal = ({
  show,
  onClose,
  selectedWorkOrder,
  assets,
  onStartConfirm,
  onCompleteConfirm,
  showAction,
  actionMode,
  onShowToast,
}) => {
  const [checklistVisible, setChecklistVisible] = useState(false);
  const [checklistState, setChecklistState] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [completionData, setCompletionData] = useState({
    result: 'success',
    notes: '',
  });
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  const [partRows, setPartRows] = useState([{ id: Date.now(), part: '', quantity: '', notes: '' }]);

  useEffect(() => {
    if (!show) {
      setChecklistVisible(false);
    }
  }, [show]);

  useEffect(() => {
    if (!showAction || actionMode !== 'complete') {
      setCompletionData({
        result: 'success',
        timeSpent: '',
        partsUsed: '',
        notes: '',
      });
    }
  }, [showAction, actionMode]);

  const assetForWorkOrder = useMemo(() => getAssetForWorkOrder(selectedWorkOrder, assets), [
    assets,
    selectedWorkOrder,
  ]);

  const { findChecklist } = useChecklistTemplates();

  const assetCategoryName =
    assetForWorkOrder?.category_name || assetForWorkOrder?.category || assetForWorkOrder?.type;
  const assetSubCategoryName =
    assetForWorkOrder?.sub_category_name ||
    assetForWorkOrder?.type ||
    assetForWorkOrder?.category ||
    '';

  const checklistCriteria = useMemo(
    () => ({
      categoryId: assetForWorkOrder?.category_id,
      subCategoryId: assetForWorkOrder?.sub_category_id,
      mainTypeId: assetForWorkOrder?.asset_main_type_id,
      assetGroupName: assetForWorkOrder?.asset_group_name,
    }),
    [
      assetForWorkOrder?.category_id,
      assetForWorkOrder?.sub_category_id,
      assetForWorkOrder?.asset_main_type_id,
      assetForWorkOrder?.asset_group_name,
    ],
  );

  const checklistTemplate = useMemo(
    () => findChecklist(assetCategoryName, assetSubCategoryName, checklistCriteria),
    [assetCategoryName, assetSubCategoryName, checklistCriteria, findChecklist],
  );

  useEffect(() => {
    if (!checklistTemplate?.length) {
      setChecklistState([]);
      return;
    }
    setChecklistState(
      checklistTemplate.map((item) => ({
        ...item,
        result: '',
        notes: '',
      })),
    );
  }, [checklistTemplate]);

  const handleChecklistChange = (index, field, value) => {
    setChecklistState((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const completedChecklistItems = checklistState.filter((item) => item.result?.trim()).length;
  const totalChecklistItems = checklistState.length;
  const checklistProgress = totalChecklistItems
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
    : 0;
  const isChecklistComplete = totalChecklistItems > 0 && completedChecklistItems === totalChecklistItems;

  const addPartRow = () => {
    setPartRows((prev) => [...prev, { id: Date.now(), part: '', quantity: '', notes: '' }]);
  };

  const updatePartRow = (id, field, value) => {
    setPartRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removePartRow = (id) => {
    setPartRows((prev) => prev.filter((row) => row.id !== id));
  };

  const isStartAction = actionMode === 'start';
  const isCompleteAction = actionMode === 'complete';
  const actionTitle = isCompleteAction ? 'Complete Work Order' : 'Start Work Order';

  const handleStartPayload = async (payload) => {
    if (!onStartConfirm) return;
    setActionLoading(true);
    setActionError('');
    try {
      await onStartConfirm(payload);
    } catch (err) {
      setActionError(err.message || 'Gagal memulai work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPartRows = () =>
    partRows
      .filter((row) => row.part || row.quantity || row.notes)
      .map((row) => `${row.quantity || '1'}x ${row.part || 'Unnamed'}${row.notes ? ` (${row.notes})` : ''}`)
      .join('; ');

  const handleCompleteSubmit = async () => {
    if (!onCompleteConfirm) return;
    setActionLoading(true);
    setActionError('');
    try {
      await onCompleteConfirm({
        result: completionData.result,
        partsUsed: formatPartRows(),
        notes: completionData.notes,
      });
    } catch (err) {
      setActionError(err.message || 'Gagal menyelesaikan work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentResultValue =
    isCompleteAction && completionData?.result
      ? completionData.result
      : selectedWorkOrder?.result;
  const displayResult = (() => {
    switch (currentResultValue) {
      case 'success':
        return 'Success - Fixed';
      case 'partial':
        return 'Partial Success';
      case 'failed':
        return 'Failed - Needs Further Work';
      default:
        return currentResultValue || 'Belum ada hasil';
    }
  })();

  const timeSpentFromTimestamps = () => {
    const startedAt = selectedWorkOrder?.started_at || selectedWorkOrder?.scheduledStart;
    const now = selectedWorkOrder?.completed_at || new Date().toISOString();
    if (!startedAt) return '-';
    const start = new Date(startedAt);
    const end = new Date(now);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-';
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  const currentTimeSpent = timeSpentFromTimestamps();
  const currentPartsUsed =
    isCompleteAction && completionData?.partsUsed
      ? completionData.partsUsed
      : selectedWorkOrder?.parts_used || selectedWorkOrder?.partsUsed || '';
  const currentNotes =
    isCompleteAction && completionData?.notes
      ? completionData.notes
      : selectedWorkOrder?.notes || '';

  return (
    <Modal show={show} onHide={onClose} size='xl' dialogClassName='modal-start-wo'>
      <Modal.Header closeButton>
        <Modal.Title>{actionTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='row row-cols-1 row-cols-sm-2 row-cols-md-4 g-2 mb-3'>
          <SummaryItem
            label='ID'
            value={`WO-${(selectedWorkOrder?.id || selectedWorkOrder?.wo_id || 'N/A').toString().slice(-6)}`}
          />
          <SummaryItem label='Title' value={selectedWorkOrder?.title || 'Untitled'} />
          <SummaryItem
            label='Asset'
            value={assetForWorkOrder?.asset_tag || selectedWorkOrder?.assetTag || selectedWorkOrder?.assetId}
          />
          <SummaryItem
            label='Scheduled'
            value={selectedWorkOrder?.scheduledStart || selectedWorkOrder?.scheduled_date || '-'}
          />
        </div>
        <p className='text-muted mb-2'>
          Pastikan detail work order sudah sesuai sebelum memulai pekerjaan ini.
        </p>
        {assetForWorkOrder ? (
          <div className='border rounded-3 p-3 mt-3 bg-white shadow-sm'>
            <div className='d-flex justify-content-between align-items-start mb-2'>
              <h6 className='mb-0'>Detail Asset</h6>
              <Button variant='link' className='p-0' size='sm' onClick={() => setDetailCollapsed((prev) => !prev)}>
                <i className={`bi bi-chevron-${detailCollapsed ? 'down' : 'up'} fs-5`}></i>
              </Button>
            </div>
            <Collapse in={!detailCollapsed}>
              <div>
                <hr className='mb-3' />
                <DetailRow label='Asset Tag'>
                  {assetForWorkOrder.asset_tag || assetForWorkOrder.assetTag || assetForWorkOrder.noAsset || '-'}
                </DetailRow>
                <DetailRow label='Nama / PIC'>
                  {assetForWorkOrder.nama || assetForWorkOrder.name || assetForWorkOrder.pic || '-'}
                </DetailRow>
                <DetailRow label='Dept'>
                  {assetForWorkOrder.dept || assetForWorkOrder.divisi || '-'}
                </DetailRow>
                <DetailRow label='Hostname'>
                  {assetForWorkOrder.hostname || assetForWorkOrder.assetName || '-'}
                </DetailRow>
                <DetailRow label='Status'>{assetForWorkOrder.status || '-'}</DetailRow>
                <DetailRow label='Status Pekerjaan'>
                  {statusLabels[selectedWorkOrder?.status] || selectedWorkOrder?.status || 'N/A'}
                </DetailRow>
                <div className='mt-3'>
                  {isStartAction && !checklistVisible && (
                    <div className='d-flex justify-content-end'>
                      <Button variant='primary' onClick={() => setChecklistVisible(true)} disabled={actionLoading}>
                        Start Work Order
                      </Button>
                    </div>
                  )}
                  {isStartAction && checklistVisible && checklistTemplate?.length && (
                    <div className='border rounded-3 p-3 bg-white shadow-sm'>
                      <div className='d-flex flex-column flex-md-row gap-3 justify-content-between align-items-start mb-3'>
                        <div>
                          <h6 className='mb-1'>{checklistTemplate?.name || 'Checklist Kerja Lapangan'}</h6>
                          <p className='small text-muted mb-0'>
                            Lengkapi setiap item checklist untuk memastikan pengerjaan aman dan sesuai SOP.
                          </p>
                        </div>
                        <div className='d-flex flex-wrap gap-2'>
                          <span className='badge bg-success'>
                            {completedChecklistItems}/{totalChecklistItems} selesai
                          </span>
                          <span className='badge bg-secondary'>{checklistProgress}% progres</span>
                        </div>
                      </div>
                      <div className='progress mb-3' style={{ height: 6, borderRadius: 999 }}>
                        <div
                          className='progress-bar bg-success'
                          role='progressbar'
                          style={{ width: `${checklistProgress}%` }}
                          aria-valuenow={checklistProgress}
                          aria-valuemin='0'
                          aria-valuemax='100'
                        ></div>
                      </div>
                      <ChecklistTable
                        checklistState={checklistState}
                        onChange={handleChecklistChange}
                        loading={actionLoading}
                      />
                      {!isChecklistComplete && (
                        <p className='text-danger small mt-2 mb-0'>
                          Harap isi kolom <strong>Result</strong> pada setiap baris sebelum memulai work order.
                        </p>
                      )}
                      <div className='d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2'>
                        <Button variant='outline-secondary' size='sm' onClick={() => setChecklistVisible(false)}>
                          Close Checklist
                        </Button>
                        <Button
                          variant='success'
                          size='sm'
                          disabled={!isChecklistComplete || actionLoading}
                          onClick={() =>
                            handleStartPayload(
                              detailChecklistPayload(
                                assetForWorkOrder,
                                selectedWorkOrder,
                                checklistState,
                                checklistTemplate,
                                assetCategoryName,
                                assetSubCategoryName,
                              ),
                            )
                          }
                        >
                          {actionLoading && (
                            <span className='spinner-border spinner-border-sm me-2'></span>
                          )}
                          Start Work Order
                        </Button>
                      </div>
                    </div>
                  )}
                  {isStartAction && checklistVisible && !checklistTemplate?.length && (
                    <div className='border rounded-3 p-3 bg-white shadow-sm'>
                      <div className='d-flex flex-column flex-md-row justify-content-between align-items-start gap-3'>
                        <div>
                          <h6 className='mb-1'>Checklist Kustom</h6>
                          <p className='small text-muted mb-0'>
                            Tidak ada checklist otomatis untuk kategori ini. Silakan gunakan pengalaman teknis Anda
                            untuk memeriksa parameter penting sebelum menekan tombol di bawah.
                          </p>
                        </div>
                        <div className='text-muted small'>
                          Catatan: progres dicatat manual.
                        </div>
                      </div>
                      <div className='d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2'>
                        <Button variant='outline-secondary' size='sm' onClick={() => setChecklistVisible(false)}>
                          Close Checklist
                        </Button>
                        <Button
                          variant='success'
                          size='sm'
                          disabled={actionLoading}
                          onClick={() =>
                            handleStartPayload(
                              detailChecklistPayload(
                                assetForWorkOrder,
                                selectedWorkOrder,
                                checklistState,
                                checklistTemplate,
                                assetCategoryName,
                                assetSubCategoryName,
                              ),
                            )
                          }
                        >
                          {actionLoading && (
                            <span className='spinner-border spinner-border-sm me-2'></span>
                          )}
                          Start Work Order
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className='mt-4 border-top pt-3'>
                  <DetailRow label='Result'>
                    {isCompleteAction ? (
                      <Form.Select
                        value={completionData.result}
                        onChange={(e) => setCompletionData({ ...completionData, result: e.target.value })}
                      >
                        <option value='success'>Success - Fixed</option>
                        <option value='partial'>Partial Success</option>
                        <option value='failed'>Failed - Needs Further Work</option>
                      </Form.Select>
                    ) : (
                      displayResult
                    )}
                  </DetailRow>
                  <DetailRow label='Time Spent (hours)'>
                    {isCompleteAction ? (
                      <Form.Control
                        type='number'
                        value={completionData.timeSpent}
                        onChange={(e) => setCompletionData({ ...completionData, timeSpent: e.target.value })}
                      />
                    ) : (
                      currentTimeSpent || '-'
                    )}
                  </DetailRow>
                  <DetailRow label='Parts Usage'>
                    {isCompleteAction ? (
                      <>
                        <div className='table-responsive mb-2' style={{ maxHeight: 280 }}>
                          <table className='table table-sm table-bordered mb-0'>
                            <thead className='table-light'>
                              <tr>
                                <th>Part / Item</th>
                                <th style={{ width: '15%' }}>Qty</th>
                                <th>Notes</th>
                                <th style={{ width: '5%' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {partRows.map((row) => (
                                <tr key={`part-${row.id}`}>
                                  <td>
                                    <Form.Control
                                      size='sm'
                                      value={row.part}
                                      onChange={(e) => updatePartRow(row.id, 'part', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      size='sm'
                                      type='number'
                                      min='0'
                                      value={row.quantity}
                                      onChange={(e) => updatePartRow(row.id, 'quantity', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      size='sm'
                                      value={row.notes}
                                      onChange={(e) => updatePartRow(row.id, 'notes', e.target.value)}
                                    />
                                  </td>
                                  <td className='text-center'>
                                    <Button
                                      variant='link'
                                      className='p-0 text-danger'
                                      disabled={partRows.length === 1}
                                      onClick={() => removePartRow(row.id)}
                                    >
                                      <i className='bi bi-x-lg'></i>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Button variant='outline-secondary' size='sm' onClick={addPartRow}>
                          + Tambah Part
                        </Button>
                      </>
                    ) : (
                      currentPartsUsed || '-'
                    )}
                  </DetailRow>
                  <DetailRow label='Completion Notes'>
                    {isCompleteAction ? (
                      <Form.Control
                        as='textarea'
                        rows={3}
                        placeholder='Work performed, findings, recommendations...'
                        value={completionData.notes}
                        onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                      />
                    ) : (
                      currentNotes || '-'
                    )}
                  </DetailRow>
                  {isCompleteAction && (
                    <small className='text-secondary d-block mb-3'>
                      Ubah result, waktu, parts, dan catatan di atas sebelum menyelesaikan pekerjaan.
                    </small>
                  )}
                </div>
              </div>
            </Collapse>
          </div>
        ) : (
          <p className='small text-muted mb-0'>Detail asset tidak tersedia.</p>
        )}
        {actionError && (
          <Alert variant='danger' className='mt-3 mb-0'>
            {actionError}
          </Alert>
        )}
        {isCompleteAction && (
          <div className='mt-3 border-top pt-3 d-flex justify-content-end'>
            <Button variant='success' onClick={handleCompleteSubmit} disabled={actionLoading}>
              {actionLoading && (
                <span className='spinner-border spinner-border-sm me-2'></span>
              )}
              Complete Work Order
            </Button>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkOrderActionModal;
