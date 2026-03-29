import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps, Rate, Upload } from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  StarOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './PV.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function PV() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pvData, setPvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPV, setSelectedPV] = useState(null);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { request } = location.state || {};

  const mockPVData = [
    {
      id: 1,
      pv_code: 'PV-2024-001',
      request_code: 'REQ-2024-001',
      title: 'New Laptop Request for Development Team',
      vendor_name: 'PT. Teknologi Maju',
      vendor_rating: 4.5,
      vendor_contact: 'sales@teknologimaju.com',
      vendor_phone: '+62-21-5551234',
      items: [
        {
          item_name: 'Laptop Dell XPS 15',
          quantity: 5,
          unit_price: 18000000,
          total_price: 90000000,
          specifications: 'Intel Core i7, 16GB RAM, 512GB SSD, RTX 3060',
          warranty: '3 years',
          delivery_time: '7 days'
        }
      ],
      total_amount: 90000000,
      discount_amount: 4500000,
      tax_amount: 8550000,
      final_amount: 94050000,
      status: 'pending',
      created_date: '2024-03-30',
      evaluation_date: null,
      evaluator: null,
      evaluation_score: null,
      evaluation_notes: null,
      attachments: ['quotation.pdf', 'vendor_catalog.pdf', 'warranty_terms.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'Development Manager', completed_date: '2024-03-30' },
        { step: 'pv', status: 'pending', assignee: 'Procurement Team', completed_date: null },
        { step: 'approval2', status: 'pending', assignee: 'Finance Manager', completed_date: null },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
      ]
    },
    {
      id: 2,
      pv_code: 'PV-2024-002',
      request_code: 'REQ-2024-002',
      title: 'Server Upgrade Request',
      vendor_name: 'PT. Server Indonesia',
      vendor_rating: 4.8,
      vendor_contact: 'info@serverindo.com',
      vendor_phone: '+62-21-8885678',
      items: [
        {
          item_name: 'Server Dell PowerEdge R740',
          quantity: 2,
          unit_price: 60000000,
          total_price: 120000000,
          specifications: 'Intel Xeon Silver, 64GB RAM, 2TB SSD RAID',
          warranty: '5 years',
          delivery_time: '14 days'
        }
      ],
      total_amount: 120000000,
      discount_amount: 12000000,
      tax_amount: 10800000,
      final_amount: 118800000,
      status: 'in_progress',
      created_date: '2024-03-30',
      evaluation_date: '2024-03-31',
      evaluator: 'Procurement Manager',
      evaluation_score: 4.2,
      evaluation_notes: 'Good vendor reputation, competitive pricing, excellent warranty terms',
      attachments: ['quotation.pdf', 'technical_specs.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'IT Infrastructure Manager', completed_date: '2024-03-29' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-30' },
        { step: 'approval2', status: 'pending', assignee: 'Finance Manager', completed_date: null },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
      ]
    },
    {
      id: 3,
      pv_code: 'PV-2024-003',
      request_code: 'REQ-2024-003',
      title: 'Office Furniture Request',
      vendor_name: 'PT. Furniture Indonesia',
      vendor_rating: 4.0,
      vendor_contact: 'sales@furnitureindo.com',
      vendor_phone: '+62-21-7773456',
      items: [
        {
          item_name: 'Ergonomic Chair',
          quantity: 10,
          unit_price: 1500000,
          total_price: 15000000,
          specifications: 'Adjustable height, lumbar support, armrests',
          warranty: '2 years',
          delivery_time: '5 days'
        }
      ],
      total_amount: 15000000,
      discount_amount: 750000,
      tax_amount: 1425000,
      final_amount: 15675000,
      status: 'completed',
      created_date: '2024-03-26',
      evaluation_date: '2024-03-27',
      evaluator: 'Procurement Manager',
      evaluation_score: 3.8,
      evaluation_notes: 'Standard quality, reasonable pricing, good delivery time',
      attachments: ['quotation.pdf', 'product_catalog.pdf'],
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
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    if (request) {
      // Add new PV from request
      const newPV = {
        id: Date.now(),
        pv_code: `PV-2024-${Date.now()}`,
        request_code: request.request_code,
        title: request.title,
        vendor_name: 'To be determined',
        vendor_rating: 0,
        vendor_contact: '',
        vendor_phone: '',
        items: request.items,
        total_amount: request.total_amount,
        discount_amount: 0,
        tax_amount: request.total_amount * 0.1,
        final_amount: request.total_amount * 1.1,
        status: 'pending',
        created_date: new Date().toISOString().split('T')[0],
        evaluation_date: null,
        evaluator: null,
        evaluation_score: null,
        evaluation_notes: null,
        attachments: [],
        workflow: [
          { step: 'req_aset', status: 'completed', assignee: request.requester, completed_date: request.request_date },
          { step: 'pv', status: 'pending', assignee: 'Procurement Team', completed_date: null },
          { step: 'approval2', status: 'pending', assignee: 'Finance Manager', completed_date: null },
          { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
        ]
      };
      setPvData([newPV, ...mockPVData]);
    } else {
      setPvData(mockPVData);
    }
    setFilteredData(mockPVData);
  }, [request]);

  useEffect(() => {
    let filtered = pvData.filter(pv => {
      const matchesSearch = pv.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           pv.pv_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           pv.vendor_name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || pv.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, pvData]);

  const handleEvaluate = (pv) => {
    setSelectedPV(pv);
    form.setFieldsValue({
      pv_code: pv.pv_code,
      vendor_name: pv.vendor_name,
      vendor_rating: pv.vendor_rating,
      evaluation_score: pv.evaluation_score,
      evaluation_notes: pv.evaluation_notes
    });
    setEvaluationModalVisible(true);
  };

  const handleEvaluationSubmit = async (values) => {
    setLoading(true);
    try {
      // API call to submit evaluation

      setPvData(prev => prev.map(pv => 
        pv.id === selectedPV.id 
          ? { 
              ...pv,
              vendor_name: values.vendor_name,
              vendor_rating: values.vendor_rating,
              evaluation_score: values.evaluation_score,
              evaluation_notes: values.evaluation_notes,
              evaluation_date: new Date().toISOString().split('T')[0],
              evaluator: 'Procurement Manager',
              status: 'in_progress'
            }
          : pv
      ));
      
      message.success('PV evaluation berhasil disubmit');
      setEvaluationModalVisible(false);
      setSelectedPV(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve PV

      setPvData(prev => prev.map(pv => {
        if (pv.id === id) {
          const currentStepIndex = pv.workflow.findIndex(step => step.step === 'pv');
          const nextStep = pv.workflow[currentStepIndex + 1];
          
          if (nextStep) {
            // Move to next step
            return {
              ...pv,
              workflow: pv.workflow.map((step, index) => 
                index === currentStepIndex 
                  ? { ...step, status: 'completed', completed_date: new Date().toISOString().split('T')[0] }
                  : index === currentStepIndex + 1
                  ? { ...step, status: 'pending' }
                  : step
              ),
              status: 'in_progress'
            };
          } else {
            // Complete the workflow
            return {
              ...pv,
              workflow: pv.workflow.map((step, index) => 
                index === currentStepIndex 
                  ? { ...step, status: 'completed', completed_date: new Date().toISOString().split('T')[0] }
                  : step
              ),
              status: 'completed'
            };
          }
        }
        return pv;
      }));
      
      message.success('PV berhasil di-approve');
    } catch (error) {
      message.error('Gagal meng-approve PV');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (pv) => {
    setSelectedPV(pv);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPvData(mockPVData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#1890ff';
    if (rating >= 3.0) return '#faad14';
    return '#ff4d4f';
  };

  const pendingPVs = filteredData.filter(pv => pv.status === 'pending').length;
  const inProgressPVs = filteredData.filter(pv => pv.status === 'in_progress').length;
  const completedPVs = filteredData.filter(pv => pv.status === 'completed').length;
  const totalValue = filteredData.reduce((sum, pv) => sum + pv.final_amount, 0);

  const columns = [
    {
      title: 'PV Code',
      dataIndex: 'pv_code',
      key: 'pv_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Request Code',
      dataIndex: 'request_code',
      key: 'request_code' },
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
            <Rate disabled defaultValue={record.vendor_rating} style={{ fontSize: '12px' }} />
            <span style={{ marginLeft: 4 }}>{record.vendor_rating}</span>
          </div>
        </div>
      ) },
    {
      title: 'Total Amount',
      dataIndex: 'final_amount',
      key: 'final_amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.final_amount - b.final_amount },
    {
      title: 'Evaluation',
      key: 'evaluation',
      render: (_, record) => (
        <div>
          {record.evaluation_score ? (
            <div>
              <Rate disabled defaultValue={record.evaluation_score} style={{ fontSize: '14px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                Score: {record.evaluation_score}/5
              </div>
            </div>
          ) : (
            <Tag color="orange">Not Evaluated</Tag>
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
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<StarOutlined />}
                onClick={() => handleEvaluate(record)}
              >
                Evaluate
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={loading}
                disabled={!record.evaluation_score}
              >
                Approve
              </Button>
            </>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="pv">
      <div className="page-header">
        <h1>Price Verification (PV)</h1>
        <p>Evaluasi dan verifikasi harga vendor untuk permintaan aset</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card pending">
              <div className="statistic-icon">⏳</div>
              <div className="statistic-content">
                <div className="statistic-title">Pending Evaluation</div>
                <div className="statistic-value">{pendingPVs}</div>
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
                <div className="statistic-value">{inProgressPVs}</div>
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
                <div className="statistic-value">{completedPVs}</div>
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
          <Card title="Daftar Price Verification">
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari PV..."
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
                  `${range[0]}-${range[1]} dari ${total} PVs` }}
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
        title="PV Evaluation"
        open={evaluationModalVisible}
        onCancel={() => {
          setEvaluationModalVisible(false);
          setSelectedPV(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedPV && (
          <Form as="form"
            form={form}
            layout="vertical"
            onFinish={handleEvaluationSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item controlId="pv_code" label="PV Code">
                  <Input disabled />
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item controlId="request_code" label="Request Code">
                  <Input disabled />
                </Form.Group>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form as="form".Item
                  controlId="vendor_name"
                  label="Vendor Name"
                  rules={[{ required: true, message: 'Vendor name harus diisi!' }]}
                >
                  <Input placeholder="Nama vendor" />
                </Form.Group>
              </Col>
              <Col span={12}>
                <Form as="form".Item
                  controlId="vendor_rating"
                  label="Vendor Rating"
                  rules={[{ required: true, message: 'Vendor rating harus diisi!' }]}
                >
                  <Rate />
                </Form.Group>
              </Col>
            </Row>

            <Form as="form".Item
              controlId="evaluation_score"
              label="Evaluation Score"
              rules={[{ required: true, message: 'Evaluation score harus diisi!' }]}
            >
              <Rate />
            </Form.Group>

            <Form as="form".Item
              controlId="evaluation_notes"
              label="Evaluation Notes"
              rules={[{ required: true, message: 'Evaluation notes harus diisi!' }]}
            >
              <Input.TextArea rows={4} placeholder="Catatan evaluasi vendor dan penawaran..." />
            </Form.Group>

            <Form as="form".Item
              controlId="attachments"
              label="Upload Documents"
            >
              <Upload multiple>
                <Button icon={<UploadOutlined />}>
                  Upload Quotations & Documents
                </Button>
              </Upload>
            </Form.Group>

            <Form as="form".Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit Evaluation
                </Button>
                <Button onClick={() => setEvaluationModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Group>
          </Form>
        )}
      </Modal>

      <Modal
        title="PV Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedPV(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedPV?.status === 'pending' && (
            <>
              <Button
                key="evaluate"
                type="primary"
                icon={<StarOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleEvaluate(selectedPV);
                }}
              >
                Evaluate
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(selectedPV.id)}
                loading={loading}
                disabled={!selectedPV.evaluation_score}
              >
                Approve
              </Button>
            </>
          )
        ]}
        width={1000}
      >
        {selectedPV && (
          <div className="pv-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h4>PV Information</h4>
                  <p><strong>PV Code:</strong> {selectedPV.pv_code}</p>
                  <p><strong>Request Code:</strong> {selectedPV.request_code}</p>
                  <p><strong>Title:</strong> {selectedPV.title}</p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedPV.status)}>{selectedPV.status.toUpperCase()}</Tag></p>
                  <p><strong>Created Date:</strong> {selectedPV.created_date}</p>
                  <p><strong>Evaluation Date:</strong> {selectedPV.evaluation_date || 'Not evaluated'}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Vendor Information</h4>
                  <p><strong>Vendor Name:</strong> {selectedPV.vendor_name}</p>
                  <p><strong>Rating:</strong> 
                    <Rate disabled defaultValue={selectedPV.vendor_rating} style={{ color: getRatingColor(selectedPV.vendor_rating) }} />
                    <span style={{ marginLeft: 8 }}>{selectedPV.vendor_rating}</span>
                  </p>
                  <p><strong>Contact:</strong> {selectedPV.vendor_contact}</p>
                  <p><strong>Phone:</strong> {selectedPV.vendor_phone}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Items & Pricing</h4>
                  <div className="items-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Item Name</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Quantity</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Unit Price</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Total Price</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Specifications</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Warranty</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Delivery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPV.items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.item_name}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.quantity}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {item.unit_price.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {item.total_price.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.specifications}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.warranty}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.delivery_time}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                          <td colSpan="5" style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold' }}>
                            Rp {selectedPV.total_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Discount:</td>
                          <td colSpan="5" style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold', color: '#52c41a' }}>
                            -Rp {selectedPV.discount_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Tax (10%):</td>
                          <td colSpan="5" style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold' }}>
                            Rp {selectedPV.tax_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Final Amount:</td>
                          <td colSpan="5" style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                            Rp {selectedPV.final_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>

            {selectedPV.evaluation_score && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="detail-section">
                    <h4>Evaluation Results</h4>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <p><strong>Evaluation Score:</strong></p>
                        <Rate disabled defaultValue={selectedPV.evaluation_score} style={{ fontSize: '16px', color: getRatingColor(selectedPV.evaluation_score) }} />
                        <p style={{ marginTop: 4, fontSize: '14px', color: getRatingColor(selectedPV.evaluation_score) }}>
                          {selectedPV.evaluation_score}/5.0
                        </p>
                      </Col>
                      <Col span={8}>
                        <p><strong>Evaluator:</strong></p>
                        <p>{selectedPV.evaluator}</p>
                        <p><strong>Evaluation Date:</strong></p>
                        <p>{selectedPV.evaluation_date}</p>
                      </Col>
                      <Col span={8}>
                        <p><strong>Evaluation Notes:</strong></p>
                        <p>{selectedPV.evaluation_notes}</p>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Workflow Progress</h4>
                  <Steps current={selectedPV.workflow.findIndex(step => step.status === 'pending')} size="small">
                    {selectedPV.workflow.map((step, index) => (
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
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Attachments</h4>
                  <div className="attachments">
                    {selectedPV.attachments.map((file, index) => (
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
