import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Alert,
  Tag,
  Progress,
  Statistic,
  Upload,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  FilterOutlined,
  WarningOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function AbnormalityManagement() {
  const [form] = Form.useForm();
  const [abnormalityData, setAbnormalityData] = useState([]);
  const [selectedAbnormality, setSelectedAbnormality] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showJobRequestModal, setShowJobRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [filters, setFilters] = useState({
    severity: null,
    status: null,
    asset: null,
    dateRange: null,
  });

  const abnormalityColumns = [
    {
      title: 'ID',
      dataIndex: 'abnormality_id',
      key: 'abnormality_id',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Aset',
      dataIndex: 'asset_name',
      key: 'asset_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.asset_tag}</div>
        </div>
      ),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <div>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colorMap = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'purple',
        };
        const iconMap = {
          low: <CheckCircleOutlined />,
          medium: <WarningOutlined />,
          high: <WarningOutlined />,
          critical: <ExclamationCircleOutlined />,
        };
        return (
          <Tag color={colorMap[severity]} icon={iconMap[severity]}>
            {severity}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          open: 'red',
          investigating: 'orange',
          in_progress: 'blue',
          resolved: 'green',
          closed: 'default',
        };
        const iconMap = {
          open: <ExclamationCircleOutlined />,
          investigating: <SearchOutlined />,
          in_progress: <ToolOutlined />,
          resolved: <CheckCircleOutlined />,
          closed: <CheckCircleOutlined />,
        };
        return (
          <Tag color={colorMap[status]} icon={iconMap[status]}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Dilaporkan',
      dataIndex: 'reported_date',
      key: 'reported_date',
      render: (date) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Job Request',
      dataIndex: 'job_request_id',
      key: 'job_request_id',
      render: (jobRequestId) =>
        jobRequestId ? (
          <Tag color='blue'>{jobRequestId}</Tag>
        ) : (
          <Tag color='default'>Belum dibuat</Tag>
        ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className='action-buttons'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Detail
          </Button>
          {!record.job_request_id && (
            <Button
              type='primary'
              size='small'
              icon={<ToolOutlined />}
              onClick={() => handleCreateJobRequest(record)}
            >
              Job Request
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    // Mock abnormality data
    setAbnormalityData([
      {
        id: 1,
        abnormality_id: 'ABN-001',
        asset_name: 'Laptop Dell XPS 15',
        asset_tag: 'LT-001',
        description:
          'Laptop tiba-tiba mati dan tidak bisa booting, kemungkinan masalah pada power supply',
        severity: 'high',
        status: 'open',
        reported_date: '2024-03-25',
        reported_by: 'John Doe',
        job_request_id: null,
        location: 'Jakarta Office',
        category: 'Hardware',
        impact_assessment: 'Tidak dapat bekerja, produktivitas terhambat',
      },
      {
        id: 2,
        abnormality_id: 'ABN-002',
        asset_name: 'Server HP ProLiant',
        asset_tag: 'SRV-001',
        description: 'Server mengalami overheating dan shutdown otomatis',
        severity: 'critical',
        status: 'investigating',
        reported_date: '2024-03-24',
        reported_by: 'Jane Smith',
        job_request_id: 'JR-001',
        location: 'Data Center',
        category: 'Hardware',
        impact_assessment: 'Semua layanan terhambat, dampak bisnis tinggi',
      },
      {
        id: 3,
        abnormality_id: 'ABN-003',
        asset_name: 'Monitor LG 27 inch',
        asset_tag: 'MN-001',
        description: 'Layar berkedip dan warna tidak stabil',
        severity: 'medium',
        status: 'resolved',
        reported_date: '2024-03-23',
        reported_by: 'Mike Johnson',
        job_request_id: 'JR-002',
        location: 'Surabaya Office',
        category: 'Display',
        impact_assessment: 'Penggunaan terganggu tetapi masih bisa bekerja',
      },
      {
        id: 4,
        abnormality_id: 'ABN-004',
        asset_name: 'Printer HP LaserJet',
        asset_tag: 'PRN-001',
        description: 'Printer tidak bisa mencetak dokumen, error code 50.2',
        severity: 'low',
        status: 'closed',
        reported_date: '2024-03-22',
        reported_by: 'Alice Johnson',
        job_request_id: 'JR-003',
        location: 'Bandung Office',
        category: 'Printer',
        impact_assessment: 'Dampak minimal, ada printer backup',
      },
    ]);
  }, []);

  const handleViewDetail = (abnormality) => {
    setSelectedAbnormality(abnormality);
    setShowDetailModal(true);
  };

  const handleCreateJobRequest = (abnormality) => {
    setSelectedAbnormality(abnormality);
    setShowJobRequestModal(true);
    form.setFieldsValue({
      title: `Job Request - ${abnormality.description}`,
      priority: abnormal.severity === 'critical' ? 'urgent' : abnormal.severity,
      description: abnormal.description,
      asset_id: abnormal.asset_name,
    });
  };

  const handleSubmitAbnormality = async (values) => {
    try {
      setLoading(true);

      const abnormalityData = {
        abnormality_id: `ABN-${String(abnormalityData.length + 1).padStart(3, '0')}`,
        ...values,
        reported_date: new Date().toISOString().split('T')[0],
        reported_by: 'current_user', // Replace with actual user
        status: 'open',
      };

      // API call to save abnormality

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success('Abnormality berhasil dilaporkan!');
      setShowCreateModal(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Gagal melaporkan abnormality');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitJobRequest = async (values) => {
    try {
      setLoading(true);

      const jobRequestData = {
        job_request_id: `JR-${String(Date.now()).slice(-3)}`,
        abnormality_id: selectedAbnormality.abnormality_id,
        ...values,
        created_date: new Date().toISOString().split('T')[0],
        created_by: 'current_user', // Replace with actual user
        status: 'open',
      };

      // API call to create job request

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update local state
      setAbnormalityData((prev) =>
        prev.map((item) =>
          item.id === selectedAbnormality.id
            ? { ...item, job_request_id: jobRequestData.job_request_id, status: 'in_progress' }
            : item
        )
      );

      message.success('Job request berhasil dibuat!');
      setShowJobRequestModal(false);
      setSelectedAbnormality(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal membuat job request');
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

  const getAbnormalityStats = () => {
    const total = abnormalityData.length;
    const open = abnormalityData.filter((a) => a.status === 'open').length;
    const critical = abnormalityData.filter((a) => a.severity === 'critical').length;
    const withJobRequest = abnormalityData.filter((a) => a.job_request_id).length;

    return { total, open, critical, withJobRequest };
  };

  const stats = getAbnormalityStats();

  return (
    <div className='abnormality-management'>
      <div className='page-header'>
        <h1>Abnormality Management</h1>
        <p>Kelola laporan ketidaknormalan dan monitoring aset</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title='Total Abnormalities'
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Open Cases'
              value={stats.open}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Critical Cases'
              value={stats.critical}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='With Job Request'
              value={stats.withJobRequest}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Header Actions */}
        <div className='card-header'>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
            Laporkan Abnormality
          </Button>
        </div>

        {/* Filters */}
        <div className='filter-section'>
          <Form
            layout='inline'
            onFinish={(values) => setFilters(values)}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name='severity'>
              <Select placeholder='Severity' allowClear style={{ width: 120 }}>
                <Option value='low'>Low</Option>
                <Option value='medium'>Medium</Option>
                <Option value='high'>High</Option>
                <Option value='critical'>Critical</Option>
              </Select>
            </Form.Item>
            <Form.Item name='status'>
              <Select placeholder='Status' allowClear style={{ width: 120 }}>
                <Option value='open'>Open</Option>
                <Option value='investigating'>Investigating</Option>
                <Option value='in_progress'>In Progress</Option>
                <Option value='resolved'>Resolved</Option>
                <Option value='closed'>Closed</Option>
              </Select>
            </Form.Item>
            <Form.Item name='dateRange'>
              <RangePicker placeholder={['Dari', 'Sampai']} />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit' icon={<FilterOutlined />}>
                Filter
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Table */}
        <Table
          columns={abnormalityColumns}
          dataSource={abnormalityData}
          rowKey='id'
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Abnormality Modal */}
      <Modal
        title='Laporkan Abnormality'
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmitAbnormality}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='asset_name'
                label='Nama Aset'
                rules={[{ required: true, message: 'Masukkan nama aset!' }]}
              >
                <Input placeholder='Masukkan nama aset' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='asset_tag' label='Asset Tag'>
                <Input placeholder='Masukkan asset tag' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='severity'
                label='Severity'
                rules={[{ required: true, message: 'Pilih severity!' }]}
              >
                <Select placeholder='Pilih severity'>
                  <Option value='low'>Low</Option>
                  <Option value='medium'>Medium</Option>
                  <Option value='high'>High</Option>
                  <Option value='critical'>Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='category'
                label='Kategori'
                rules={[{ required: true, message: 'Pilih kategori!' }]}
              >
                <Select placeholder='Pilih kategori'>
                  <Option value='Hardware'>Hardware</Option>
                  <Option value='Software'>Software</Option>
                  <Option value='Network'>Network</Option>
                  <Option value='Display'>Display</Option>
                  <Option value='Printer'>Printer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='description'
            label='Deskripsi Abnormality'
            rules={[{ required: true, message: 'Masukkan deskripsi!' }]}
          >
            <TextArea rows={4} placeholder='Jelaskan abnormality yang terjadi...' />
          </Form.Item>

          <Form.Item
            name='impact_assessment'
            label='Dampak terhadap Operasional'
            rules={[{ required: true, message: 'Jelaskan dampaknya!' }]}
          >
            <TextArea rows={3} placeholder='Jelaskan dampak terhadap operasional...' />
          </Form.Item>

          <Form.Item
            name='location'
            label='Lokasi'
            rules={[{ required: true, message: 'Masukkan lokasi!' }]}
          >
            <Input placeholder='Masukkan lokasi aset' />
          </Form.Item>

          <Form.Item name='attachments' label='Lampiran (Opsional)'>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Lampiran</Button>
            </Upload>
            <small>Format: PDF, JPG, PNG (Max: 5MB)</small>
          </Form.Item>

          <Form.Item>
            <div className='form-actions'>
              <Button onClick={() => setShowCreateModal(false)}>Batal</Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                Laporkan
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title='Detail Abnormality'
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key='close' onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {selectedAbnormality && (
          <div className='abnormality-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Abnormality</h4>
                <p>
                  <strong>ID:</strong> {selectedAbnormality.abnormality_id}
                </p>
                <p>
                  <strong>Aset:</strong> {selectedAbnormality.asset_name}
                </p>
                <p>
                  <strong>Asset Tag:</strong> {selectedAbnormality.asset_tag}
                </p>
                <p>
                  <strong>Severity:</strong> <Tag color='red'>{selectedAbnormality.severity}</Tag>
                </p>
                <p>
                  <strong>Status:</strong> <Tag color='blue'>{selectedAbnormality.status}</Tag>
                </p>
              </Col>
              <Col span={12}>
                <h4>Informasi Pelaporan</h4>
                <p>
                  <strong>Dilaporkan:</strong>{' '}
                  {new Date(selectedAbnormality.reported_date).toLocaleDateString('id-ID')}
                </p>
                <p>
                  <strong>Oleh:</strong> {selectedAbnormality.reported_by}
                </p>
                <p>
                  <strong>Lokasi:</strong> {selectedAbnormality.location}
                </p>
                <p>
                  <strong>Kategori:</strong> {selectedAbnormality.category}
                </p>
                <p>
                  <strong>Job Request:</strong>{' '}
                  {selectedAbnormality.job_request_id || 'Belum dibuat'}
                </p>
              </Col>
            </Row>

            <Divider />

            <div>
              <h4>Deskripsi</h4>
              <p>{selectedAbnormality.description}</p>
            </div>

            <div>
              <h4>Dampak Operasional</h4>
              <p>{selectedAbnormality.impact_assessment}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Job Request Modal */}
      <Modal
        title='Buat Job Request'
        open={showJobRequestModal}
        onCancel={() => {
          setShowJobRequestModal(false);
          setSelectedAbnormality(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAbnormality && (
          <Form form={form} layout='vertical' onFinish={handleSubmitJobRequest}>
            <Alert
              message={`Job Request untuk: ${selectedAbnormality.abnormality_id}`}
              description={`Aset: ${selectedAbnormality.asset_name} - ${selectedAbnormality.description}`}
              type='info'
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name='title'
              label='Judul Job Request'
              rules={[{ required: true, message: 'Masukkan judul!' }]}
            >
              <Input placeholder='Masukkan judul job request' />
            </Form.Item>

            <Form.Item
              name='priority'
              label='Prioritas'
              rules={[{ required: true, message: 'Pilih prioritas!' }]}
            >
              <Select placeholder='Pilih prioritas'>
                <Option value='low'>Low</Option>
                <Option value='medium'>Medium</Option>
                <Option value='high'>High</Option>
                <Option value='urgent'>Urgent</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='description'
              label='Deskripsi Pekerjaan'
              rules={[{ required: true, message: 'Masukkan deskripsi!' }]}
            >
              <TextArea rows={4} placeholder='Deskripsikan pekerjaan yang diperlukan...' />
            </Form.Item>

            <Form.Item name='assigned_to' label='Assign To (Opsional)'>
              <Select placeholder='Pilih teknisi'>
                <Option value='tech1'>Technician 1</Option>
                <Option value='tech2'>Technician 2</Option>
                <Option value='tech3'>Technician 3</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <div className='form-actions'>
                <Button onClick={() => setShowJobRequestModal(false)}>Batal</Button>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Buat Job Request
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
