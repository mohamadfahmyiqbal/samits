import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Steps,
  Radio,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  LaptopOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

export default function AssetBaru() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('hardware');

  const { selectedAsset, action } = location.state || {};

  const steps = [
    { title: 'Informasi Dasar', icon: <LaptopOutlined /> },
    { title: 'Detail Aset', icon: <SaveOutlined /> },
    { title: 'Konfirmasi', icon: <CheckCircleOutlined /> },
  ];

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Lengkapi data yang diperlukan!');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      message.success('Aset berhasil dibuat!');

      // Navigate to FormPengajuanAset
      navigate('/form-pengajuan-aset', {
        state: {
          asset_data: values,
          is_new_asset: true,
        },
      });
    } catch (error) {
      message.error('Gagal membuat aset');
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 1: Informasi Dasar
    <Form layout='vertical' form={form} key='step1'>
      <Form.Item
        name='asset_type'
        label='Tipe Aset'
        initialValue={assetType}
        rules={[{ required: true }]}
      >
        <Radio.Group onChange={(e) => setAssetType(e.target.value)}>
          <Radio.Button value='hardware'>Hardware</Radio.Button>
          <Radio.Button value='software'>Software</Radio.Button>
          <Radio.Button value='infrastructure'>Infrastructure</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name='asset_name'
            label='Nama Aset'
            rules={[{ required: true, message: 'Masukkan nama aset!' }]}
          >
            <Input placeholder='Contoh: Laptop Dell XPS 15' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='asset_code'
            label='Kode Aset'
            rules={[{ required: true, message: 'Masukkan kode aset!' }]}
          >
            <Input placeholder='Contoh: AST-2024-001' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name='category' label='Kategori' rules={[{ required: true }]}>
            <Select placeholder='Pilih kategori'>
              <Option value='laptop'>Laptop</Option>
              <Option value='desktop'>Desktop</Option>
              <Option value='server'>Server</Option>
              <Option value='printer'>Printer</Option>
              <Option value='network'>Network Equipment</Option>
              <Option value='storage'>Storage</Option>
              <Option value='software'>Software</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='department' label='Departemen' rules={[{ required: true }]}>
            <Select placeholder='Pilih departemen'>
              <Option value='it'>IT</Option>
              <Option value='hr'>HR</Option>
              <Option value='finance'>Finance</Option>
              <Option value='operations'>Operations</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>,

    // Step 2: Detail Aset
    <Form layout='vertical' form={form} key='step2'>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name='brand' label='Brand/Merek' rules={[{ required: true }]}>
            <Input placeholder='Contoh: Dell' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='model' label='Model' rules={[{ required: true }]}>
            <Input placeholder='Contoh: XPS 15 9520' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name='serial_number' label='Serial Number'>
            <Input placeholder='Serial number aset' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='purchase_date' label='Tanggal Pembelian'>
            <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name='warranty_period' label='Masa Garansi (bulan)'>
            <Input type='number' placeholder='Contoh: 24' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='location' label='Lokasi' rules={[{ required: true }]}>
            <Input placeholder='Contoh: IT Office - Lantai 2' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='specifications' label='Spesifikasi'>
        <TextArea rows={4} placeholder='Spesifikasi detail aset...' />
      </Form.Item>

      <Form.Item name='notes' label='Catatan'>
        <TextArea rows={2} placeholder='Catatan tambahan...' />
      </Form.Item>
    </Form>,

    // Step 3: Konfirmasi
    <div key='step3' className='confirmation-step'>
      <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <h3 style={{ color: '#52c41a', marginBottom: 16 }}>
          <CheckCircleOutlined /> Review Data Aset
        </h3>
        <p style={{ marginBottom: 24 }}>
          Pastikan data aset sudah benar sebelum melanjutkan ke form pengajuan.
        </p>

        {form.getFieldsValue() && (
          <div className='review-data'>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <strong>Nama Aset:</strong> {form.getFieldValue('asset_name')}
              </Col>
              <Col span={12}>
                <strong>Kode Aset:</strong> {form.getFieldValue('asset_code')}
              </Col>
              <Col span={12}>
                <strong>Kategori:</strong> {form.getFieldValue('category')}
              </Col>
              <Col span={12}>
                <strong>Departemen:</strong> {form.getFieldValue('department')}
              </Col>
              <Col span={12}>
                <strong>Brand:</strong> {form.getFieldValue('brand')}
              </Col>
              <Col span={12}>
                <strong>Model:</strong> {form.getFieldValue('model')}
              </Col>
              <Col span={12}>
                <strong>Lokasi:</strong> {form.getFieldValue('location')}
              </Col>
            </Row>
          </div>
        )}
      </Card>
    </div>,
  ];

  return (
    <div className='asset-baru'>
      <div className='page-header'>
        <h1>Buat Aset Baru</h1>
        <p>Isi informasi aset yang akan diajukan</p>
      </div>

      <Card>
        <Steps current={currentStep} className='asset-steps'>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>

        <div className='step-content' style={{ marginTop: 24 }}>
          {stepContent[currentStep]}
        </div>

        <div className='step-actions' style={{ marginTop: 24, textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev} icon={<ArrowLeftOutlined />}>
              Sebelumnya
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button type='primary' onClick={handleNext} icon={<ArrowRightOutlined />}>
              Selanjutnya
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type='primary'
              onClick={handleSubmit}
              loading={loading}
              icon={<ArrowRightOutlined />}
            >
              Lanjut ke Form Pengajuan
            </Button>
          )}
        </div>
      </Card>

      <Button
        style={{ marginTop: 16 }}
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/aset')}
      >
        Kembali ke Pilih Aset
      </Button>
    </div>
  );
}
