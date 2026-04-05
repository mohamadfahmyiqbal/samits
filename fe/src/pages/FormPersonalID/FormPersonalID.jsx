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
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UserOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Step } = Steps;

export default function FormPersonalID() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Pengguna Lama', icon: <UserOutlined /> },
    { title: 'Pengguna Baru', icon: <IdcardOutlined /> },
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

      await new Promise((resolve) => setTimeout(resolve, 1500));

      message.success('Pergantian pengguna berhasil diajukan untuk approval!');

      navigate('/approval-system', {
        state: {
          request_type: 'user_replacement',
          request_data: values,
        },
      });
    } catch (error) {
      message.error('Gagal mengajukan pergantian pengguna');
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 1: Pengguna Lama
    <Form layout='vertical' form={form} key='step1'>
      <Card title='Informasi Pengguna Lama' size='small' style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='old_user_id'
              label='ID Pengguna Lama'
              rules={[{ required: true, message: 'Masukkan ID pengguna!' }]}
            >
              <Input placeholder='Contoh: EMP-001' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='old_user_name' label='Nama Pengguna Lama' rules={[{ required: true }]}>
              <Input placeholder='Nama lengkap' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='old_department' label='Departemen' rules={[{ required: true }]}>
              <Select placeholder='Pilih departemen'>
                <Option value='it'>IT</Option>
                <Option value='hr'>HR</Option>
                <Option value='finance'>Finance</Option>
                <Option value='operations'>Operations</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='old_position' label='Jabatan' rules={[{ required: true }]}>
              <Input placeholder='Jabatan' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name='reason' label='Alasan Pergantian' rules={[{ required: true }]}>
          <Select placeholder='Pilih alasan'>
            <Option value='resign'>Resign</Option>
            <Option value='transfer'>Transfer</Option>
            <Option value='promotion'>Promosi</Option>
            <Option value='mutation'>Mutasi</Option>
            <Option value='other'>Lainnya</Option>
          </Select>
        </Form.Item>

        <Form.Item name='reason_detail' label='Keterangan'>
          <Input.TextArea rows={2} placeholder='Keterangan tambahan...' />
        </Form.Item>
      </Card>
    </Form>,

    // Step 2: Pengguna Baru
    <Form layout='vertical' form={form} key='step2'>
      <Card title='Informasi Pengguna Baru' size='small' style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='new_user_id'
              label='ID Pengguna Baru'
              rules={[{ required: true, message: 'Masukkan ID pengguna baru!' }]}
            >
              <Input placeholder='Contoh: EMP-002' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='new_user_name' label='Nama Pengguna Baru' rules={[{ required: true }]}>
              <Input placeholder='Nama lengkap' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='new_department' label='Departemen' rules={[{ required: true }]}>
              <Select placeholder='Pilih departemen'>
                <Option value='it'>IT</Option>
                <Option value='hr'>HR</Option>
                <Option value='finance'>Finance</Option>
                <Option value='operations'>Operations</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='new_position' label='Jabatan' rules={[{ required: true }]}>
              <Input placeholder='Jabatan' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='new_email' label='Email' rules={[{ required: true, type: 'email' }]}>
              <Input placeholder='email@company.com' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='new_phone' label='No. Telepon'>
              <Input placeholder='Nomor telepon' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name='effective_date' label='Tanggal Efektif' rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal' />
        </Form.Item>
      </Card>
    </Form>,

    // Step 3: Konfirmasi
    <div key='step3' className='confirmation-step'>
      <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <h3 style={{ color: '#52c41a', marginBottom: 16 }}>
          <SwapOutlined /> Review Pergantian Pengguna
        </h3>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card size='small' title='Dari (Pengguna Lama)'>
              <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <p>
                <strong>{form.getFieldValue('old_user_name')}</strong>
              </p>
              <p>ID: {form.getFieldValue('old_user_id')}</p>
              <p>
                {form.getFieldValue('old_department')} - {form.getFieldValue('old_position')}
              </p>
            </Card>
          </Col>
          <Col span={12}>
            <Card size='small' title='Ke (Pengguna Baru)'>
              <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <p>
                <strong>{form.getFieldValue('new_user_name')}</strong>
              </p>
              <p>ID: {form.getFieldValue('new_user_id')}</p>
              <p>
                {form.getFieldValue('new_department')} - {form.getFieldValue('new_position')}
              </p>
            </Card>
          </Col>
        </Row>

        <p>
          <strong>Alasan:</strong> {form.getFieldValue('reason')}
        </p>
        <p>
          <strong>Tanggal Efektif:</strong>{' '}
          {form.getFieldValue('effective_date')?.format?.('YYYY-MM-DD')}
        </p>
      </Card>
    </div>,
  ];

  return (
    <div className='form-personal-id'>
      <div className='page-header'>
        <h1>Form Personal ID - Pergantian Pengguna</h1>
        <p>Isi informasi untuk pergantian pengguna aset</p>
      </div>

      <Card>
        <Steps current={currentStep} className='personal-steps'>
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
              icon={<CheckCircleOutlined />}
            >
              Ajukan untuk Approval
            </Button>
          )}
        </div>
      </Card>

      <Button
        style={{ marginTop: 16 }}
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/pergantian-pengguna')}
      >
        Kembali
      </Button>
    </div>
  );
}
