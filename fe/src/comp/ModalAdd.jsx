import React, { useState, useContext, useMemo, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { AssetContext } from "../context/AssetContext";
import Select from "react-select";
import { fetchCategoryTypes, fetchClassifications } from "../services/AssetService";

const GROUP_NAME_MAP = {
  client: "Client",
  utama: "Utama",
};

const createInitialFormData = (defaultAssetGroup = "client") => ({
  assetGroup: defaultAssetGroup,
  noAsset: "",
  type: "",
  divisi: "",
  dept: "",
  nama: "",
  nik: "",
  hostname: "",
  tahunBeli: "",
  category: "",
  classification: "",
  status: "Active",
  // New fields from database structure
  po_number: "",
  purchase_price_plan: "",
  purchase_price_actual: "",
  no_cip: "",
  invoice_number: "",
  line_code: "",
  at_cost_value: "",
  useful_life_year: "",
  initial_depreciation: "",
  accounting_asset_no: "",
  depreciation_end_date: "",
  disposal_plan_date: "",
  extend_warranty_date: "",
});

export default function ModalAdd({ show, onHide, onSave, defaultAssetGroup = "client" }) {
  // ✅ PERBAIKAN: fetchCategories dihapus dari destructuring
  const { utama = [], client = [] } = useContext(AssetContext);

  const [formData, setFormData] = useState(createInitialFormData(defaultAssetGroup));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [categoryTypeMap, setCategoryTypeMap] = useState({});
  const [categoryError, setCategoryError] = useState("");
  const [classifications, setClassifications] = useState([]);
  const [classificationOptions, setClassificationOptions] = useState([]);

  // Menggabungkan kedua array asset untuk pengecekan duplikasi
  const allAssets = useMemo(() => [...utama, ...client], [utama, client]);

  // ✅ PERBAIKAN: useEffect sekarang menggunakan objek yang stabil (didefinisikan di luar)
  useEffect(() => {
    if (show) {
      setFormData(createInitialFormData(defaultAssetGroup));
      setErrors({});
      setIsDataLoaded(true); 
      setCategoryError("");
    }
  }, [show, defaultAssetGroup]);

  useEffect(() => {
    if (!show) return;

    const loadCategories = async () => {
      try {
        const apiGroup = GROUP_NAME_MAP[formData.assetGroup] || formData.assetGroup;
        const res = await fetchCategoryTypes(apiGroup);
        const rows = Array.isArray(res?.data) ? res.data : [];

        const nextCategoryTypeMap = rows.reduce((acc, row) => {
          const category = (row?.category || "").trim();
          const types = Array.isArray(row?.types)
            ? row.types.map((t) => String(t || "").trim()).filter(Boolean)
            : [];
          if (!category) return acc;
          acc[category] = types;
          return acc;
        }, {});

        if (Object.keys(nextCategoryTypeMap).length > 0) {
          setCategoryTypeMap(nextCategoryTypeMap);
          setCategoryError("");
        } else {
          setCategoryTypeMap({});
          setCategoryError("Master kategori/sub kategori dari database kosong.");
        }
      } catch (_err) {
        setCategoryTypeMap({});
        setCategoryError("Gagal mengambil kategori/sub kategori dari database.");
      }
    };

    loadCategories();
  }, [show, formData.assetGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "assetGroup") {
        next.category = "";
        next.type = "";
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "category") {
        const allowedTypes = categoryTypeMap[value] || [];
        if (!allowedTypes.includes(next.type)) {
          next.type = "";
        }
        // Reset classification when category changes
        next.classification = "";
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Load classifications when category is "PC"
  useEffect(() => {
    if (!show) return;
    
    const loadClassifications = async () => {
      // Reset when category is not PC
      if (formData.category !== "PC") {
        setClassifications([]);
        setClassificationOptions([]);
        return;
      }

      try {
        const res = await fetchClassifications();
        const data = Array.isArray(res?.data) ? res.data : [];
        setClassifications(data);
        setClassificationOptions(
          data.map((c) => ({
            value: c.classification_id,
            label: c.classification_name,
          }))
        );
      } catch (err) {
        console.error("Failed to load classifications:", err);
        setClassifications([]);
        setClassificationOptions([]);
      }
    };

    loadClassifications();
  }, [show, formData.category]);

  const categoryOptions = useMemo(
    () => Object.keys(categoryTypeMap).map((category) => ({ value: category, label: category })),
    [categoryTypeMap]
  );

  const typeOptions = useMemo(
    () => (categoryTypeMap[formData.category] || []).map((t) => ({ value: t, label: t })),
    [categoryTypeMap, formData.category]
  );

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // 1. Validasi Field Wajib
    if (!formData.noAsset) {
      newErrors.noAsset = "Nomor Asset wajib diisi.";
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = "Kategori wajib diisi.";
      isValid = false;
    }
    
    // Validasi Classification wajib jika category = "PC"
    if (formData.category === "PC" && !formData.classification) {
      newErrors.classification = "Classification wajib diisi untuk kategori PC.";
      isValid = false;
    }
    
    const selectedCategoryTypes = categoryTypeMap[formData.category] || [];
    const requiresType = selectedCategoryTypes.length > 0;
    if (requiresType && !formData.type) {
      newErrors.type = "Tipe Asset wajib diisi.";
      isValid = false;
    }
    
    // 2. Validasi Format Tahun Beli
    const currentYear = new Date().getFullYear();
    const tahunBeliNum = parseInt(formData.tahunBeli);
    if (formData.tahunBeli && (isNaN(tahunBeliNum) || tahunBeliNum < 2000 || tahunBeliNum > currentYear)) {
      newErrors.tahunBeli = "Tahun Beli tidak valid (ex: 2024).";
      isValid = false;
    }

    // 3. Pengecekan Duplikasi noAsset
    if (allAssets.some(a => a.noAsset.toLowerCase() === formData.noAsset.toLowerCase())) {
        newErrors.noAsset = "Nomor Asset sudah terdaftar. Mohon gunakan nomor unik.";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await onSave(formData); 
      onHide(); 
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message || "Gagal menyimpan data." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Tambah Asset Baru</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
        {categoryError && <Alert variant="warning">{categoryError}</Alert>}
        
        {!isDataLoaded ? (
          <div className="text-center">Loading...</div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Baris 1: Asset Group & Nomor Asset */}
            <Row className="mb-2">
              <Col md={4}>
                <Form.Label>Asset Group <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="assetGroup"
                  value={formData.assetGroup}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="client">Client</option>
                  <option value="utama">Utama</option>
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form.Label>Nomor Asset <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="noAsset"
                  value={formData.noAsset}
                  onChange={handleChange}
                  isInvalid={!!errors.noAsset}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">{errors.noAsset}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Baris 2: Category & Type */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                <Select
                  isClearable
                  isDisabled={isLoading}
                  options={categoryOptions}
                  value={
                    formData.category
                      ? { value: formData.category, label: formData.category }
                      : null
                  }
                  onChange={(selectedOption) => handleSelectChange("category", selectedOption)}
                  isInvalid={!!errors.category}
                />
                <Form.Control.Feedback type="invalid" className="d-block">{errors.category}</Form.Control.Feedback>
              </Col>
              <Col>
                <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                <Select
                  isClearable
                  isDisabled={isLoading || !formData.category || typeOptions.length === 0}
                  options={typeOptions}
                  value={
                    formData.type
                      ? { value: formData.type, label: formData.type }
                      : null
                  }
                  onChange={(selectedOption) => handleSelectChange("type", selectedOption)}
                  isInvalid={!!errors.type}
                />
                <Form.Control.Feedback type="invalid" className="d-block">{errors.type}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Baris 2b: Classification (hanya muncul jika category = PC) */}
            {formData.category === "PC" && (
              <Row className="mb-2">
                <Col>
                  <Form.Label>Classification <span className="text-danger">*</span></Form.Label>
                  <Select
                    isClearable
                    isDisabled={isLoading || classificationOptions.length === 0}
                    options={classificationOptions}
                    value={
                      formData.classification
                        ? classificationOptions.find(opt => opt.value === formData.classification) || null
                        : null
                    }
                    onChange={(selectedOption) => handleSelectChange("classification", selectedOption)}
                    isInvalid={!!errors.classification}
                    placeholder={classificationOptions.length === 0 ? "Loading..." : "Pilih Classification"}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block">{errors.classification}</Form.Control.Feedback>
                </Col>
              </Row>
            )}

            {/* Baris 3: Divisi & Dept */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Divisi</Form.Label>
                <Form.Control name="divisi" value={formData.divisi} onChange={handleChange} disabled={isLoading} />
              </Col>
              <Col>
                <Form.Label>Dept</Form.Label>
                <Form.Control name="dept" value={formData.dept} onChange={handleChange} disabled={isLoading} />
              </Col>
            </Row>

            {/* Baris 4: Nama & NIK */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Nama Pengguna</Form.Label>
                <Form.Control name="nama" value={formData.nama} onChange={handleChange} disabled={isLoading} />
              </Col>
              <Col>
                <Form.Label>NIK</Form.Label>
                <Form.Control name="nik" value={formData.nik} onChange={handleChange} disabled={isLoading} />
              </Col>
            </Row>

            {/* Baris 5: Hostname & Tahun Beli */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Hostname</Form.Label>
                <Form.Control name="hostname" value={formData.hostname} onChange={handleChange} disabled={isLoading} />
              </Col>

              <Col>
                <Form.Label>Tahun Beli</Form.Label>
                <Form.Control
                  name="tahunBeli"
                  maxLength={4}
                  value={formData.tahunBeli}
                  placeholder="2024"
                  onChange={handleChange}
                  isInvalid={!!errors.tahunBeli}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">{errors.tahunBeli}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Baris 6: Status */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
                  <option value="Active">Active</option>
                  <option value="Disposal">Disposal</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Baris 7: PO Number & Invoice Number */}
            <Row className="mb-2">
              <Col>
                <Form.Label>PO Number</Form.Label>
                <Form.Control name="po_number" value={formData.po_number} onChange={handleChange} disabled={isLoading} />
              </Col>
              <Col>
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control name="invoice_number" value={formData.invoice_number} onChange={handleChange} disabled={isLoading} />
              </Col>
            </Row>

            {/* Baris 8: No CIP & Line Code */}
            <Row className="mb-2">
              <Col>
                <Form.Label>No. CIP</Form.Label>
                <Form.Control name="no_cip" value={formData.no_cip} onChange={handleChange} disabled={isLoading} />
              </Col>
              <Col>
                <Form.Label>Line Code</Form.Label>
                <Form.Control name="line_code" value={formData.line_code} onChange={handleChange} disabled={isLoading} />
              </Col>
            </Row>

            {/* Baris 9: Purchase Price Plan & Purchase Price Actual */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Purchase Price Plan</Form.Label>
                <Form.Control 
                  name="purchase_price_plan" 
                  type="number"
                  value={formData.purchase_price_plan} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  placeholder="0"
                />
              </Col>
              <Col>
                <Form.Label>Purchase Price Actual</Form.Label>
                <Form.Control 
                  name="purchase_price_actual" 
                  type="number"
                  value={formData.purchase_price_actual} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  placeholder="0"
                />
              </Col>
            </Row>

            {/* Baris 10: At Cost Value & Useful Life Year */}
            <Row className="mb-2">
              <Col>
                <Form.Label>At Cost Value</Form.Label>
                <Form.Control 
                  name="at_cost_value" 
                  type="number"
                  value={formData.at_cost_value} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  placeholder="0"
                />
              </Col>
              <Col>
                <Form.Label>Useful Life Year</Form.Label>
                <Form.Control 
                  name="useful_life_year" 
                  type="number"
                  value={formData.useful_life_year} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  placeholder="0"
                />
              </Col>
            </Row>

            {/* Baris 11: Initial Depreciation & Accounting Asset No */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Initial Depreciation</Form.Label>
                <Form.Control 
                  name="initial_depreciation" 
                  type="number"
                  value={formData.initial_depreciation} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  placeholder="0"
                />
              </Col>
              <Col>
                <Form.Label>Accounting Asset No</Form.Label>
                <Form.Control name="accounting_asset_no" value={formData.accounting_asset_no} onChange={handleChange} disabled={isLoading} />
              </Col>
            </Row>

            {/* Baris 12: Depreciation End Date & Disposal Plan Date */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Depreciation End Date</Form.Label>
                <Form.Control 
                  name="depreciation_end_date" 
                  type="date"
                  value={formData.depreciation_end_date} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </Col>
              <Col>
                <Form.Label>Disposal Plan Date</Form.Label>
                <Form.Control 
                  name="disposal_plan_date" 
                  type="date"
                  value={formData.disposal_plan_date} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </Col>
            </Row>

            {/* Baris 13: Extend Warranty Date */}
            <Row className="mb-2">
              <Col>
                <Form.Label>Extend Warranty Date</Form.Label>
                <Form.Control 
                  name="extend_warranty_date" 
                  type="date"
                  value={formData.extend_warranty_date} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </Col>
            </Row>

            {/* Alert Error */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="danger" className="mt-3 p-2">
                Mohon lengkapi semua field yang bertanda (<span className="text-danger">*</span>)
              </Alert>
            )}

          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>Batal</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Asset"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
