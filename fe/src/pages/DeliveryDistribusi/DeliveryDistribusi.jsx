import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Steps, Row, Col, Select, Input, DatePicker, Form, message, Modal, Alert, Tag, Progress, Upload } from 'antd';
import { 
  TruckOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';
import './DeliveryDistribusi.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

export default function DeliveryDistribusi() {
  const [form] = Form.useForm();
  const [deliveryData, setDeliveryData] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);

  const deliveryColumns = [
    {
      title: 'Delivery ID',
      dataIndex: 'delivery_id',
      key: 'delivery_id',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id'
    },
    {
      title: 'Nama Aset',
      dataIndex: 'asset_name',
      key: 'asset_name'
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Penerima',
      dataIndex: 'recipient_name',
      key: 'recipient_name'
    },
    {
      title: 'Lokasi',
      dataIndex: 'delivery_location',
      key: 'delivery_location'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'pending': 'orange',
          'in_transit': 'blue',
          'delivered': 'green',
          'distributed': 'success',
          'failed': 'red'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          {record.status !== 'distributed' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleProcessDelivery(record)}
            >
              Proses
            </Button>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    // Mock delivery data
    setDeliveryData([
      {
        id: 1,
        delivery_id: 'DLV-001',
        request_id: 'REQ-001',
        asset_name: 'Laptop Dell XPS 15',
        quantity: 5,
        recipient_name: 'John Doe',
        recipient_nik: '12345',
        delivery_location: 'Jakarta Office',
        status: 'in_transit',
        progress: 60,
        estimated_delivery: '2024-03-26',
        actual_delivery: null,
        notes: 'Deliver to IT Department',
        created_date: '2024-03-25',
        updated_date: '2024-03-25'
      },
      {
        id: 2,
        delivery_id: 'DLV-002',
        request_id: 'REQ-002',
        asset_name: 'Monitor LG 27 inch',
        quantity: 10,
        recipient_name: 'Jane Smith',
        recipient_nik: '67890',
        delivery_location: 'Surabaya Office',
        status: 'pending',
        progress: 25,
        estimated_delivery: '2024-03-27',
        actual_delivery: null,
        notes: 'Deliver to Marketing Department',
        created_date: '2024-03-25',
        updated_date: '2024-03-25'
      },
      {
        id: 3,
        delivery_id: 'DLV-003',
        request_id: 'REQ-003',
        asset_name: 'Printer HP LaserJet',
        quantity: 2,
        recipient_name: 'Bob Wilson',
        recipient_nik: '54321',
        delivery_location: 'Bandung Office',
        status: 'distributed',
        progress: 100,
        estimated_delivery: '2024-03-24',
        actual_delivery: '2024-03-24',
        notes: 'Successfully delivered',
        created_date: '2024-03-23',
        updated_date: '2024-03-24'
      }
    ]);
  }, []);

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  const handleProcessDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowProcessModal(true);
    form.setFieldsValue({
      delivery_status: delivery.status,
      notes: delivery.notes
    });
  };

  const handleUpdateDelivery = async (values) => {
    try {
      setLoading(true);
      
      const updateData = {
        delivery_id: selectedDelivery.delivery_id,
        status: values.delivery_status,
        notes: values.notes,
        actual_delivery: values.actual_delivery,
        delivery_proof: fileList
      };

      // API call to update delivery
      console.log('Updating delivery:', updateData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setDeliveryData(prev => prev.map(item => 
        item.id === selectedDelivery.id 
          ? { 
              ...item, 
              status: values.delivery_status,
              notes: values.notes,
              actual_delivery: values.actual_delivery,
              progress: values.delivery_status === 'distributed' ? 100 : 
                       values.delivery_status === 'in_transit' ? 75 : 25,
              updated_date: new Date().toISOString()
            }
          : item
      ));
      
      message.success('Delivery berhasil diperbarui!');
      setShowProcessModal(false);
      setSelectedDelivery(null);
      form.resetFields();
      setFileList([]);
      
    } catch (error) {
      message.error('Gagal memperbarui delivery');
    } finally {
      setLoading(false);
    }
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
    fileList,
  };

  const getDeliverySteps = (status) => {
    const steps = [
      {
        title: 'Pending',
        description: 'Menunggu proses',
        icon: <ClockCircleOutlined />
      },
      {
        title: 'In Transit',
        description: 'Sedang dikirim',
        icon: <TruckOutlined />
      },
      {
        title: 'Delivered',
        description: 'Sampai tujuan',
        icon: <CheckCircleOutlined />
      },
      {
        title: 'Distributed',
        description: 'Tersalurkan',
        icon: <UserOutlined />
      }
    ];

    const currentIndex = {
      'pending': 0,
      'in_transit': 1,
      'delivered': 2,
      'distributed': 3,
      'failed': 0
    }[status] || 0;

    return { steps, currentIndex };
  };

  return (
    <div className="delivery-distribusi">
      <div className="page-header">
        <h1>Delivery & Distribusi</h1>
        <p>Kelola pengiriman dan penyaluran aset ke pengguna</p>
      </div>

      <Card>
        <div className="delivery-stats">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div className="stat-card">
                <div className="stat-icon pending">
                  <ClockCircleOutlined />
                </div>
                <div className="stat-content">
                  <h3>{deliveryData.filter(d => d.status === 'pending').length}</h3>
                  <p>Menunggu</p>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-card">
                <div className="stat-icon transit">
                  <TruckOutlined />
                </div>
                <div className="stat-content">
                  <h3>{deliveryData.filter(d => d.status === 'in_transit').length}</h3>
                  <p>Dalam Pengiriman</p>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-card">
                <div className="stat-icon delivered">
                  <CheckCircleOutlined />
                </div>
                <div className="stat-content">
                  <h3>{deliveryData.filter(d => d.status === 'delivered').length}</h3>
                  <p>Tersampai</p>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-card">
                <div className="stat-icon distributed">
                  <UserOutlined />
                </div>
                <div className="stat-content">
                  <h3>{deliveryData.filter(d => d.status === 'distributed').length}</h3>
                  <p>Tersalurkan</p>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={deliveryColumns}
            dataSource={deliveryData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Detail Delivery"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedDelivery && (
          <div className="delivery-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Delivery</h4>
                <p><strong>Delivery ID:</strong> {selectedDelivery.delivery_id}</p>
                <p><strong>Request ID:</strong> {selectedDelivery.request_id}</p>
                <p><strong>Status:</strong> <Tag color="blue">{selectedDelivery.status}</Tag></p>
                <p><strong>Progress:</strong></p>
                <Progress percent={selectedDelivery.progress} />
              </Col>
              <Col span={12}>
                <h4>Informasi Aset</h4>
                <p><strong>Nama Aset:</strong> {selectedDelivery.asset_name}</p>
                <p><strong>Jumlah:</strong> {selectedDelivery.quantity}</p>
                <p><strong>Lokasi:</strong> {selectedDelivery.delivery_location}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Penerima</h4>
                <p><strong>Nama:</strong> {selectedDelivery.recipient_name}</p>
                <p><strong>NIK:</strong> {selectedDelivery.recipient_nik}</p>
              </Col>
              <Col span={12}>
                <h4>Waktu</h4>
                <p><strong>Estimasi:</strong> {selectedDelivery.estimated_delivery}</p>
                <p><strong>Aktual:</strong> {selectedDelivery.actual_delivery || 'Belum tersedia'}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <h4>Catatan</h4>
                <p>{selectedDelivery.notes}</p>
              </Col>
            </Row>
            
            <div className="delivery-progress-steps">
              <h4>Progress Delivery</h4>
              <Steps 
                current={getDeliverySteps(selectedDelivery.status).currentIndex}
                items={getDeliverySteps(selectedDelivery.status).steps}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Process Modal */}
      <Modal
        title="Proses Delivery"
        open={showProcessModal}
        onCancel={() => setShowProcessModal(false)}
        footer={null}
        width={600}
      >
        {selectedDelivery && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateDelivery}
          >
            <Alert
              message={`Proses Delivery: ${selectedDelivery.delivery_id}`}
              description={`Aset: ${selectedDelivery.asset_name} - Penerima: ${selectedDelivery.recipient_name}`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="delivery_status"
              label="Update Status"
              rules={[{ required: true, message: 'Pilih status!' }]}
            >
              <Select placeholder="Pilih status">
                <Option value="pending">Pending</Option>
                <Option value="in_transit">In Transit</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="distributed">Distributed</Option>
                <Option value="failed">Failed</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="actual_delivery"
              label="Tanggal Pengiriman Aktual"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Pilih tanggal" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Catatan"
            >
              <TextArea rows={3} placeholder="Tambahkan catatan pengiriman..." />
            </Form.Item>

            <Form.Item
              name="delivery_proof"
              label="Bukti Pengiriman (Opsional)"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Bukti</Button>
              </Upload>
              <small>Format: PDF, JPG, PNG (Max: 5MB)</small>
            </Form.Item>

            <Form.Item>
              <div className="form-actions">
                <Button onClick={() => setShowProcessModal(false)}>
                  Batal
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  loading={loading}
                >
                  Update Delivery
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
