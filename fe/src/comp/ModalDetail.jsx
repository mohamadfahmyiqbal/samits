import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { fieldGroups, allGroupedFields } from './fieldGroups';

// Field icons mapping
const fieldIcons = {
  noAsset: 'bi-hash',
  asset_id: 'bi-upc-scan',
  it_item_id: 'bi-cpu',
  asset_tag: 'bi-tag',
  accounting_asset_no: 'bi-calculator',
  type: 'bi-laptop',
  category: 'bi-grid',
  classification: 'bi-folder',
  assetGroup: 'bi-collection',
  location: 'bi-geo-alt',
  dept: 'bi-building',
  department: 'bi-building',
  nama: 'bi-person',
  nik: 'bi-card-text',
  assigned_to: 'bi-person-check',
  vendor: 'bi-shop',
  hostname: 'bi-hdd-network',
  divisi: 'bi-diagram-3',
  purchase_price: 'bi-currency-dollar',
  harga: 'bi-cash',
  purchase_date: 'bi-calendar',
  warranty_expiry: 'bi-shield-check',
  tahunBeli: 'bi-calendar-year',
  po_date_period: 'bi-file-text',
  inspection_date_period: 'bi-clipboard-check',
  depreciation_end_date: 'bi-graph-down',
  acquisition_status: 'bi-bag-check',
  useful_life_year: 'bi-hourglass',
  extend_warranty_date: 'bi-shield-plus',
  status: 'bi-activity',
  current_status: 'bi-broadcast',
  is_disposed: 'bi-trash',
  status_history: 'bi-clock-history',
  status_changed_at: 'bi-clock',
  serial_number: 'bi-upc',
  description: 'bi-text-paragraph',
  keterangan: 'bi-sticky',
  invoice_number: 'bi-receipt',
  po_number: 'bi-file-earmark',
  no_cip: 'bi-file-earmark-text',
  created_at: 'bi-calendar-plus',
  updated_at: 'bi-calendar-check',
  sub_category_id: 'bi-folder-symlink',
  category_id: 'bi-folder2',
  classification_id: 'bi-folder2-open',
  ip_address: 'bi-globe',
  mac_address: 'bi-ethernet',
};

// Fields that should have copy button
const copyableFields = [
  'asset_tag',
  'serial_number',
  'noAsset',
  'asset_id',
  'it_item_id',
  'accounting_asset_no',
  'ip_address',
  'mac_address',
  'hostname',
];

// Critical fields to highlight
const criticalFields = ['purchase_price', 'harga', 'is_disposed', 'status'];

