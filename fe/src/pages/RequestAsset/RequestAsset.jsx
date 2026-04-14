import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Space,
  message,
  Input,
  Select,
  Modal,
  Steps,
} from 'antd';
import { ReloadOutlined, PlusOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RequestAsset.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function RequestAsset() {
  const navigate = useNavigate();
  const [requestAssetData, setRequestAssetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockRequestAssetData = [
    {
      id: 1,
      request_code: 'REQ-2024-001',
      title: 'Permintaan Laptop Baru untuk Tim Development',
      requester: 'Manajer Development',
      requester_email: 'dev.manager@company.com',
      department: 'IT',
      priority: 'high',
      status: 'pending',
      request_date: '2024-03-30',
      required_date: '2024-04-15',
      justification:
        'Current laptops are outdated and cannot handle new development requirements. Need high-performance machines for software development.',
      items: [
        {
          item_name: 'Laptop Dell XPS 15',
          quantity: 5,
          estimated_unit_price: 18000000,
          total_estimated_price: 90000000,
          specifications: 'Intel Core i7, 16GB RAM, 512GB SSD, RTX 3060',
          preferred_brand: 'Dell',
          alternative_brands: ['HP', 'Lenovo'],
        },
      ],
      total_estimated_amount: 90000000,
      budget_code: 'IT-2024-DEV-001',
      budget_available: 120000000,
      workflow: [
        {
          step: 'request',
          status: 'completed',
          assignee: 'Development Manager',
          completed_date: '2024-03-30',
        },
        { step: 'pv', status: 'pending', assignee: 'Procurement Team', completed_date: null },
        {
          step: 'approval_finance',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null,
        },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null },
      ],
      attachments: ['requirements.pdf', 'comparison_chart.pdf'],
    },
    {
      id: 2,
      request_code: 'REQ-2024-002',
      title: 'Upgrade Server untuk Infrastruktur',
      requester: 'Manajer Infrastruktur IT',
      requester_email: 'infra.manager@company.com',
      department: 'IT',
      priority: 'critical',
      status: 'in_progress',
      request_date: '2024-03-29',
      required_date: '2024-04-10',
      justification:
        'Current servers cannot handle increasing load. Need upgrade for business continuity and performance.',
      items: [
        {
          item_name: 'Server Dell PowerEdge R740',
          quantity: 2,
          estimated_unit_price: 60000000,
          total_estimated_price: 120000000,
          specifications: 'Intel Xeon Silver, 64GB RAM, 2TB SSD RAID, Redundant Power Supply',
          preferred_brand: 'Dell',
          alternative_brands: ['HP', 'IBM'],
        },
      ],
      total_estimated_amount: 120000000,
      budget_code: 'IT-2024-INFRA-001',
      budget_available: 150000000,
      workflow: [
        {
          step: 'request',
          status: 'completed',
          assignee: 'IT Infrastructure Manager',
          completed_date: '2024-03-29',
        },
        {
          step: 'pv',
          status: 'completed',
          assignee: 'Procurement Team',
          completed_date: '2024-03-30',
        },
        {
          step: 'approval_finance',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null,
        },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null },
      ],
      attachments: ['infrastructure_plan.pdf', 'capacity_analysis.pdf'],
    },
    {
      id: 3,
      request_code: 'REQ-2024-003',
      title: 'Penggantian Furnitur Kantor',
      requester: 'Manajer HR',
      requester_email: 'hr.manager@company.com',
      department: 'HR',
      priority: 'medium',
      status: 'completed',
      request_date: '2024-03-25',
      required_date: '2024-04-05',
      justification:
        'Current office furniture is worn out and affecting employee comfort and productivity.',
      items: [
        {
          item_name: 'Ergonomic Chair',
          quantity: 10,
          estimated_unit_price: 1500000,
          total_estimated_price: 15000000,
          specifications: 'Adjustable height, lumbar support, armrests, 5-year warranty',
          preferred_brand: 'Herman Miller',
          alternative_brands: ['Steelcase', 'Okamura'],
        },
      ],
      total_estimated_amount: 15000000,
      budget_code: 'HR-2024-OFFICE-001',
      budget_available: 50000000,
      workflow: [
        {
          step: 'request',
          status: 'completed',
          assignee: 'HR Manager',
          completed_date: '2024-03-25',
        },
        {
          step: 'pv',
          status: 'completed',
          assignee: 'Procurement Team',
          completed_date: '2024-03-26',
        },
        {
          step: 'approval_finance',
          status: 'completed',
          assignee: 'Finance Manager',
          completed_date: '2024-03-27',
        },
        {
          step: 'po',
          status: 'completed',
          assignee: 'Procurement Manager',
          completed_date: '2024-03-28',
        },
      ],
      attachments: ['furniture_catalog.pdf', 'ergonomics_study.pdf'],
    },
  ];

  const statuses = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'in_progress', label: 'Berjalan' },
    { value: 'completed', label: 'Selesai' },
    { value: 'rejected', label: 'Ditolak' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' },
  ];

  useEffect(() => {
    setRequestAssetData(mockRequestAssetData);
    setFilteredData(mockRequestAssetData);
  }, []);

  useEffect(() => {
    let filtered = requestAssetData.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchText.toLowerCase()) ||
        request.request_code.toLowerCase().includes(searchText.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, requestAssetData]);

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Calculate total estimated amount
      const totalAmount = values.items.reduce(
        (sum, item) => sum + item.quantity * item.estimated_unit_price,
        0
      );

      const newRequest = {
        id: Date.now(),
        request_code: `REQ-2024-${Date.now()}`,
        ...values,
        total_estimated_amount: totalAmount,
        status: 'pending',
        request_date: new Date().toISOString().split('T')[0],
        workflow: [
          {
            step: 'request',
            status: 'completed',
            assignee: values.requester,
            completed_date: new Date().toISOString().split('T')[0],
          },
          { step: 'pv', status: 'pending', assignee: 'Procurement Team', completed_date: null },
          {
            step: 'approval_finance',
            status: 'pending',
            assignee: 'Finance Manager',
            completed_date: null,
          },
          { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null },
        ],
      };

      setRequestAssetData((prev) => [newRequest, ...prev]);
      message.success('Permintaan aset berhasil dibuat');
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Gagal membuat permintaan');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRequestAssetData(mockRequestAssetData);
      setLoading(false);
      message.success('Data berhasil dimuat ulang');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    const found = priorities.find((p) => p.value === priority);
    return found ? found.color : 'default';
  };

  const getCurrentStep = (workflow) => {
    const pendingStep = workflow.find((step) => step.status === 'pending');
    return pendingStep ? pendingStep.step : 'completed';
  };

  const pendingRequests = filteredData.filter((request) => request.status === 'pending').length;
  const inProgressRequests = filteredData.filter(
    (request) => request.status === 'in_progress'
  ).length;
  const completedRequests = filteredData.filter((request) => request.status === 'completed').length;
  const totalValue = filteredData.reduce((sum, request) => sum + request.total_estimated_amount, 0);

  const columns = [
    {
      title: 'Kode Permintaan',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Judul',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Pemohon',
      key: 'requester',
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.requester}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.department}</div>
        </div>
      ),
    },
    {
      title: 'Prioritas',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>,
    },
    {
      title: 'Total Nilai',
      dataIndex: 'total_estimated_amount',
      key: 'total_estimated_amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.total_estimated_amount - b.total_estimated_amount,
    },
    {
      title: 'Tanggal Dibutuhkan',
      dataIndex: 'required_date',
      key: 'required_date',
    },
    {
      title: 'Tahap Saat Ini',
      key: 'current_step',
      render: (_, record) => {
        const step = getCurrentStep(record.workflow);
        return step === 'completed' ? (
          <Tag color='green'>SELESAI</Tag>
        ) : (
          <Tag color='blue'>{step.replace('_', ' ').toUpperCase()}</Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          {record.status === 'pending' && (
            <Button
              type='primary'
              size='small'
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/pv', { state: { request: record } })}
            >
              Proses ke PV
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='request-asset'>
      <div className='page-header'>
        <h1>Permintaan Aset</h1>
        <p>Kelola permintaan pembelian aset baru.</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card pending'>
              <div className='statistic-icon'>⏳</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Permintaan Menunggu</div>
                <div className='statistic-value'>{pendingRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card in-progress'>
              <div className='statistic-icon'>🔄</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Sedang Berjalan</div>
                <div className='statistic-value'>{inProgressRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card completed'>
              <div className='statistic-icon'>✅</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Selesai</div>
                <div className='statistic-value'>{completedRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card total'>
              <div className='statistic-icon'>💰</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Nilai</div>
                <div className='statistic-value'>Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title='Daftar Permintaan Aset'
            extra={
                <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
                Buat Permintaan
                </Button>
            }
          >
            <div className='table-controls'>
              <Space>
                <Search
                  placeholder='Cari permintaan aset...'
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: 200 }}>
                  {statuses.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
                  <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                  Muat Ulang
                  </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey='id'
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} requests`,
              }}
              rowClassName={(record) => {
                if (record.status === 'pending') return 'row-pending';
                if (record.status === 'in_progress') return 'row-in-progress';
                if (record.status === 'completed') return 'row-completed';
                if (record.status === 'rejected') return 'row-rejected';
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title='Buat Permintaan Aset'
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='title'
                label='Judul Permintaan'
                rules={[{ required: true, message: 'Judul harus diisi!' }]}
              >
                <Input placeholder='Masukkan judul permintaan' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='priority'
                label='Prioritas'
                rules={[{ required: true, message: 'Prioritas harus diisi!' }]}
              >
                <Select placeholder='Pilih prioritas'>
                  {priorities.map((priority) => (
                    <Option key={priority.value} value={priority.value}>
                      {priority.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='justification'
            label='Alasan'
            rules={[{ required: true, message: 'Alasan harus diisi!' }]}
          >
            <Input.TextArea rows={4} placeholder='Jelaskan alasan permintaan aset...' />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='requester'
                label='Nama Pemohon'
                rules={[{ required: true, message: 'Nama pemohon harus diisi!' }]}
              >
                <Input placeholder='Nama pemohon' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='requester_email'
                label='Email Pemohon'
                rules={[
                  { required: true, message: 'Email harus diisi!' },
                  { type: 'email', message: 'Format email tidak valid!' },
                ]}
              >
                <Input placeholder='email@company.com' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                name='department'
                label='Departemen'
                rules={[{ required: true, message: 'Departemen harus diisi!' }]}
              >
                <Select placeholder='Pilih departemen'>
                  <Option value='IT'>IT</Option>
                  <Option value='Operations'>Operations</Option>
                  <Option value='Finance'>Finance</Option>
                  <Option value='HR'>HR</Option>
                  <Option value='Marketing'>Marketing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name='budget_code'
                label='Kode Anggaran'
                rules={[{ required: true, message: 'Kode anggaran harus diisi!' }]}
              >
                <Input placeholder='Kode anggaran' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name='required_date'
                label='Tanggal Dibutuhkan'
                rules={[{ required: true, message: 'Tanggal dibutuhkan harus diisi!' }]}
              >
                <Input placeholder='YYYY-MM-DD' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='items'
            label='Item yang Diminta'
            rules={[{ required: true, message: 'Item harus diisi!' }]}
          >
            <Form.List name='items'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: '1px solid #f0f0f0',
                        borderRadius: 6,
                      }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'item_name']}
                            label='Nama Item'
                            rules={[{ required: true, message: 'Nama item harus diisi!' }]}
                          >
                            <Input placeholder='Nama item' />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            label='Jumlah'
                            rules={[{ required: true, message: 'Jumlah harus diisi!' }]}
                          >
                            <Input type='number' placeholder='Qty' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'estimated_unit_price']}
                            label='Harga Satuan'
                            rules={[{ required: true, message: 'Harga satuan harus diisi!' }]}
                          >
                            <Input type='number' placeholder='Rp 0' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label='Action'>
                            <Button
                              type='danger'
                              onClick={() => remove(name)}
                              disabled={fields.length === 1}
                            >
                              Hapus
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'specifications']}
                            label='Spesifikasi'
                          >
                            <Input placeholder='Spesifikasi item' />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'preferred_brand']}
                            label='Merek Pilihan'
                          >
                            <Input placeholder='Brand yang diinginkan' />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                      Tambah Item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item>
            <Space>
                <Button type='primary' htmlType='submit' loading={loading}>
                Buat Permintaan
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title='Detail Permintaan Aset'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
          selectedRequest?.status === 'pending' && (
            <Button
              key='process'
              type='primary'
              icon={<ShoppingCartOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                navigate('/pv', { state: { request: selectedRequest } });
              }}
            >
              Proses ke PV
            </Button>
          ),
        ]}
        width={1000}
      >
        {selectedRequest && (
          <div className='request-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Informasi Permintaan</h4>
                  <p>
                    <strong>Kode Permintaan:</strong> {selectedRequest.request_code}
                  </p>
                  <p>
                    <strong>Judul:</strong> {selectedRequest.title}
                  </p>
                  <p>
                    <strong>Prioritas:</strong>{' '}
                    <Tag color={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority.toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag color={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Tanggal Permintaan:</strong> {selectedRequest.request_date}
                  </p>
                  <p>
                    <strong>Tanggal Dibutuhkan:</strong> {selectedRequest.required_date}
                  </p>
                </div>
              </Col>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Informasi Pemohon</h4>
                  <p>
                    <strong>Nama:</strong> {selectedRequest.requester}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedRequest.requester_email}
                  </p>
                  <p>
                    <strong>Departemen:</strong> {selectedRequest.department}
                  </p>
                  <p>
                    <strong>Kode Anggaran:</strong> {selectedRequest.budget_code}
                  </p>
                  <p>
                    <strong>Anggaran Tersedia:</strong> Rp{' '}
                    {selectedRequest.budget_available.toLocaleString('id-ID')}
                  </p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Alasan</h4>
                  <p>{selectedRequest.justification}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Item yang Diminta</h4>
                  <div className='items-table'>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          <th
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'left',
                            }}
                          >
                            Nama Item
                          </th>
                          <th
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'left',
                            }}
                          >
                            Jumlah
                          </th>
                          <th
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'left',
                            }}
                          >
                            Harga Satuan
                          </th>
                          <th
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'left',
                            }}
                          >
                            Total Harga
                          </th>
                          <th
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'left',
                            }}
                          >
                            Spesifikasi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                              {item.item_name}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                              Rp {item.estimated_unit_price.toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                              Rp {item.total_estimated_price.toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                              {item.specifications}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan='3'
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              textAlign: 'right',
                              fontWeight: 'bold',
                            }}
                          >
                            Total:
                          </td>
                          <td
                            colSpan='2'
                            style={{
                              padding: '8px',
                              border: '1px solid #f0f0f0',
                              fontWeight: 'bold',
                              color: '#1890ff',
                            }}
                          >
                            Rp {selectedRequest.total_estimated_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Progress Alur</h4>
                  <Steps
                    current={selectedRequest.workflow.findIndex(
                      (step) => step.status === 'pending'
                    )}
                    size='small'
                  >
                    {selectedRequest.workflow.map((step, index) => (
                      <Step
                        key={step.step}
                        title={step.step.replace('_', ' ').toUpperCase()}
                        description={
                          <div>
                            <div>{step.assignee}</div>
                            {step.completed_date && (
                              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              Selesai: {step.completed_date}
                              </div>
                            )}
                          </div>
                        }
                        status={
                          step.status === 'completed'
                            ? 'finish'
                            : step.status === 'pending'
                              ? 'wait'
                              : 'process'
                        }
                      />
                    ))}
                  </Steps>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Lampiran</h4>
                  <div className='attachments'>
                    {selectedRequest.attachments.map((file, index) => (
                      <Tag key={index} icon={<FileTextOutlined />}>
                        {file}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
