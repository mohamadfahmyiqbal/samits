import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Steps, Row, Col, Select, Input, DatePicker, Table, message, Modal, Alert, Tag } from 'antd';
import { UserOutlined, SearchOutlined, SwapOutlined, SaveOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './PergantianPengguna.css';

const { Step } = Steps;
const { Option } = Select;

export default function PergantianPengguna() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [newUser, setNewUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferData, setTransferData] = useState({});

  const steps = [
    {
      title: 'Pilih Aset',
      description: 'Cari dan pilih aset yang akan dipindahkan'
    },
    {
      title: 'Identifikasi Pengguna',
      description: 'Verifikasi pengguna baru'
    },
    {
      title: 'Konfirmasi',
      description: 'Review & konfirmasi perpindahan'
    }
  ];

  useEffect(() => {
    // Mock assets data
    setSearchResults([
      {
        id: 1,
        asset_name: 'Laptop Dell XPS 15',
        asset_tag: 'LT-001',
        serial_number: 'DLX15-12345',
        category: 'Laptop',
        current_user: 'John Doe',
        current_user_nik: '12345',
        location: 'Jakarta',
        status: 'active'
      },
      {
        id: 2,
        asset_name: 'Monitor LG 27 inch',
        asset_tag: 'MN-001',
        serial_number: 'LG27-67890',
        category: 'Monitor',
        current_user: 'Jane Smith',
        current_user_nik: '67890',
        location: 'Surabaya',
        status: 'active'
      }
    ]);
  }, []);

  const handleSearchAsset = (value) => {
    // Mock search - replace with API call
    if (!value) {
      setSearchResults([
        {
          id: 1,
          asset_name: 'Laptop Dell XPS 15',
          asset_tag: 'LT-001',
          serial_number: 'DLX15-12345',
          category: 'Laptop',
          current_user: 'John Doe',
          current_user_nik: '12345',
          location: 'Jakarta',
          status: 'active'
        }
      ]);
    } else {
      const filtered = searchResults.filter(asset => 
        asset.asset_name.toLowerCase().includes(value.toLowerCase()) ||
        asset.asset_tag.toLowerCase().includes(value.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleSearchUser = (value) => {
    // Mock user search - replace with API call
    if (value && value.length >= 3) {
      setUserSearchResults([
        {
          nik: '54321',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          department: 'IT',
          position: 'Software Engineer'
        },
        {
          nik: '98765',
          name: 'Bob Wilson',
          email: 'bob@company.com',
          department: 'HR',
          position: 'HR Manager'
        }
      ]);
    } else {
      setUserSearchResults([]);
    }
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    form.setFieldsValue({
      asset_id: asset.id,
      asset_name: asset.asset_name,
      current_user: asset.current_user,
      current_user_nik: asset.current_user_nik
    });
  };

  const handleSelectUser = (user) => {
    setNewUser(user);
    form.setFieldsValue({
      new_user_nik: user.nik,
      new_user_name: user.name,
      new_user_department: user.department,
      new_user_position: user.position
    });
  };

  const nextStep = () => {
    if (currentStep === 0 && !selectedAsset) {
      message.error('Pilih aset terlebih dahulu');
      return;
    }
    if (currentStep === 1 && !newUser) {
      message.error('Pilih pengguna baru terlebih dahulu');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const transferInfo = {
        asset_id: selectedAsset.id,
        old_user_nik: selectedAsset.current_user_nik,
        new_user_nik: newUser.nik,
        transfer_date: new Date(),
        reason: form.getFieldValue('reason'),
        notes: form.getFieldValue('notes')
      };

      // API call to process user transfer
      console.log('Processing user transfer:', transferInfo);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Pergantian pengguna berhasil diproses!');
      form.resetFields();
      setCurrentStep(0);
      setSelectedAsset(null);
      setNewUser(null);
      setUserSearchResults([]);
      
    } catch (error) {
      message.error('Gagal memproses pergantian pengguna');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const assetColumns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Nama Aset',
      dataIndex: 'asset_name',
      key: 'asset_name'
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number'
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Pengguna Saat Ini',
      dataIndex: 'current_user',
      key: 'current_user'
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleSelectAsset(record)}
          disabled={selectedAsset?.id === record.id}
        >
          {selectedAsset?.id === record.id ? 'Terpilih' : 'Pilih'}
        </Button>
      )
    }
  ];

  const userColumns = [
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Departemen',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Posisi',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleSelectUser(record)}
          disabled={newUser?.nik === record.nik}
        >
          {newUser?.nik === record.nik ? 'Terpilih' : 'Pilih'}
        </Button>
      )
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Alert
              message="Pilih Aset yang Akan Dipindahkan"
              description="Cari aset berdasarkan nama, asset tag, atau serial number"
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            <div className="search-section">
              <Input.Search
                placeholder="Cari aset (nama, asset tag, serial number)"
                onSearch={handleSearchAsset}
                onChange={(e) => handleSearchAsset(e.target.value)}
                style={{ marginBottom: 16 }}
              />
            </div>

            {selectedAsset && (
              <Alert
                message={`Aset terpilih: ${selectedAsset.asset_name} (${selectedAsset.asset_tag})`}
                type="success"
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              columns={assetColumns}
              dataSource={searchResults}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Alert
              message="Identifikasi Pengguna Baru"
              description="Masukkan NIK atau nama pengguna baru yang akan menerima aset"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <div className="user-search-section">
              <Input.Search
                placeholder="Cari pengguna (minimal 3 karakter)"
                onSearch={handleSearchUser}
                onChange={(e) => handleSearchUser(e.target.value)}
                style={{ marginBottom: 16 }}
              />
            </div>

            {selectedAsset && (
              <Card title="Detail Aset yang Akan Dipindahkan" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Nama Aset:</strong> {selectedAsset.asset_name}</p>
                    <p><strong>Asset Tag:</strong> {selectedAsset.asset_tag}</p>
                    <p><strong>Serial Number:</strong> {selectedAsset.serial_number}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Pengguna Saat Ini:</strong> {selectedAsset.current_user}</p>
                    <p><strong>NIK:</strong> {selectedAsset.current_user_nik}</p>
                    <p><strong>Lokasi:</strong> {selectedAsset.location}</p>
                  </Col>
                </Row>
              </Card>
            )}

            {newUser && (
              <Alert
                message={`Pengguna baru terpilih: ${newUser.name} (${newUser.nik})`}
                type="success"
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              columns={userColumns}
              dataSource={userSearchResults}
              rowKey="nik"
              pagination={{ pageSize: 10 }}
              size="small"
            />

            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item
                name="reason"
                label="Alasan Pergantian"
                rules={[{ required: true, message: 'Masukkan alasan pergantian!' }]}
              >
                <Input.TextArea rows={3} placeholder="Jelaskan alasan pergantian pengguna..." />
              </Form.Item>
            </Form>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Alert
              message="Konfirmasi Pergantian Pengguna"
              description="Mohon periksa kembali detail pergantian pengguna"
              type="warning"
              style={{ marginBottom: 24 }}
            />

            <Card title="Ringkasan Pergantian" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <h4>Detail Aset</h4>
                  <p><strong>Nama Aset:</strong> {selectedAsset?.asset_name}</p>
                  <p><strong>Asset Tag:</strong> {selectedAsset?.asset_tag}</p>
                  <p><strong>Serial Number:</strong> {selectedAsset?.serial_number}</p>
                  <p><strong>Kategori:</strong> {selectedAsset?.category}</p>
                </Col>
                <Col span={12}>
                  <h4>Informasi Pergantian</h4>
                  <p><strong>Dari:</strong> {selectedAsset?.current_user} ({selectedAsset?.current_user_nik})</p>
                  <p><strong>Ke:</strong> {newUser?.name} ({newUser?.nik})</p>
                  <p><strong>Departemen:</strong> {newUser?.department}</p>
                  <p><strong>Posisi:</strong> {newUser?.position}</p>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <h4>Alasan Pergantian</h4>
                  <p>{form.getFieldValue('reason')}</p>
                </Col>
              </Row>
            </Card>

            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item
                name="notes"
                label="Catatan Tambahan (Opsional)"
              >
                <Input.TextArea rows={3} placeholder="Catatan tambahan jika diperlukan..." />
              </Form.Item>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pergantian-pengguna">
      <div className="form-header">
        <h1>Pergantian Pengguna Aset</h1>
        <p>Proses perpindahan aset dari pengguna lama ke pengguna baru</p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} />
        
        <div className="form-steps">
          {renderStepContent()}
        </div>
        
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
            <Button 
              type="primary" 
              icon={<SwapOutlined />} 
              onClick={() => setShowConfirmModal(true)}
              loading={loading}
            >
              Proses Pergantian
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title="Konfirmasi Pergantian Pengguna"
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowConfirmModal(false)}>
            Batal
          </Button>,
          <Button key="confirm" type="primary" onClick={handleSubmit} loading={loading}>
            Konfirmasi & Proses
          </Button>
        ]}
      >
        <Alert
          message="Apakah Anda yakin ingin memproses pergantian pengguna?"
          description="Tindakan ini akan memindahkan kepemilikan aset dan mencatat riwayat perubahan."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <p><strong>Aset:</strong> {selectedAsset?.asset_name}</p>
        <p><strong>Dari:</strong> {selectedAsset?.current_user}</p>
        <p><strong>Ke:</strong> {newUser?.name}</p>
      </Modal>
    </div>
  );
}