export default function ModalDetail({ show, onHide, asset, onEdit, onDelete, loading = false }) {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    Object.keys(fieldGroups).forEach((key, idx) => {
      initial[idx] = true;
    });
    initial['others'] = true;
    return initial;
  });

  // State for copy feedback
  const [copiedField, setCopiedField] = useState(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;
      if (e.key === 'Escape') {
        onHide();
      }
      if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onHide]);

  // Toggle section expansion
  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Copy to clipboard
  const copyToClipboard = async (value, key) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get all entries from asset - memoized (called unconditionally)
  const allEntries = useMemo(() => {
    if (!asset || Object.keys(asset).length === 0) return [];
    return Object.entries(asset).filter(([key]) => key !== 'index');
  }, [asset]);

  // Build sections - memoized
  const sections = useMemo(() => {
    const result = [];
    for (const [groupName, fields] of Object.entries(fieldGroups)) {
      const groupEntries = allEntries.filter(([key]) => fields.includes(key));
      if (groupEntries.length > 0) {
        result.push([groupName, groupEntries]);
      }
    }
    const remainingEntries = allEntries.filter(([key]) => !allGroupedFields.includes(key));
    if (remainingEntries.length > 0) {
      result.push(['Field Lainnya', remainingEntries]);
    }
    return result;
  }, [allEntries]);

  // Helper to format label - memoized
  const formatLabel = useCallback((key) => {
    const labels = {
      noAsset: 'No. Asset',
      asset_id: 'Asset ID',
      it_item_id: 'IT Item ID',
      asset_tag: 'Asset Tag',
      accounting_asset_no: 'No. Akunting',
      type: 'Tipe',
      category: 'Kategori',
      classification: 'Klasifikasi',
      assetGroup: 'Grup Asset',
      location: 'Lokasi',
      dept: 'Departemen',
      department: 'Departemen',
      nama: 'Nama Karyawan',
      nik: 'NIK',
      assigned_to: 'Penanggung Jawab',
      vendor: 'Vendor',
      hostname: 'Hostname',
      divisi: 'Divisi',
      purchase_price: 'Harga Pembelian',
      harga: 'Harga',
      purchase_date: 'Tgl Pembelian',
      warranty_expiry: 'Tgl Garansi Berakhir',
      tahunBeli: 'Tahun Beli',
      po_date_period: 'PO Period',
      inspection_date_period: 'Inspeksi Period',
      depreciation_end_date: 'Tgl Penyusutan Berakhir',
      acquisition_status: 'Status Akuisisi',
      useful_life_year: 'Umur Manfaat (Tahun)',
      extend_warranty_date: 'Perpanjangan Garansi',
      status: 'Status',
      current_status: 'Status Saat Ini',
      is_disposed: 'Status Disposal',
      status_history: 'Status Sebelumnya',
      status_changed_at: 'Tgl Perubahan Status',
      serial_number: 'Serial Number',
      description: 'Deskripsi',
      keterangan: 'Keterangan',
      invoice_number: 'No. Invoice',
      po_number: 'No. PO',
      no_cip: 'No. CIP',
      created_at: 'Dibuat',
      updated_at: 'Diupdate',
      sub_category_id: 'Sub Kategori ID',
      category_id: 'Kategori ID',
      classification_id: 'Klasifikasi ID',
      ip_address: 'IP Address',
      mac_address: 'MAC Address',
    };
    return labels[key] || key.replace(/_/g, ' ');
  }, []);

  // Helper to format values - memoized
  const formatValue = useCallback((key, value) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      if (key === 'attributes') {
        return value.map((a, idx) => (
          <div key={idx} className='array-item'>
            <span className='array-label'>{a.attr_name}:</span>{' '}
            <span className='array-value'>{a.attr_value}</span>
          </div>
        ));
      }
      if (key === 'softwares') {
        return value.map((s, idx) => (
          <div key={idx} className='array-item'>
            <span className='array-value'>{s.software_name}</span>
            {s.version && <span className='array-version'> v{s.version}</span>}
          </div>
        ));
      }
      return value.join(', ');
    }
    if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
    if (['status', 'current_status', 'status_history'].includes(key.toLowerCase())) {
      const isActive = value === 'Active' || value === 'Aktif';
      const badgeClass = isActive ? 'bg-success' : 'bg-secondary';
      return (
        <Badge pill className={`${badgeClass} px-3 py-2`}>
          {value}
        </Badge>
      );
    }
    if (key.toLowerCase() === 'purchase_price' || key.toLowerCase() === 'harga') {
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue))
        return <span className='price-value'>Rp {numValue.toLocaleString('id-ID')}</span>;
      return value;
    }
    if (
      key.includes('_at') ||
      [
        'purchase_date',
        'warranty_expiry',
        'status_changed_at',
        'depreciation_end_date',
        'extend_warranty_date',
      ].includes(key)
    ) {
      if (
        value instanceof Date ||
        (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
      ) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) return date.toLocaleDateString('id-ID');
        } catch (e) {
          /* Ignore date parsing errors */
        }
      }
    }
    return String(value);
  }, []);

  // Dynamic modal title
  const modalTitle = useMemo(() => {
    if (asset?.asset_tag) return `Detail: ${asset.asset_tag}`;
    if (asset?.noAsset) return `Detail: ${asset.noAsset}`;
    return 'Detail Asset';
  }, [asset]);

  // Loading state
  if (loading) {
    return (
      <Modal
        show={show}
        onHide={onHide}
        size='xl'
        centered
        className='futuristic-modal'
        dialogClassName='modal-90w'
      >
        <Modal.Header closeButton>
          <Modal.Title>Loading...</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center p-5'>
          <Spinner animation='border' variant='primary' className='mb-3' />
          <p className='text-muted'>Memuat data asset...</p>
        </Modal.Body>
      </Modal>
    );
  }

  // Empty state
  if (!asset || Object.keys(asset).length === 0) {
    return (
      <Modal
        show={show}
        onHide={onHide}
        size='xl'
        centered
        className='futuristic-modal'
        dialogClassName='modal-90w'
      >
        <Modal.Header closeButton>
          <Modal.Title>Detail Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center p-5'>
          <div className='empty-state'>
            <i className='bi bi-inbox fs-1 text-muted'></i>
            <h5 className='mt-3 text-muted'>Tidak ada data</h5>
            <p className='text-muted'>Asset belum dipilih atau tidak ditemukan</p>
            <Button variant='primary' onClick={onHide}>
              Kembali
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size='xl'
      centered
      className='futuristic-modal'
      dialogClassName='modal-90w'
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className='bi bi-info-circle me-2'></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='detail-container'>
          {/* Report Header */}
          <div className='report-header bg-light p-4 rounded mb-4 border shadow-sm'>
            <div className='row align-items-center'>
              <div className='col-md-4 mb-3 mb-md-0'>
                <div className='text-muted text-uppercase small fw-semibold mb-1'>
                  <i className='bi bi-tag me-1'></i>Asset Tag
                </div>
                <div className='fs-3 fw-bold text-primary'>{asset?.asset_tag || '-'}</div>
              </div>
              <div className='col-md-4 mb-3 mb-md-0'>
                <div className='text-muted text-uppercase small fw-semibold mb-1'>
                  <i className='bi bi-hash me-1'></i>No. Asset
                </div>
                <div className='fs-4 fw-semibold'>{asset?.noAsset || '-'}</div>
              </div>
              <div className='col-md-4'>
                <div className='text-muted text-uppercase small fw-semibold mb-1'>
                  <i className='bi bi-activity me-1'></i>Status
                </div>
                <div className='fs-5'>
                  {formatValue('status', asset?.status || asset?.current_status)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='mt-3 d-flex gap-2 flex-wrap'>
              <Badge
                bg='info'
                className='cursor-pointer py-2 px-3'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  document
                    .getElementById('section-keuangan')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <i className='bi bi-cash me-1'></i>Info Keuangan
              </Badge>
              <Badge
                bg='warning'
                className='cursor-pointer py-2 px-3'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  document.getElementById('section-lokasi')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <i className='bi bi-geo-alt me-1'></i>Lokasi
              </Badge>
              <Badge
                bg='success'
                className='cursor-pointer py-2 px-3'
                style={{ cursor: 'pointer' }}
                onClick={() => window.print()}
              >
                <i className='bi bi-printer me-1'></i>Cetak
              </Badge>
            </div>
          </div>

          {/* Status Timeline */}
          {asset?.status_history &&
            Array.isArray(asset.status_history) &&
            asset.status_history.length > 0 && (
              <div className='status-timeline mb-4 p-3 bg-light rounded border'>
                <h6 className='fw-bold mb-3'>
                  <i className='bi bi-clock-history me-2'></i>Status Timeline
                </h6>
                <div className='timeline'>
                  {asset.status_history.map((status, idx) => (
                    <div key={idx} className='timeline-item d-flex align-items-center mb-2'>
                      <Badge bg={idx === 0 ? 'success' : 'secondary'} className='me-2'>
                        {idx + 1}
                      </Badge>
                      <span className='me-2'>{status.status}</span>
                      <small className='text-muted'>{status.date}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Related Tickets - ITSM Integration */}
          {asset?.related_tickets && asset.related_tickets.length > 0 && (
            <div className='related-tickets-section'>
              <div className='related-tickets-header'>
                <i className='bi bi-ticket-perforated text-primary'></i>
                <h6>Related Tickets</h6>
                <span className='ticket-count-badge'>{asset.related_tickets.length}</span>
              </div>
              <div className='ticket-list'>
                {asset.related_tickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className='ticket-item'
                    onClick={() => ticket.url && window.open(ticket.url, '_blank')}
                  >
                    <div className='ticket-info'>
                      <span className='ticket-id'>{ticket.id}</span>
                      <span className={`ticket-type ${ticket.type?.toLowerCase()}`}>
                        <i
                          className={`bi bi-${ticket.type === 'Incident' ? 'exclamation-triangle' : ticket.type === 'Change' ? 'arrow-repeat' : 'question-circle'} me-1`}
                        ></i>
                        {ticket.type}
                      </span>
                      <span className='text-muted small'>{ticket.summary}</span>
                    </div>
                    <span className={`ticket-status ${ticket.status?.toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Sections */}
          <div className='report-sections'>
            {sections.map(([sectionTitle, sectionItems], sectionIndex) => {
              const sectionId = sectionTitle.toLowerCase().includes('keuangan')
                ? 'section-keuangan'
                : sectionTitle.toLowerCase().includes('lokasi')
                  ? 'section-lokasi'
                  : null;

              return (
                <div className='report-section mb-4' key={sectionTitle} id={sectionId}>
                  <div
                    className='section-header bg-primary text-white px-4 py-3 rounded-top d-flex justify-content-between align-items-center'
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    <h6 className='m-0 fw-bold text-uppercase small'>
                      <i className={`bi bi-folder me-2`}></i>
                      {sectionTitle}
                    </h6>
                    <i
                      className={`bi bi-chevron-${expandedSections[sectionIndex] ? 'up' : 'down'}`}
                    ></i>
                  </div>

                  {expandedSections[sectionIndex] && (
                    <div className='section-body border border-top-0 rounded-bottom p-0 bg-white'>
                      <table className='table table-striped table-hover m-0'>
                        <tbody>
                          {sectionItems.map(([key, value], index) => {
                            const isCopyable = copyableFields.includes(key);
                            const isCritical = criticalFields.includes(key);
                            const icon = fieldIcons[key];

                            return (
                              <tr key={key} className={index % 2 === 0 ? 'table-light' : ''}>
                                <td
                                  className='fw-semibold text-muted border-end py-3 px-4'
                                  style={{ width: '25%', whiteSpace: 'nowrap' }}
                                >
                                  {icon && <i className={`bi ${icon} me-2 text-primary`}></i>}
                                  {formatLabel(key)}
                                </td>
                                <td className='py-3 px-4' style={{ width: '75%' }}>
                                  <div className='d-flex align-items-center justify-content-between'>
                                    <span className={isCritical ? 'fw-bold' : ''}>
                                      {formatValue(key, value)}
                                      {isCritical && key.includes('price') && (
                                        <Badge bg='warning' className='ms-2'>
                                          💰 High Value
                                        </Badge>
                                      )}
                                      {key === 'is_disposed' && value === true && (
                                        <Badge bg='danger' className='ms-2'>
                                          ⚠️ Disposed
                                        </Badge>
                                      )}
                                    </span>
                                    {isCopyable && value && (
                                      <OverlayTrigger
                                        placement='top'
                                        overlay={
                                          <Tooltip>
                                            {copiedField === key ? 'Copied!' : 'Copy to clipboard'}
                                          </Tooltip>
                                        }
                                      >
                                        <Button
                                          variant='link'
                                          size='sm'
                                          className='text-muted p-0 ms-2'
                                          onClick={() => copyToClipboard(value, key)}
                                        >
                                          <i
                                            className={`bi ${copiedField === key ? 'bi-check-lg text-success' : 'bi-clipboard'}`}
                                          ></i>
                                        </Button>
                                      </OverlayTrigger>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between bg-light'>
        <div>
          <Button variant='outline-secondary' onClick={() => window.print()} className='me-2'>
            <i className='bi bi-printer me-1'></i>
            Cetak
          </Button>
          <Button variant='secondary' onClick={onHide}>
            <i className='bi bi-x-lg me-1'></i>
            Tutup
          </Button>
        </div>
        <div>
          {onEdit && (
            <Button variant='primary' onClick={() => onEdit(asset)} className='me-2'>
              <i className='bi bi-pencil-square me-1'></i>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant='outline-danger' onClick={() => onDelete(asset)}>
              <i className='bi bi-trash me-1'></i>
              Hapus
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
