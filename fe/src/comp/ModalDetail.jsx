import React from "react";
import { Modal, Button, Badge } from "react-bootstrap";

// Field groupings for better organization
const fieldGroups = {
  "Informasi Utama": [
    "noAsset", "asset_id", "it_item_id", "asset_tag", "accounting_asset_no",
    "type", "category", "classification", "assetGroup"
  ],
  "Detail Lokasi & Pemilik": [
    "location", "dept", "department", "nama", "nik", 
    "assigned_to", "vendor", "hostname", "divisi"
  ],
  "Informasi Keuangan": [
    "purchase_price", "harga", "purchase_date", "warranty_expiry", 
    "tahunBeli", "po_date_period", "inspection_date_period", 
    "depreciation_end_date", "acquisition_status", "useful_life_year",
    "extend_warranty_date"
  ],
  "Jaringan": [
    "ip_address", "mac_address"
  ],
  "Status": [
    "status", "current_status", "is_disposed", "status_history", "status_changed_at"
  ],
  "Informasi Tambahan": [
    "serial_number", "description", "keterangan", 
    "invoice_number", "po_number", "no_cip",
    "created_at", "updated_at"
  ],
  "Reference IDs": [
    "sub_category_id", "category_id", "classification_id"
  ]
};

// Get all field names from groups
const allGroupedFields = Object.values(fieldGroups).flat();

export default function ModalDetail({ show, onHide, asset, onEdit, onDelete }) {
  // Tampilkan pesan jika asset kosong
  if (!asset || Object.keys(asset).length === 0) {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="futuristic-modal">
      <Modal.Header closeButton>
        <Modal.Title>Detail Asset</Modal.Title>
      </Modal.Header>
        <Modal.Body>
          <p className="text-muted text-center p-4">Tidak ada data asset yang dipilih.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // Get all entries from asset
  const allEntries = Object.entries(asset).filter(([key]) => key !== "index");

  // Build sections - first show grouped fields, then any remaining fields
  const sections = [];
  
  // Add grouped sections
  for (const [groupName, fields] of Object.entries(fieldGroups)) {
    const groupEntries = allEntries.filter(([key]) => fields.includes(key));
    if (groupEntries.length > 0) {
      sections.push([groupName, groupEntries]);
    }
  }

  // Add remaining fields that are not in any group
  const remainingEntries = allEntries.filter(([key]) => !allGroupedFields.includes(key));
  if (remainingEntries.length > 0) {
    sections.push(["Field Lainnya", remainingEntries]);
  }

  // Helper to format label
  const formatLabel = (key) => {
    const labels = {
      noAsset: "No. Asset",
      asset_id: "Asset ID",
      it_item_id: "IT Item ID",
      asset_tag: "Asset Tag",
      accounting_asset_no: "No. Akunting",
      type: "Tipe",
      category: "Kategori",
      classification: "Klasifikasi",
      assetGroup: "Grup Asset",
      location: "Lokasi",
      dept: "Departemen",
      department: "Departemen",
      nama: "Nama Karyawan",
      nik: "NIK",
      assigned_to: "Penanggung Jawab",
      vendor: "Vendor",
      hostname: "Hostname",
      divisi: "Divisi",
      purchase_price: "Harga Pembelian",
      harga: "Harga",
      purchase_date: "Tgl Pembelian",
      warranty_expiry: "Tgl Garansi Berakhir",
      tahunBeli: "Tahun Beli",
      po_date_period: "PO Period",
      inspection_date_period: "Inspeksi Period",
      depreciation_end_date: "Tgl Penyusutan Berakhir",
      acquisition_status: "Status Akuisisi",
      useful_life_year: "Umur Manfaat (Tahun)",
      extend_warranty_date: "Perpanjangan Garansi",
      status: "Status",
      current_status: "Status Saat Ini",
      is_disposed: "Status Disposal",
      status_history: "Status Sebelumnya",
      status_changed_at: "Tgl Perubahan Status",
      serial_number: "Serial Number",
      description: "Deskripsi",
      keterangan: "Keterangan",
      invoice_number: "No. Invoice",
      po_number: "No. PO",
      no_cip: "No. CIP",
      created_at: "Dibuat",
      updated_at: "Diupdate",
      sub_category_id: "Sub Kategori ID",
      category_id: "Kategori ID",
      classification_id: "Klasifikasi ID",
      ip_address: "IP Address",
      mac_address: "MAC Address",
    };
    return labels[key] || key.replace(/_/g, " ");
  };

  // Helper to format values
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      // Handle attributes array
      if (key === 'attributes') {
        return value.map((a, idx) => (
          <div key={idx} className="array-item">
            <span className="array-label">{a.attr_name}:</span> <span className="array-value">{a.attr_value}</span>
          </div>
        ));
      }
      // Handle softwares array
      if (key === 'softwares') {
        return value.map((s, idx) => (
          <div key={idx} className="array-item">
            <span className="array-value">{s.software_name}</span>
            {s.version && <span className="array-version"> v{s.version}</span>}
          </div>
        ));
      }
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? "Ya" : "Tidak";
    }

    if (key.toLowerCase() === "status" || key.toLowerCase() === "current_status" || key.toLowerCase() === "status_history") {
      const isActive = value === "Active" || value === "Aktif";
      return (
        <Badge className={isActive ? "badge-active" : "badge-inactive"}>
          {value}
        </Badge>
      );
    }

    if (key.toLowerCase() === "purchase_price" || key.toLowerCase() === "harga") {
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      if (!isNaN(numValue)) {
        return <span className="price-value">Rp {numValue.toLocaleString("id-ID")}</span>;
      }
      return value;
    }

    // Format date
    if (key.includes('_at') || key === 'purchase_date' || key === 'warranty_expiry' || key === 'status_changed_at' || key === 'depreciation_end_date' || key === 'extend_warranty_date') {
      if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('id-ID');
          }
        } catch (e) {
          // Ignore date parsing errors
        }
      }
    }

    return String(value);
  };

    return (
      <Modal show={show} onHide={onHide} size="xl" centered className="futuristic-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detail Asset</Modal.Title>
        </Modal.Header>
      <Modal.Body>
        <div className="detail-container">
          {sections.map(([sectionTitle, sectionItems]) => (
            <div className="detail-section" key={sectionTitle}>
              <h6 className="section-title">{sectionTitle}</h6>
              <div className="detail-grid">
                {sectionItems.map(([key, value]) => (
                  <div className="detail-card" key={key}>
                    <div className="detail-label">
                      {formatLabel(key)}
                    </div>
                    <div className="detail-value">
                      {formatValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {onDelete && (
          <Button variant="outline-danger" onClick={() => onDelete(asset)}>
            Hapus
          </Button>
        )}
        {onEdit && (
          <Button variant="primary" onClick={() => onEdit(asset)}>
            Edit
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

