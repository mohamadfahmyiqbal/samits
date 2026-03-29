import React, { useState, useEffect } from 'react';
import { Form, Card, Button, Steps, Row, Col, Select, Input, Upload, message, Modal, Alert } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './FormPengajuanAset.css';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

export default function FormPengajuanAset() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [formData, setFormData] = useState({});

  const steps = [
    {
      title: 'Informasi Dasar',
      description: 'Data pengajuan aset'
    },
    {
      title: 'Detail Aset',
      description: 'Spesifikasi aset'
    },
    {
      title: 'Justifikasi',
      description: 'Alasan pengajuan'
    },
    {
      title: 'Konfirmasi',
      description: 'Review & submit'
    }
  ];

  useEffect(() => {
    // Mock data - replace with API calls
    setCategories([
      { id: 1, name: 'Laptop' },
      { id: 2, name: 'Monitor' },
      { id: 3, name: 'Printer' },
      { id: 4, name: 'Server' }
    ]);
    
    setVendors([
      { id: 1, name: 'Dell' },
      { id: 2, name: 'HP' },
      { id: 3, name: 'Lenovo' },
      { id: 4, name: 'Apple' }
    ]);
    
    setLocations([
      { id: 1, name: 'Jakarta' },
      { id: 2, name: 'Surabaya' },
      { id: 3, name: 'Bandung' }
    ]);
  }, []);

  const nextStep = () => {
    form.validateFields().then(values => {
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    }).catch(err => {
      message.error('Mohon lengkapi semua field yang wajib diisi');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const allValues = { ...formData, ...(await form.validateFields()) };
      
      // API call to submit asset request

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Pengajuan aset berhasil dikirim!');
      form.resetFields();
      setCurrentStep(0);
      setFormData({});
      setFileList([]);
      
    } catch (error) {
      message.error('Gagal mengirim pengajuan aset');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item
                  controlId="request_type"
                  label="Tipe Pengajuan"
                  rules={[{ required: true, message: 'Pilih tipe pengajuan!' }]}
                >
                  <Select placeholder="Pilih tipe pengajuan">
                    <Option value="new">Aset Baru</Option>
                    <Option value="replacement">Penggantian</Option>
                    <Option value="upgrade">Upgrade</Option>
                  </Select>
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="priority"
                  label="Prioritas"
                  rules={[{ required: true, message: 'Pilih prioritas!' }]}
                >
                  <Select placeholder="Pilih prioritas">
                    <Option value="low">Rendah</Option>
                    <Option value="medium">Sedang</Option>
                    <Option value="high">Tinggi</Option>
                    <Option value="urgent">Segera</Option>
                  </Select>
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="category_id"
                  label="Kategori Aset"
                  rules={[{ required: true, message: 'Pilih kategori aset!' }]}
                >
                  <Select placeholder="Pilih kategori">
                    {categories.map(cat => (
                      <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                    ))}
                  </Select>
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="quantity"
                  label="Jumlah"
                  rules={[{ required: true, message: 'Masukkan jumlah!' }]}
                >
                  <Input type="number" min="1" placeholder="Jumlah aset" />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="location_id"
                  label="Lokasi Penggunaan"
                  rules={[{ required: true, message: 'Pilih lokasi!' }]}
                >
                  <Select placeholder="Pilih lokasi">
                    {locations.map(loc => (
                      <Option key={loc.id} value={loc.id}>{loc.name}</Option>
                    ))}
                  </Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item
                  controlId="preferred_vendor_id"
                  label="Vendor Pilihan (Opsional)"
                >
                  <Select placeholder="Pilih vendor" allowClear>
                    {vendors.map(vendor => (
                      <Option key={vendor.id} value={vendor.id}>{vendor.name}</Option>
                    ))}
                  </Select>
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="budget_estimate"
                  label="Estimasi Anggaran"
                >
                  <Input placeholder="Contoh: 15000000" />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="specifications"
                  label="Spesifikasi yang Dibutuhkan"
                  rules={[{ required: true, message: 'Deskripsikan spesifikasi yang dibutuhkan!' }]}
                >
                  <TextArea rows={4} placeholder="Contoh: Processor Intel i7, RAM 16GB, SSD 512GB, etc..." />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="preferred_brand"
                  label="Merek Pilihan (Opsional)"
                >
                  <Input placeholder="Contoh: Dell, HP, Lenovo" />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="delivery_date"
                  label="Tanggal Dibutuhkan"
                  rules={[{ required: true, message: 'Pilih tanggal dibutuhkan!' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Pilih tanggal" />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form as="form".Item
                  controlId="justification"
                  label="Justifikasi Pengajuan"
                  rules={[{ required: true, message: 'Jelaskan alasan pengajuan!' }]}
                >
                  <TextArea rows={4} placeholder="Jelaskan mengapa aset ini dibutuhkan..." />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="business_impact"
                  label="Dampak terhadap Bisnis"
                  rules={[{ required: true, message: 'Jelaskan dampak bisnis!' }]}
                >
                  <TextArea rows={3} placeholder="Jelaskan dampak jika aset tidak disetujui..." />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="alternative_solution"
                  label="Solusi Alternatif (Opsional)"
                >
                  <TextArea rows={3} placeholder="Apakah ada solusi alternatif lainnya?" />
                </Form.Group>
              </Col>
              <Col span={24}>
                <Form as="form".Item
                  controlId="attachments"
                  label="Lampiran (Opsional)"
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Lampiran</Button>
                  </Upload>
                  <small>Format: PDF, DOC, DOCX (Max: 5MB)</small>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <Alert
              message="Review Pengajuan Aset"
              description="Mohon periksa kembali data pengajuan Anda sebelum mengirim"
              type="info"
              style={{ marginBottom: 24 }}
            />
            
            <Card title="Ringkasan Pengajuan" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p><strong>Tipe Pengajuan:</strong> {formData.request_type}</p>
                  <p><strong>Prioritas:</strong> {formData.priority}</p>
                  <p><strong>Kategori:</strong> {categories.find(c => c.id === formData.category_id)?.name}</p>
                  <p><strong>Jumlah:</strong> {formData.quantity}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Lokasi:</strong> {locations.find(l => l.id === formData.location_id)?.name}</p>
                  <p><strong>Vendor:</strong> {vendors.find(v => v.id === formData.preferred_vendor_id)?.name || 'Tidak ada'}</p>
                  <p><strong>Estimasi Anggaran:</strong> {formData.budget_estimate}</p>
                  <p><strong>Tanggal Dibutuhkan:</strong> {formData.delivery_date}</p>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <p><strong>Spesifikasi:</strong></p>
                  <p>{formData.specifications}</p>
                </Col>
                <Col span={24}>
                  <p><strong>Justifikasi:</strong></p>
                  <p>{formData.justification}</p>
                </Col>
              </Row>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="form-pengajuan-aset">
      <div className="form-header">
        <h1>Form Pengajuan Aset</h1>
        <p>Ajukan kebutuhan aset baru atau penggantian</p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} />
        
        <Form as="form" form={form} layout="vertical" className="form-steps">
          {renderStepContent()}
          
          <div className="form-actions">
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
                Sebelumnya
              </Button>
            )}
            
            {currentStep < steps.length - 1 && (
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={nextStep}>
                Selanjutnya
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <>
                <Button onClick={handlePreview}>
                  Preview
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Kirim Pengajuan
                </Button>
              </>
            )}
          </div>
        </Form>
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Preview Pengajuan Aset"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowPreviewModal(false)}>
            Tutup
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            Kirim Pengajuan
          </Button>
        ]}
        width={800}
      >
        <div className="preview-content">
          {/* Preview content similar to step 3 */}
          <h3>Ringkasan Pengajuan Aset</h3>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <p><strong>Tipe Pengajuan:</strong> {formData.request_type}</p>
              <p><strong>Prioritas:</strong> {formData.priority}</p>
              <p><strong>Kategori:</strong> {categories.find(c => c.id === formData.category_id)?.name}</p>
              <p><strong>Jumlah:</strong> {formData.quantity}</p>
            </Col>
            <Col span={12}>
              <p><strong>Lokasi:</strong> {locations.find(l => l.id === formData.location_id)?.name}</p>
              <p><strong>Vendor:</strong> {vendors.find(v => v.id === formData.preferred_vendor_id)?.name || 'Tidak ada'}</p>
              <p><strong>Estimasi Anggaran:</strong> {formData.budget_estimate}</p>
              <p><strong>Tanggal Dibutuhkan:</strong> {formData.delivery_date}</p>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
}
