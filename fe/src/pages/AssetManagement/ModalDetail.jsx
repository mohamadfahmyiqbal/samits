import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { fieldGroups, allGroupedFields } from './fieldGroups';

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

const copyableFields = ['asset_tag', 'serial_number', 'noAsset', 'asset_id', 'it_item_id', 'accounting_asset_no', 'ip_address', 'mac_address', 'hostname'];
const criticalFields = ['purchase_price', 'harga', 'is_disposed', 'status'];

export default function ModalDetail({ show, onHide, asset, onEdit, onDelete, loading = false }) {
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    Object.keys(fieldGroups).forEach((key, idx) => {
      initial[idx] = true;
    });
    initial.others = true;
    return initial;
  });
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;
      if (e.key === 'Escape') onHide();
      if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onHide]);

  const toggleSection = (index) => setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const copyToClipboard = async (value, key) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const allEntries = useMemo(
    () => (!asset || Object.keys(asset).length === 0 ? [] : Object.entries(asset).filter(([key]) => key !== 'index')),
    [asset],
  );

  const sections = useMemo(() => {
    const result = [];
    for (const [groupName, fields] of Object.entries(fieldGroups)) {
      const groupEntries = allEntries.filter(([key]) => fields.includes(key));
      if (groupEntries.length > 0) result.push([groupName, groupEntries]);
    }
    const remainingEntries = allEntries.filter(([key]) => !allGroupedFields.includes(key));
    if (remainingEntries.length > 0) result.push(['Field Lainnya', remainingEntries]);
    return result;
  }, [allEntries]);

  const formatLabel = useCallback(
    (key) =>
      ({
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
      }[key] || key.replace(/_/g, ' ')),
    [],
  );

  const formatValue = useCallback((key, value) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return value.join(', ');
    }
    if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
    if (['status', 'current_status', 'status_history'].includes(key.toLowerCase())) {
      return (
        <Badge pill className={`${value === 'Active' || value === 'Aktif' ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
          {value}
        </Badge>
      );
    }
    if (key.toLowerCase() === 'purchase_price' || key.toLowerCase() === 'harga') {
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) return <span className='price-value'>Rp {numValue.toLocaleString('id-ID')}</span>;
    }
    return String(value);
  }, []);

  const modalTitle = useMemo(
    () => (asset?.asset_tag ? `Detail: ${asset.asset_tag}` : asset?.noAsset ? `Detail: ${asset.noAsset}` : 'Detail Asset'),
    [asset],
  );

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size='xl' centered>
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

  if (!asset || Object.keys(asset).length === 0) {
    return (
      <Modal show={show} onHide={onHide} size='xl' centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center p-5'>
          <Button variant='primary' onClick={onHide}>
            Kembali
          </Button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size='xl' centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className='bi bi-info-circle me-2'></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='detail-container'>
          {sections.map(([sectionTitle, sectionItems], sectionIndex) => (
            <div className='report-section mb-4' key={sectionTitle}>
              <div
                className='section-header bg-primary text-white px-4 py-3 rounded-top d-flex justify-content-between align-items-center'
                style={{ cursor: 'pointer' }}
                onClick={() => toggleSection(sectionIndex)}
              >
                <h6 className='m-0 fw-bold text-uppercase small'>{sectionTitle}</h6>
              </div>
              {expandedSections[sectionIndex] && (
                <div className='section-body border border-top-0 rounded-bottom p-0 bg-white'>
                  <table className='table table-striped table-hover m-0'>
                    <tbody>
                      {sectionItems.map(([key, value], index) => (
                        <tr key={key} className={index % 2 === 0 ? 'table-light' : ''}>
                          <td className='fw-semibold text-muted border-end py-3 px-4' style={{ width: '25%', whiteSpace: 'nowrap' }}>
                            {formatLabel(key)}
                          </td>
                          <td className='py-3 px-4' style={{ width: '75%' }}>
                            <div className='d-flex align-items-center justify-content-between'>
                              <span className={criticalFields.includes(key) ? 'fw-bold' : ''}>{formatValue(key, value)}</span>
                              {copyableFields.includes(key) && value && (
                                <OverlayTrigger
                                  placement='top'
                                  overlay={<Tooltip>{copiedField === key ? 'Copied!' : 'Copy to clipboard'}</Tooltip>}
                                >
                                  <Button variant='link' size='sm' className='text-muted p-0 ms-2' onClick={() => copyToClipboard(value, key)}>
                                    <i className={`bi ${copiedField === key ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
                                  </Button>
                                </OverlayTrigger>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Tutup
        </Button>
        {onEdit && (
          <Button variant='primary' onClick={() => onEdit(asset)} className='me-2'>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant='outline-danger' onClick={() => onDelete(asset)}>
            Hapus
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
