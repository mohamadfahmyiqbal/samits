import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps, Alert } from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './PO.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function PO() {
  const navigate = useNavigate();
  const location = useLocation();
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { approval } = location.state || {};

  const mockPOData = [
    {
      id: 1,
      po_code: 'PO-2024-001',
      approval_code: 'AP2-2024-001',
      pv_code: 'PV-2024-001',
      request_code: 'REQ-2024-001',
      title: 'New Laptop Request for Development Team',
      vendor_name: 'PT. Teknologi Maju',
      vendor_address: 'Jl. Teknologi No. 123, Jakarta',
      vendor_contact: 'Sales Department',
      vendor_phone: '+62-21-5551234',
      vendor_email: 'sales@teknologimaju.com',
      items: [
        {
          item_name: 'Laptop Dell XPS 15',
          quantity: 5,
          unit_price: 18000000,
          total_price: 90000000,
          specifications: 'Intel Core i7, 16GB RAM, 512GB SSD, RTX 3060',
          delivery_terms: 'FOB Jakarta',
          warranty: '3 years'
        }
      ],
      total_amount: 90000000,
      discount_amount: 4500000,
      tax_amount: 8550000,
      final_amount: 94050000,
      payment_terms: 'Net 30 Days',
      delivery_terms: '7 working days after PO confirmation',
      warranty_terms: '3 years manufacturer warranty',
      status: 'pending',
      created_date: '2024-04-01',
      expected_delivery_date: '2024-04-10',
      actual_delivery_date: null,
      attachments: ['po_draft.pdf', 'vendor_agreement.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'Development Manager', completed_date: '2024-03-30' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-30' },
        { step: 'approval2', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-31' },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
      ]
    },
    {
      id: 2,
      po_code: 'PO-2024-002',
      approval_code: 'AP2-2024-002',
      pv_code: 'PV-2024-002',
      request_code: 'REQ-2024-002',
      title: 'Server Upgrade Request',
      vendor_name: 'PT. Server Indonesia',
      vendor_address: 'Jl. Server No. 456, Jakarta',
      vendor_contact: 'Procurement Department',
      vendor_phone: '+62-21-8885678',
      vendor_email: 'procurement@serverindo.com',
      items: [
        {
          item_name: 'Server Dell PowerEdge R740',
          quantity: 2,
          unit_price: 60000000,
          total_price: 120000000,
          specifications: 'Intel Xeon Silver, 64GB RAM, 2TB SSD RAID',
          delivery_terms: 'DDP Jakarta',
          warranty: '5 years'
        }
      ],
      total_amount: 120000000,
      discount_amount: 12000000,
      tax_amount: 10800000,
      final_amount: 118800000,
      payment_terms: 'Net 45 Days',
      delivery_terms: '14 working days after PO confirmation',
      warranty_terms: '5 years manufacturer warranty with on-site support',
      status: 'in_progress',
      created_date: '2024-04-01',
      expected_delivery_date: '2024-04-15',
      actual_delivery_date: null,
      attachments: ['po_confirmed.pdf', 'service_agreement.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'IT Infrastructure Manager', completed_date: '2024-03-29' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-30' },
        { step: 'approval2', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-31' },
        { step: 'po', status: 'completed', assignee: 'Procurement Manager', completed_date: '2024-04-01' }
      ]
    },
    {
      id: 3,
      po_code: 'PO-2024-003',
      approval_code: 'AP2-2024-003',
      pv_code: 'PV-2024-003',
      request_code: 'REQ-2024-003',
      title: 'Office Furniture Request',
      vendor_name: 'PT. Furniture Indonesia',
      vendor_address: 'Jl. Furniture No. 789, Jakarta',
      vendor_contact: 'Sales Department',
      vendor_phone: '+62-21-7773456',
      vendor_email: 'sales@furnitureindo.com',
      items: [
        {
          item_name: 'Ergonomic Chair',
          quantity: 10,
          unit_price: 1500000,
          total_price: 15000000,
          specifications: 'Adjustable height, lumbar support, armrests',
          delivery_terms: 'FOB Jakarta',
          warranty: '2 years'
        }
      ],
      total_amount: 15000000,
      discount_amount: 750000,
      tax_amount: 1425000,
      final_amount: 15675000,
      payment_terms: 'Net 30 Days',
      delivery_terms: '5 working days after PO confirmation',
      warranty_terms: '2 years manufacturer warranty',
      status: 'completed',
      created_date: '2024-03-28',
      expected_delivery_date: '2024-04-02',
      actual_delivery_date: '2024-04-01',
      attachments: ['po_final.pdf', 'delivery_receipt.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'HR Manager', completed_date: '2024-03-25' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-26' },
        { step: 'approval2', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-27' },
        { step: 'po', status: 'completed', assignee: 'Procurement Manager', completed_date: '2024-03-28' }
      ]
    }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (approval) {
      // Add new PO from approval
      const newPO = {
        id: Date.now(),
        po_code: `PO-2024-${Date.now()}`,
        approval_code: approval.approval_code,
        pv_code: approval.pv_code,
        request_code: approval.request_code,
        title: approval.title,
        vendor_name: approval.vendor_name,
        vendor_address: 'To be confirmed',
        vendor_contact: 'To be confirmed',
        vendor_phone: 'To be confirmed',
        vendor_email: 'To be confirmed',
        items: approval.items,
        total_amount: approval.total_amount,
        discount_amount: approval.discount_amount,
        tax_amount: approval.tax_amount,
        final_amount: approval.final_amount,
        payment_terms: 'Net 30 Days',
        delivery_terms: 'To be confirmed',
        warranty_terms: 'Standard manufacturer warranty',
        status: 'pending',
        created_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_delivery_date: null,
        attachments: [],
        workflow: [
          { step: 'req_aset', status: 'completed', assignee: 'Requester', completed_date: new Date().toISOString().split('T')[0] },
          { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: new Date().toISOString().split('T')[0] },
          { step: 'approval2', status: 'completed', assignee: 'Finance Manager', completed_date: new Date().toISOString().split('T')[0] },
          { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
        ]
      };
      setPoData([newPO, ...mockPOData]);
    } else {
      setPoData(mockPOData);
    }
    setFilteredData(mockPOData);
  }, [approval]);

  useEffect(() => {
    let filtered = poData.filter(po => {
      const matchesSearch = po.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           po.po_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           po.vendor_name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || po.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, poData]);

  const handleCreatePO = (po) => {
    setSelectedPO(po);
    form.setFieldsValue({
      po_code: po.po_code,
      vendor_name: po.vendor_name,
      payment_terms: 'Net 30 Days',
      delivery_terms: '7 working days after PO confirmation',
      warranty_terms: 'Standard manufacturer warranty'
    });
    setCreateModalVisible(true);
  };

  const handlePOSubmit = async (values) => {
    setLoading(true);
    try {
      // API call to create/confirm PO

      setPoData(prev => prev.map(po => 
        po.id === selectedPO.id 
          ? { 
              ...po,
              vendor_address: values.vendor_address,
              vendor_contact: values.vendor_contact,
              vendor_phone: values.vendor_phone,
              vendor_email: values.vendor_email,
              payment_terms: values.payment_terms,
              delivery_terms: values.delivery_terms,
              warranty_terms: values.warranty_terms,
              status: 'in_progress',
              workflow: po.workflow.map((step, index) => 
                index === 3 
                  ? { ...step, status: 'completed', completed_date: new Date().toISOString().split('T')[0] }
                  : step
              )
            }
          : po
      ));
      
      message.success('PO berhasil dibuat dan dikirim ke vendor');
      setCreateModalVisible(false);
      setSelectedPO(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal membuat PO');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      setPoData(prev => prev.map(po => 
        po.id === id 
          ? { 
              ...po,
              status: 'completed',
              actual_delivery_date: new Date().toISOString().split('T')[0]
            }
          : po
      ));
      
      message.success('PO berhasil ditandai sebagai selesai');
    } catch (error) {
      message.error('Gagal menyelesaikan PO');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (po) => {
    setSelectedPO(po);
    setDetailModalVisible(true);
  };

  const handlePrint = (po) => {
    message.info('Fitur print akan segera tersedia');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPoData(mockPOData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const pendingPOs = filteredData.filter(po => po.status === 'pending').length;
  const inProgressPOs = filteredData.filter(po => po.status === 'in_progress').length;
  const completedPOs = filteredData.filter(po => po.status === 'completed').length;
  const totalValue = filteredData.reduce((sum, po) => sum + po.final_amount, 0);

  const columns = [
    {
      title: 'PO Code',
      dataIndex: 'po_code',
      key: 'po_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_, record) => (
        <div>
          <div><strong>{record.vendor_name}</strong></div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.vendor_phone}
          </div>
        </div>
      ) },
    {
      title: 'Final Amount',
      dataIndex: 'final_amount',
      key: 'final_amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.final_amount - b.final_amount },
    {
      title: 'Delivery',
      key: 'delivery',
      render: (_, record) => (
        <div>
          <div>Expected: {record.expected_delivery_date}</div>
          {record.actual_delivery_date && (
            <div style={{ fontSize: '12px', color: '#52c41a' }}>
              Actual: {record.actual_delivery_date}
            </div>
          )}
        </div>
      ) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ) },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleCreatePO(record)}
            >
              Create PO
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.id)}
              loading={loading}
            >
              Complete
            </Button>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="po">
      <div className="page-header">
        <h1>Purchase Order (PO)</h1>
        <p>Management purchase order dan tracking pengiriman aset</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card pending">
              <div className="statistic-icon">⏳</div>
              <div className="statistic-content">
                <div className="statistic-title">Pending PO</div>
                <div className="statistic-value">{pendingPOs}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card in-progress">
              <div className="statistic-icon">🔄</div>
              <div className="statistic-content">
                <div className="statistic-title">In Progress</div>
                <div className="statistic-value">{inProgressPOs}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card completed">
              <div className="statistic-icon">✅</div>
              <div className="statistic-content">
                <div className="statistic-title">Completed</div>
                <div className="statistic-value">{completedPOs}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card total">
              <div className="statistic-icon">💰</div>
              <div className="statistic-content">
                <div className="statistic-title">Total Value</div>
                <div className="statistic-value">Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Daftar Purchase Order">
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari PO..."
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: 200 }}
                >
                  {statuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} dari ${total} POs` }}
              rowClassName={(record) => {
                if (record.status === 'pending') return 'row-pending';
                if (record.status === 'in_progress') return 'row-in-progress';
                if (record.status === 'completed') return 'row-completed';
                if (record.status === 'cancelled') return 'row-cancelled';
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Create Purchase Order"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setSelectedPO(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedPO && (
          <Form as="form"
            form={form}
            layout="vertical"
            onFinish={handlePOSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item controlId="po_code" label="PO Code">
                  <Input disabled />
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item controlId="vendor_name" label="Vendor Name">
                  <Input disabled />
                </Form.Group>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item
                  controlId="vendor_address"
                  label="Vendor Address"
                  rules={[{ required: true, message: 'Vendor address harus diisi!' }]}
                >
                  <Input.TextArea rows={2} placeholder="Alamat lengkap vendor" />
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="vendor_contact"
                  label="Vendor Contact"
                  rules={[{ required: true, message: 'Vendor contact harus diisi!' }]}
                >
                  <Input placeholder="Nama kontak vendor" />
                </Form.Group>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form as="form".Item
                  controlId="vendor_phone"
                  label="Vendor Phone"
                  rules={[{ required: true, message: 'Vendor phone harus diisi!' }]}
                >
                  <Input placeholder="Nomor telepon vendor" />
                </Form.Group>
              </Col>
              <Col span={8}>
                <Form as="form".Item
                  controlId="vendor_email"
                  label="Vendor Email"
                  rules={[
                    { required: true, message: 'Vendor email harus diisi!' },
                    { type: 'email', message: 'Format email tidak valid!' }
                  ]}
                >
                  <Input placeholder="Email vendor" />
                </Form.Group>
              </Col>
              <Col span={8}>
                <Form as="form".Item
                  controlId="expected_delivery_date"
                  label="Expected Delivery"
                  rules={[{ required: true, message: 'Expected delivery date harus diisi!' }]}
                >
                  <Input placeholder="YYYY-MM-DD" />
                </Form.Group>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form as="form".Item
                  controlId="payment_terms"
                  label="Payment Terms"
                  rules={[{ required: true, message: 'Payment terms harus diisi!' }]}
                >
                  <Select placeholder="Pilih payment terms">
                    <Option value="Net 15 Days">Net 15 Days</Option>
                    <Option value="Net 30 Days">Net 30 Days</Option>
                    <Option value="Net 45 Days">Net 45 Days</Option>
                    <Option value="Net 60 Days">Net 60 Days</Option>
                  </Select>
                </Form.Group>
              </Col>
              <Col span={8}>
                <Form as="form".Item
                  controlId="delivery_terms"
                  label="Delivery Terms"
                  rules={[{ required: true, message: 'Delivery terms harus diisi!' }]}
                >
                  <Select placeholder="Pilih delivery terms">
                    <Option value="FOB Jakarta">FOB Jakarta</Option>
                    <Option value="DDP Jakarta">DDP Jakarta</Option>
                    <Option value="EXW">EXW</Option>
                    <Option value="CIF">CIF</Option>
                  </Select>
                </Form.Group>
              </Col>
              <Col span={8}>
                <Form as="form".Item
                  controlId="warranty_terms"
                  label="Warranty Terms"
                  rules={[{ required: true, message: 'Warranty terms harus diisi!' }]}
                >
                  <Select placeholder="Pilih warranty terms">
                    <Option value="1 year">1 year</Option>
                    <Option value="2 years">2 years</Option>
                    <Option value="3 years">3 years</Option>
                    <Option value="5 years">5 years</Option>
                  </Select>
                </Form.Group>
              </Col>
            </Row>

            <Form as="form".Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create & Send PO
                </Button>
                <Button onClick={() => setCreateModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Group>
          </Form>
        )}
      </Modal>

      <Modal
        title="Purchase Order Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedPO(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={() => handlePrint(selectedPO)}>
            Print PO
          </Button>,
          <Button key="download" icon={<DownloadOutlined />} onClick={() => message.info('Download feature coming soon')}>
            Download PDF
          </Button>
        ]}
        width={1200}
      >
        {selectedPO && (
          <div className="po-detail">
            <div className="po-header">
              <h2>PURCHASE ORDER</h2>
              <div className="po-info">
                <div className="po-code">
                  <strong>PO Number:</strong> {selectedPO.po_code}
                </div>
                <div className="po-date">
                  <strong>Date:</strong> {selectedPO.created_date}
                </div>
                <div className="po-status">
                  <strong>Status:</strong> <Tag color={getStatusColor(selectedPO.status)}>{selectedPO.status.toUpperCase()}</Tag>
                </div>
              </div>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="vendor-section">
                  <h4>Vendor Information</h4>
                  <p><strong>Vendor Name:</strong> {selectedPO.vendor_name}</p>
                  <p><strong>Address:</strong> {selectedPO.vendor_address}</p>
                  <p><strong>Contact:</strong> {selectedPO.vendor_contact}</p>
                  <p><strong>Phone:</strong> {selectedPO.vendor_phone}</p>
                  <p><strong>Email:</strong> {selectedPO.vendor_email}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="terms-section">
                  <h4>Terms & Conditions</h4>
                  <p><strong>Payment Terms:</strong> {selectedPO.payment_terms}</p>
                  <p><strong>Delivery Terms:</strong> {selectedPO.delivery_terms}</p>
                  <p><strong>Warranty Terms:</strong> {selectedPO.warranty_terms}</p>
                  <p><strong>Expected Delivery:</strong> {selectedPO.expected_delivery_date}</p>
                  {selectedPO.actual_delivery_date && (
                    <p><strong>Actual Delivery:</strong> <span style={{ color: '#52c41a' }}>{selectedPO.actual_delivery_date}</span></p>
                  )}
                </div>
              </Col>
            </Row>

            <div className="items-section">
              <h4>Items Ordered</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right' }}>Total Price</th>
                    <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Specifications</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>{item.item_name}</td>
                      <td style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right' }}>Rp {item.unit_price.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right' }}>Rp {item.total_price.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>{item.specifications}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                    <td colSpan="2" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>
                      Rp {selectedPO.total_amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Discount:</td>
                    <td colSpan="2" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold', color: '#52c41a' }}>
                      -Rp {selectedPO.discount_amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Tax (10%):</td>
                    <td colSpan="2" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>
                      Rp {selectedPO.tax_amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr style={{ background: '#f0f8ff' }}>
                    <td colSpan="3" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>TOTAL:</td>
                    <td colSpan="2" style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
                      Rp {selectedPO.final_amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="workflow-section">
              <h4>Workflow Progress</h4>
              <Steps current={selectedPO.workflow.findIndex(step => step.status === 'pending')} size="small">
                {selectedPO.workflow.map((step, index) => (
                  <Step
                    key={step.step}
                    title={step.step.replace('_', ' ').toUpperCase()}
                    description={
                      <div>
                        <div>{step.assignee}</div>
                        {step.completed_date && <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Completed: {step.completed_date}</div>}
                      </div>
                    }
                    status={step.status === 'completed' ? 'finish' : step.status === 'pending' ? 'wait' : 'process'}
                  />
                ))}
              </Steps>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
