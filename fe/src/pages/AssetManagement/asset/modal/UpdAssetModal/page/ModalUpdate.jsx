import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import Select from 'react-select';
import {
  FaDesktop,
  FaSave,
  FaTimes,
  FaPaperclip,
  FaServer,
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaTrash,
  FaEye,
  FaFilePdf,
} from 'react-icons/fa';
import userService from '../../../../../services/UserService';
import {
  fetchClassifications,
  fetchAssetGroups,
  fetchMainTypes,
  fetchCategoryTypes,
  getAssetDetails,
  deleteAssetDocument,
  fetchSubCategoryDetails,
} from '../../../../../services/AssetService';
import { alertWarning, alertSuccess, alertError } from '../../../../Notification';
import {
  customSelectStyles,
  formatRupiah,
  initialAssetState,
  defaultStatusOptions,
} from '../../AddAssetModal/constants/assetConstants';
import { SectionHeader } from '../../AddAssetModal/components/FormComponents';
import { API_BASE, resolveDocumentUrl } from '../../../../../../config/api';

export default function ModalUpdate({ show, onHide, asset, onSave }) {
  const [formData, setFormData] = useState(initialAssetState);
  const [karyawanList, setKaryawanList] = useState([]);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [loadingClassification, setLoadingClassification] = useState(false);
  const [saving, setSaving] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [assetGroupOptions, setAssetGroupOptions] = useState([]);
  const [mainTypeOptions, setMainTypeOptions] = useState([]);
  const [categoryOptionsApi, setCategoryOptionsApi] = useState([]);
  const [subCategoryOptionsApi, setSubCategoryOptionsApi] = useState([]);
  const [loadingSubCategory, setLoadingSubCategory] = useState(false);
  const [subCategoryInitialLoaded, setSubCategoryInitialLoaded] = useState(false);
  const [hierarchyLoaded, setHierarchyLoaded] = useState(false);

  const firstInputRef = useRef(null);

  const effectiveCategoryOptions = categoryOptionsApi;
  const effectiveSubCategoryOptions = subCategoryOptionsApi;

  useEffect(() => {
    if (show) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [show]);

  useEffect(() => {
    const fetchLatestAssetData = async () => {
      if (!show || !asset?.noAsset) return;

      try {
        const response = await getAssetDetails(asset.noAsset);
        const latestData = response.data;

        // DEBUG: Log assignment info untuk troubleshoot dept kosong
        if (latestData.debug_assignment_info) {
          console.log('[ModalUpdate DEBUG]', latestData.debug_assignment_info);

          // Show user-friendly alert jika no active assignment
          const debugInfo = latestData.debug_assignment_info;
          if (!debugInfo.hasActiveAssignment || !debugInfo.latestAssignmentNik) {
            alertWarning(
              `Asset ${latestData.noAsset}: ` +
                `No active assignment. Total assignments: ${debugInfo.assignmentsCount}. ` +
                'Pastikan ada ITItemAssignment dengan returned_at=NULL.'
            );
          } else if (!debugInfo.hrgaEmployeeFound) {
            alertWarning(
              `NIK ${debugInfo.latestAssignmentNik} tidak ditemukan di HRGA DB. ` +
                'Cek data USER table di HRGA.'
            );
          }
        }

        if (latestData) {
          const purchasePrice =
            latestData.purchase_price_actual ??
            latestData.purchase_price ??
            latestData.purchase_price_plan ??
            '';
          setFormData({
            noAsset: latestData.noAsset || latestData.asset_tag || '',
            nama: latestData.nama || latestData.asset_name || '',
            category: latestData.category || '',
            category_id: latestData.category_id || '',
            sub_category: latestData.sub_category || latestData.type || '',
            sub_category_id: latestData.sub_category_id || '',
            asset_main_type_id: latestData.asset_main_type_id || '',
            asset_main_type_name: latestData.asset_main_type_name || '',
            classification_id: latestData.classification_id || '',
            assetGroup: latestData.asset_group_name || latestData.assetGroup || '',
            asset_group_id: latestData.asset_group_id || '',
            divisi: latestData.divisi || '',
            dept: latestData.dept || latestData.department || '',
            nik: latestData.nik || '',
            hostname: latestData.hostname || '',
            tahunBeli: latestData.tahunBeli || '',
            type: latestData.type || '',
            tahunDepreciation: latestData.tahunDepreciation || '',
            mainIpAdress: latestData.mainIpAdress || latestData.main_ip_address || '',
            backupIpAdress: latestData.backupIpAdress || latestData.backup_ip_address || '',
            status: latestData.status || latestData.current_status || 'Active',
            po_number: latestData.po_number || '',
            purchase_price_actual: purchasePrice,
            invoice_number: latestData.invoice_number || '',
          });
          setPriceDisplay(purchasePrice ? formatRupiah(purchasePrice) : '');
          const docs = latestData.documents || [];
          setExistingDocuments(docs);
        }
      } catch (error) {
        console.error('Error fetching latest asset data:', error);
        if (asset) {
          const purchasePrice =
            asset.purchase_price_actual ?? asset.purchase_price ?? asset.purchase_price_plan ?? '';
          setFormData({
            noAsset: asset.noAsset || '',
            nama: asset.nama || '',
            category: asset.category || '',
            category_id: asset.category_id || '',
            sub_category: asset.sub_category || '',
            sub_category_id: asset.sub_category_id || '',
            asset_main_type_id: asset.asset_main_type_id || '',
            asset_main_type_name: asset.asset_main_type_name || '',
            classification_id: asset.classification_id || '',
            assetGroup: asset.asset_group_name || asset.assetGroup || '',
            asset_group_id: asset.asset_group_id || '',
            divisi: asset.divisi || '',
            dept: asset.dept || '',
            nik: asset.nik || '',
            hostname: asset.hostname || '',
            tahunBeli: asset.tahunBeli || '',
            status: asset.status || 'Active',
            po_number: asset.po_number || '',
            purchase_price_actual: purchasePrice,
            invoice_number: asset.invoice_number || '',
          });
          setPriceDisplay(purchasePrice ? formatRupiah(purchasePrice) : '');
        }
      }
    };

    fetchLatestAssetData();
  }, [show, asset?.noAsset]);

  // NEW: Dedicated useEffect untuk load Sub Category options setelah asset data loaded
  useEffect(() => {
    if (!show || !formData.sub_category_id || subCategoryInitialLoaded) return;

    const loadInitialSubCategoryOptions = async () => {
      setLoadingSubCategory(true);
      try {
        console.log('[INITIAL-SUBCAT] Loading options for:', formData.sub_category_id);

        // Prioritas 1: Try hierarchy jika available
        if (formData.asset_main_type_id && formData.category_id) {
          const response = await fetchCategoryTypes(
            null,
            formData.asset_main_type_id,
            formData.category_id
          );
          const data = Array.isArray(response?.data) ? response.data : [];
          const options = [];
          data.forEach((item) => {
            if (Array.isArray(item.sub_categories)) {
              item.sub_categories.forEach((sub) => {
                if (sub.sub_category_name) {
                  options.push({
                    value: sub.sub_category_id,
                    label: sub.sub_category_name,
                    sub_category_id: sub.sub_category_id,
                  });
                }
              });
            }
          });
          setSubCategoryOptionsApi(options);
          console.log('[INITIAL-SUBCAT] Loaded from hierarchy:', options.length, 'options');
          return;
        }

        // Prioritas 2: Fallback fetchSubCategoryDetails
        const response = await fetchSubCategoryDetails(formData.sub_category_id);
        const data = response.data;
        if (data) {
          // Load full list via main_type + category jika tersedia dari details
          if (data.asset_main_type_id && data.it_category_id) {
            const catResponse = await fetchCategoryTypes(
              null,
              data.asset_main_type_id,
              data.it_category_id
            );
            const catData = Array.isArray(catResponse?.data) ? catResponse.data : [];
            const options = [];
            catData.forEach((item) => {
              if (Array.isArray(item.sub_categories)) {
                item.sub_categories.forEach((sub) => {
                  if (sub.sub_category_name) {
                    options.push({
                      value: sub.sub_category_id,
                      label: sub.sub_category_name,
                      sub_category_id: sub.sub_category_id,
                    });
                  }
                });
              }
            });
            setSubCategoryOptionsApi(options);
          } else {
            // Minimal option: current value only
            setSubCategoryOptionsApi([
              {
                value: formData.sub_category_id,
                label: formData.sub_category || 'Sub Kategori',
                sub_category_id: formData.sub_category_id,
              },
            ]);
          }
          console.log('[INITIAL-SUBCAT] Fallback success');
        }
      } catch (err) {
        console.error('[INITIAL-SUBCAT] Failed:', err);
        // Fallback minimal: tampilkan current value
        setSubCategoryOptionsApi([
          {
            value: formData.sub_category_id,
            label: formData.sub_category || 'Sub Kategori',
            sub_category_id: formData.sub_category_id,
          },
        ]);
      } finally {
        setLoadingSubCategory(false);
        setSubCategoryInitialLoaded(true);
      }
    };

    loadInitialSubCategoryOptions();
  }, [
    show,
    formData.sub_category_id,
    formData.asset_main_type_id,
    formData.category_id,
    subCategoryInitialLoaded,
  ]);

  useEffect(() => {
    const fetchKaryawan = async () => {
      setLoadingKaryawan(true);
      try {
        const response = await userService.getAllKaryawan();
        const data = response.data || [];
        setKaryawanList(data);
        setKaryawanOptions(data.map((k) => ({ value: k.nik, label: `${k.nik} - ${k.nama}` })));
      } catch (error) {
        console.error('Error fetching karyawan:', error);
      } finally {
        setLoadingKaryawan(false);
      }
    };
    if (show) fetchKaryawan();
  }, [show]);

  useEffect(() => {
    if (asset) {
      const purchasePrice =
        asset.purchase_price_actual ?? asset.purchase_price ?? asset.purchase_price_plan ?? '';
      setFormData({
        noAsset: asset.noAsset || '',
        nama: asset.nama || '',
        category: asset.category || '',
        category_id: asset.category_id || '',
        sub_category: asset.sub_category || '',
        sub_category_id: asset.sub_category_id || '',
        asset_main_type_id: asset.asset_main_type_id || '',
        asset_main_type_name: asset.asset_main_type_name || '',
        classification_id: asset.classification_id || '',
        assetGroup: asset.asset_group_name || asset.assetGroup || '',
        asset_group_id: asset.asset_group_id || '',
        divisi: asset.divisi || '',
        dept: asset.dept || '',
        nik: asset.nik || '',
        hostname: asset.hostname || '',
        tahunBeli: asset.tahunBeli || '',
        status: asset.status || 'Active',
        po_number: asset.po_number || '',
        purchase_price_actual: purchasePrice,
        invoice_number: asset.invoice_number || '',
      });
      setPriceDisplay(purchasePrice ? formatRupiah(purchasePrice) : '');
    }
  }, [asset]);

  useEffect(() => {
    if (!show) {
      setFormData(initialAssetState);
      setClassificationOptions([]);
      setMainTypeOptions([]);
      setCategoryOptionsApi([]);
      setSubCategoryOptionsApi([]);
      setSaving(false);
      setPriceDisplay('');
      setAttachments([]);
      setExistingDocuments([]);
      setPreviewDoc(null);
      setSubCategoryInitialLoaded(false);
      setHierarchyLoaded(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show || formData.sub_category?.toLowerCase() !== 'pc') {
      setClassificationOptions([]);
      return;
    }
    setLoadingClassification(true);
    fetchClassifications()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setClassificationOptions(
          data.map((c) => ({ value: c.classification_id, label: c.classification_name }))
        );
      })
      .catch((err) => {
        console.error('Failed to load classifications:', err);
        setClassificationOptions([]);
      })
      .finally(() => setLoadingClassification(false));
  }, [show, formData.sub_category]);

  useEffect(() => {
    if (!show) return;

    const fetchMainTypeOptions = async () => {
      try {
        const response = await fetchMainTypes();
        const data = Array.isArray(response?.data) ? response.data : [];
        const options = data.map((mt) => ({
          value: mt.asset_main_type_id,
          label: mt.main_type_name,
        }));
        setMainTypeOptions(options);
      } catch (error) {
        console.error('Failed to load main types:', error);
        setMainTypeOptions([]);
      }
    };

    fetchMainTypeOptions();
  }, [show]);

  useEffect(() => {
    if (!show || !formData.asset_main_type_id) {
      setCategoryOptionsApi([]);
      return;
    }

    const fetchCategoryOptions = async () => {
      try {
        const response = await fetchCategoryTypes(null, formData.asset_main_type_id);
        const data = Array.isArray(response?.data) ? response.data : [];

        const map = new Map();
        data.forEach((item) => {
          if (!map.has(item.category_id)) {
            map.set(item.category_id, {
              value: item.category_id,
              label: item.category,
              category_id: item.category_id,
            });
          }
        });

        setCategoryOptionsApi(Array.from(map.values()));
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategoryOptionsApi([]);
      }
    };

    fetchCategoryOptions();
  }, [show, formData.asset_main_type_id]);

  useEffect(() => {
    if (!show) return;

    const ensureSubCategoryHierarchy = async () => {
      if (hierarchyLoaded) return;

      const subCatId = formData.sub_category_id;
      console.log('[HIERARCHY] Checking hierarchy:', {
        sub_category_id: subCatId,
        asset_main_type_id: formData.asset_main_type_id,
        category_id: formData.category_id,
        hierarchyLoaded,
      });

      // Fallback 1: Gunakan BE resolution (sudah enhanced)
      if (formData.asset_main_type_id && formData.category_id && !loadingSubCategory) {
        setLoadingSubCategory(true);
        console.log('[HIERARCHY] Loading subcats via category-types...');
        try {
          const response = await fetchCategoryTypes(
            null,
            formData.asset_main_type_id,
            formData.category_id
          );
          const data = Array.isArray(response?.data) ? response.data : [];
          const options = [];
          data.forEach((item) => {
            if (Array.isArray(item.sub_categories)) {
              item.sub_categories.forEach((sub) => {
                if (sub.sub_category_name) {
                  options.push({
                    value: sub.sub_category_id,
                    label: sub.sub_category_name,
                    sub_category_id: sub.sub_category_id,
                  });
                }
              });
            }
          });
          setSubCategoryOptionsApi(options);
          console.log('[HIERARCHY] Loaded', options.length, 'subcats');
        } catch (err) {
          console.error('[HIERARCHY] category-types failed:', err);
        } finally {
          setLoadingSubCategory(false);
        }
        return;
      }

      // Fallback 2: Fetch via sub_category_id jika ada tapi hierarchy NULL
      if (
        subCatId &&
        (!formData.asset_main_type_id || !formData.category_id) &&
        !loadingSubCategory
      ) {
        setLoadingSubCategory(true);
        console.log('[HIERARCHY] Fallback: fetchSubCategoryDetails', subCatId);
        try {
          const response = await fetchSubCategoryDetails(subCatId);
          const data = response.data;
          if (data) {
            setFormData((prev) => ({
              ...prev,
              asset_main_type_id: data.asset_main_type_id || prev.asset_main_type_id,
              category_id: data.it_category_id || prev.category_id,
              category: data.category_name || prev.category,
            }));
            console.log('[HIERARCHY] Fallback success:', data);
          }
        } catch (err) {
          console.error('[HIERARCHY] Fallback failed:', err);
        } finally {
          setLoadingSubCategory(false);
        }
      }

      setHierarchyLoaded(true);
    };

    ensureSubCategoryHierarchy();
  }, [
    show,
    formData.sub_category_id,
    formData.asset_main_type_id,
    formData.category_id,
    hierarchyLoaded,
    loadingSubCategory,
  ]);

  useEffect(() => {
    if (!show) {
      setAssetGroupOptions([]);
      return;
    }

    const fetchAssetGroupOptions = async () => {
      try {
        const response = await fetchAssetGroups(null, null, formData.sub_category_id || null);
        const data = Array.isArray(response?.data) ? response.data : [];
        let options = data
          .map((g) => ({
            value: g.asset_group_id || g.asset_group_name,
            label: g.asset_group_name,
            asset_group_id: g.asset_group_id || '',
          }))
          .filter((g) => g.label);

        // Fallback ke semua asset group dari tabel it_asset_groups (tetap dari API, bukan hardcoded)
        if (options.length === 0) {
          const allResponse = await fetchAssetGroups(null, null, null);
          const allData = Array.isArray(allResponse?.data) ? allResponse.data : [];
          options = allData
            .map((g) => ({
              value: g.asset_group_id || g.asset_group_name,
              label: g.asset_group_name,
              asset_group_id: g.asset_group_id || '',
            }))
            .filter((g) => g.label);
        }

        setAssetGroupOptions(options);

        if (formData.asset_group_id && options.length > 0 && !formData.assetGroup) {
          const selectedById = options.find(
            (opt) => String(opt.asset_group_id || '') === String(formData.asset_group_id || '')
          );
          if (selectedById?.label) {
            setFormData((prev) => ({
              ...prev,
              assetGroup: selectedById.label,
            }));
          }
        }

        if (!formData.asset_group_id && formData.assetGroup && options.length > 0) {
          const matchedOption = options.find(
            (opt) => String(opt.label).toLowerCase() === String(formData.assetGroup).toLowerCase()
          );
          if (matchedOption?.asset_group_id) {
            setFormData((prev) => ({
              ...prev,
              asset_group_id: matchedOption.asset_group_id,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load asset groups:', error);
        setAssetGroupOptions([]);
      }
    };

    fetchAssetGroupOptions();
  }, [show, formData.sub_category_id, formData.assetGroup, formData.asset_group_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchase_price_actual') {
      const numberValue = value.replace(/[^0-9]/g, '');
      setPriceDisplay(formatRupiah(numberValue));
      setFormData((prev) => ({ ...prev, [name]: numberValue }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'noAsset' || name === 'hostname' ? value.toUpperCase() : value,
      }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption?.value || '';
    const label = selectedOption?.label || '';

    if (name === 'asset_main_type_id') {
      setFormData((prev) => ({
        ...prev,
        asset_main_type_id: value,
        asset_main_type_name: label,
        category: '',
        category_id: '',
        sub_category: '',
        sub_category_id: '',
        classification_id: '',
        assetGroup: '',
        asset_group_id: '',
      }));
      setCategoryOptionsApi([]);
      setSubCategoryOptionsApi([]);
      setClassificationOptions([]);
      setAssetGroupOptions([]);
      return;
    }

    if (name === 'category') {
      setFormData((prev) => ({
        ...prev,
        category: label || value,
        category_id: selectedOption?.category_id || '',
        sub_category: '',
        sub_category_id: '',
        classification_id: '',
        assetGroup: '',
        asset_group_id: '',
      }));
      setClassificationOptions([]);
    } else if (name === 'sub_category') {
      setFormData((prev) => ({
        ...prev,
        sub_category: label || value,
        sub_category_id: selectedOption?.sub_category_id || '',
        classification_id: '',
        assetGroup: '',
        asset_group_id: '',
      }));
      setClassificationOptions([]);
    } else if (name === 'assetGroup') {
      setFormData((prev) => ({
        ...prev,
        assetGroup: selectedOption?.label || value,
        asset_group_id: selectedOption?.asset_group_id || '',
      }));
    } else if (name === 'nik') {
      const selectedKaryawan = karyawanList.find((k) => k.nik === value);
      setFormData((prev) => ({
        ...prev,
        nik: value,
        dept: selectedKaryawan?.dept || '',
        divisi: selectedKaryawan?.divisi || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type !== 'application/pdf') {
        alertWarning('Hanya file PDF yang diperbolehkan');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alertWarning('Ukuran file maksimal 10MB');
        return;
      }
      setAttachments((prev) => [...prev, file]);
    });
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.noAsset ||
      !formData.nama ||
      !formData.asset_main_type_id ||
      !formData.category ||
      !formData.sub_category
    ) {
      alertWarning('No. Aset, Nama, Main Type, Kategori, dan Sub Kategori wajib diisi.');
      return;
    }
    if (formData.sub_category?.toLowerCase() === 'pc' && !formData.classification_id) {
      alertWarning('Classification wajib diisi untuk sub kategori PC.');
      return;
    }
    setSaving(true);
    try {
      if (onSave && asset) {
        // Kirim originalNoAsset untuk backend agar bisa mencari data asli
        const originalNoAsset = asset.noAsset;
        const updatedAsset = {
          ...asset,
          ...formData,
          originalNoAsset, // Simpan No. Asset asli untuk query backend
        };
        await onSave(updatedAsset, attachments);
        onHide();
      }
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!doc?.document_id) {
      alertError('ID dokumen tidak valid');
      return;
    }
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus dokumen "${doc.original_name || doc.file_name}"?`
    );
    if (!confirmDelete) return;
    setDeletingDocId(doc.document_id);
    try {
      await deleteAssetDocument(formData.noAsset, doc.document_id);
      alertSuccess('Dokumen berhasil dihapus');
      setExistingDocuments((prev) => prev.filter((d) => d.document_id !== doc.document_id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alertError(error.message || 'Gagal menghapus dokumen');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handlePreviewDocument = async (doc) => {
    if (!doc?.file_url) {
      alertError('URL dokumen tidak valid');
      return;
    }

    try {
      const resolvedFileUrl = resolveDocumentUrl(doc.file_url);
      // Fetch PDF sebagai blob dengan credentials untuk menyertakan cookie autentikasi
      const response = await fetch(resolvedFileUrl, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Gagal memuat dokumen');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setPreviewDoc({
        ...doc,
        file_url: resolvedFileUrl,
        blobUrl: objectUrl,
      });
    } catch (error) {
      console.error('Error loading PDF:', error);
      alertError('Gagal memuat dokumen PDF. Silakan coba lagi.');
    }
  };

  const closePreview = () => {
    if (previewDoc?.blobUrl) {
      URL.revokeObjectURL(previewDoc.blobUrl);
    }
    setPreviewDoc(null);
  };

  return (
    <Modal show={show} onHide={onHide} size='xl' centered backdrop='static'>
      <Modal.Header closeButton closeVariant='white' className='bg-primary text-white py-3'>
        <Modal.Title className='d-flex align-items-center gap-2 mb-0'>
          <FaDesktop className='text-white' />
          <span className='text-white'>Update Aset</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }} className='p-4'>
        <Form>
          {/* Section 1: Informasi Dasar */}
          <Card className='mb-4 border-0 shadow-sm'>
            <Card.Body>
              <SectionHeader icon={FaServer} title='Informasi Dasar' />
              <Row className='g-3'>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      No. Asset <span className='text-danger'>*</span>
                    </Form.Label>
                    <Form.Control
                      ref={firstInputRef}
                      type='text'
                      name='noAsset'
                      value={formData.noAsset}
                      onChange={handleChange}
                      placeholder='Contoh: AST-001'
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Nama Aset <span className='text-danger'>*</span>
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='nama'
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder='Contoh: Laptop Dell XPS 15'
                    />
                  </Form.Group>
                </Col>

                {/* Category - Hierarchy Level 2 */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Main Type <span className='text-danger'>*</span>
                    </Form.Label>
                    <Select
                      options={mainTypeOptions}
                      value={
                        mainTypeOptions.find(
                          (o) => String(o.value) === String(formData.asset_main_type_id || '')
                        ) || null
                      }
                      onChange={(opt) => handleSelectChange('asset_main_type_id', opt)}
                      placeholder={mainTypeOptions.length === 0 ? 'Loading...' : 'Pilih Main Type'}
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Kategori <span className='text-danger'>*</span>
                    </Form.Label>
                    <Select
                      options={effectiveCategoryOptions}
                      value={
                        effectiveCategoryOptions.find(
                          (o) =>
                            String(o.category_id || o.value || '') ===
                            String(formData.category_id || '')
                        ) ||
                        effectiveCategoryOptions.find(
                          (o) =>
                            String(o.label || '').toLowerCase() ===
                            String(formData.category || '').toLowerCase()
                        ) ||
                        null
                      }
                      onChange={(opt) => handleSelectChange('category', opt)}
                      placeholder={
                        !formData.asset_main_type_id
                          ? 'Pilih Main Type dulu'
                          : effectiveCategoryOptions.length === 0
                            ? 'Loading...'
                            : 'Pilih Kategori'
                      }
                      isDisabled={
                        !formData.asset_main_type_id || effectiveCategoryOptions.length === 0
                      }
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>

                {/* Sub Category - Hierarchy Level 3 */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Sub Kategori</Form.Label>
                    <Select
                      options={effectiveSubCategoryOptions}
                      value={
                        effectiveSubCategoryOptions.find(
                          (o) =>
                            String(o.sub_category_id || o.value || '') ===
                            String(formData.sub_category_id || '')
                        ) ||
                        effectiveSubCategoryOptions.find(
                          (o) =>
                            String(o.label || '').toLowerCase() ===
                            String(formData.sub_category || '').toLowerCase()
                        ) ||
                        null
                      }
                      onChange={(opt) => handleSelectChange('sub_category', opt)}
                      placeholder={
                        effectiveSubCategoryOptions.length === 0
                          ? loadingSubCategory
                            ? 'Loading...'
                            : 'Tidak ada data'
                          : 'Pilih Sub Kategori'
                      }
                      isDisabled={loadingSubCategory && effectiveSubCategoryOptions.length === 0}
                      isLoading={loadingSubCategory}
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>

                {/* Classification - Hanya untuk PC */}
                {(formData.sub_category?.toLowerCase() === 'pc' || formData.classification_id) && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Classification</Form.Label>
                      <Select
                        options={classificationOptions}
                        value={classificationOptions.find(
                          (o) => o.value === formData.classification_id
                        )}
                        onChange={(opt) => handleSelectChange('classification_id', opt)}
                        placeholder={loadingClassification ? 'Loading...' : 'Pilih Classification'}
                        isLoading={loadingClassification}
                        styles={customSelectStyles}
                      />
                    </Form.Group>
                  </Col>
                )}

                {/* Asset Group - Hierarchy Level 4 - Sekarang Optional */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Asset Group</Form.Label>
                    <Select
                      options={assetGroupOptions}
                      value={
                        assetGroupOptions.find(
                          (o) =>
                            String(o.asset_group_id || '') === String(formData.asset_group_id || '')
                        ) ||
                        assetGroupOptions.find(
                          (o) =>
                            String(o.label || '').toLowerCase() ===
                            String(formData.assetGroup || '').toLowerCase()
                        ) ||
                        null
                      }
                      onChange={(opt) => handleSelectChange('assetGroup', opt)}
                      placeholder='Pilih Asset Group'
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Status</Form.Label>
                    <Select
                      options={defaultStatusOptions}
                      value={defaultStatusOptions.find((o) => o.value === formData.status)}
                      onChange={(opt) => handleSelectChange('status', opt)}
                      placeholder='Pilih Status'
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 2: Informasi Pemegang */}
          <Card className='mb-4 border-0 shadow-sm'>
            <Card.Body>
              <SectionHeader icon={FaUser} title='Informasi Pemegang' />
              <Row className='g-3'>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>NIK Pemegang</Form.Label>
                    <Select
                      options={karyawanOptions}
                      value={karyawanOptions.find((o) => o.value === formData.nik)}
                      onChange={(opt) => handleSelectChange('nik', opt)}
                      placeholder={loadingKaryawan ? 'Loading...' : 'Cari Karyawan (NIK/Nama)'}
                      isLoading={loadingKaryawan}
                      isSearchable
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Departemen</Form.Label>
                    <Form.Control
                      type='text'
                      name='dept'
                      value={formData.dept || 'Unassigned'}
                      placeholder='NIK tidak assigned atau data HRGA tidak tersedia'
                      readOnly
                      className={`bg-light ${!formData.dept ? 'border-warning' : 'border-success'}`}
                      title={
                        !formData.dept
                          ? 'Debug info akan muncul di Console (F12). Pastikan asset punya active assignment dan NIK valid di HRGA DB.'
                          : 'Departemen dari HRGA DB via NIK'
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 3: Spesifikasi & Pembelian */}
          <Card className='mb-4 border-0 shadow-sm'>
            <Card.Body>
              <SectionHeader icon={FaCalendarAlt} title='Spesifikasi Teknis & Pembelian' />
              <Row className='g-3'>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hostname</Form.Label>
                    <Form.Control
                      type='text'
                      name='hostname'
                      value={formData.hostname}
                      onChange={handleChange}
                      placeholder='Contoh: DELL-XPS-001'
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tahun Pembelian</Form.Label>
                    <Form.Control
                      type='number'
                      name='tahunBeli'
                      value={formData.tahunBeli}
                      onChange={handleChange}
                      placeholder='Contoh: 2024'
                      min='1900'
                      max='2100'
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>No. PO</Form.Label>
                    <Form.Control
                      type='text'
                      name='po_number'
                      value={formData.po_number}
                      onChange={handleChange}
                      placeholder='Contoh: PO-2024-001'
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>No. Invoice</Form.Label>
                    <Form.Control
                      type='text'
                      name='invoice_number'
                      value={formData.invoice_number}
                      onChange={handleChange}
                      placeholder='Contoh: INV-2024-001'
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Harga Pembelian</Form.Label>
                    <Form.Control
                      type='text'
                      name='purchase_price_actual'
                      value={priceDisplay}
                      onChange={handleChange}
                      placeholder='Rp 0'
                    />
                  </Form.Group>
                </Col>
                {/* NEW FIELDS for AssetTable */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      type='text'
                      name='type'
                      value={formData.type || ''}
                      onChange={handleChange}
                      placeholder='Contoh: Laptop/Server'
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tahun Depreciation</Form.Label>
                    <Form.Control
                      type='number'
                      name='tahunDepreciation'
                      value={formData.tahunDepreciation || ''}
                      onChange={handleChange}
                      placeholder='Contoh: 2028'
                      min='1900'
                      max='2100'
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>IP Address Main</Form.Label>
                    <Form.Control
                      type='text'
                      name='mainIpAdress'
                      value={formData.mainIpAdress || ''}
                      onChange={handleChange}
                      placeholder='192.168.1.100'
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>IP Address Backup</Form.Label>
                    <Form.Control
                      type='text'
                      name='backupIpAdress'
                      value={formData.backupIpAdress || ''}
                      onChange={handleChange}
                      placeholder='192.168.1.101'
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section 4: Dokumen - TIDAK DIUBAH sesuai request */}
          <Card className='mb-3 border-0 shadow-sm'>
            <Card.Body>
              <SectionHeader icon={FaFileAlt} title='Dokumen & Lampiran' />
              <Form.Group>
                <Form.Label>Lampiran PDF (Filing Dokumen)</Form.Label>
                <Form.Control
                  type='file'
                  accept='application/pdf'
                  multiple
                  onChange={handleFileChange}
                  className='mb-3'
                />
                {existingDocuments.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-muted small mb-1'>Dokumen tersimpan:</p>
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={`existing-${index}`}
                        className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'
                      >
                        <div className='d-flex align-items-center'>
                          <FaFilePdf className='text-danger me-2' />
                          <span
                            className='text-primary small text-truncate'
                            style={{ maxWidth: '200px' }}
                          >
                            {doc.original_name || doc.file_name || `Dokumen ${index + 1}`}
                          </span>
                        </div>
                        <div className='d-flex align-items-center gap-1'>
                          <Button
                            variant='link'
                            size='sm'
                            className='text-info p-0 me-1'
                            onClick={() => handlePreviewDocument(doc)}
                            title='Lihat PDF'
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant='link'
                            size='sm'
                            className='text-danger p-0'
                            onClick={() => handleDeleteDocument(doc)}
                            disabled={deletingDocId === doc.document_id}
                            title='Hapus Dokumen'
                          >
                            {deletingDocId === doc.document_id ? (
                              <Spinner animation='border' size='sm' />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-muted small mb-1'>File baru:</p>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'
                      >
                        <span className='text-success d-flex align-items-center gap-2'>
                          <FaPaperclip />
                          <span
                            className='text-truncate'
                            style={{ maxWidth: '300px' }}
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <span className='text-muted small'>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </span>
                        <Button
                          variant='link'
                          size='sm'
                          className='text-danger p-0 ms-2'
                          onClick={() => removeAttachment(index)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Form.Text className='text-muted d-block'>
                  Max ukuran file 10MB per file. Format: PDF
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>

      <Modal.Footer className='bg-light py-3' style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button variant='secondary' onClick={onHide} disabled={saving} className='px-4'>
          <FaTimes className='me-1' /> Batal
        </Button>
        <Button variant='primary' onClick={handleSubmit} disabled={saving} className='px-4'>
          {saving ? (
            <>
              <Spinner animation='border' size='sm' className='me-1' /> Menyimpan...
            </>
          ) : (
            <>
              <FaSave className='me-1' /> Simpan
            </>
          )}
        </Button>
      </Modal.Footer>

      <PdfPreviewModal show={!!previewDoc} onHide={closePreview} document={previewDoc} />
    </Modal>
  );
}

function PdfPreviewModal({ show, onHide, document }) {
  if (!document) return null;

  // Gunakan blobUrl jika ada, fallback ke file_url
  const fileUrl = document.blobUrl || resolveDocumentUrl(document.file_url);
  const fileName = document.original_name || document.file_name || 'Dokumen.pdf';

  const handleOpenInNewTab = () => {
    if (document.blobUrl) {
      // Untuk blob URL, buka langsung
      window.open(document.blobUrl, '_blank');
    } else {
      // Untuk URL normal, gunakan fetch dengan credentials
      const resolvedFileUrl = resolveDocumentUrl(document.file_url);
      fetch(resolvedFileUrl, { credentials: 'include' })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        })
        .catch((err) => {
          console.error('Error opening PDF:', err);
          window.open(resolvedFileUrl, '_blank');
        });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='xl' centered>
      <Modal.Header closeButton className='bg-dark text-white'>
        <Modal.Title className='d-flex align-items-center gap-2'>
          <FaFilePdf className='text-danger' />
          <span className='text-white'>{fileName}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, height: '80vh' }}>
        <iframe
          src={fileUrl}
          title={fileName}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          <FaTimes className='me-1' /> Tutup
        </Button>
        <Button variant='primary' onClick={handleOpenInNewTab}>
          <FaEye className='me-1' /> Buka di Tab Baru
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
