import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps } from 'antd';
import { 
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './JobRequestAbnormality.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function JobRequestAbnormality() {
  const navigate = useNavigate();
  const [jobRequestData, setJobRequestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockJobRequestData = [
    {
      id: 1,
      request_code: 'JR-2024-001',
      title: 'Emergency Server Maintenance',
      description: 'Server production down, need immediate maintenance',
      requester: 'System Administrator',
      requester_email: 'admin@company.com',
      department: 'IT',
      priority: 'critical',
      status: 'pending',
      request_date: '2024-03-30',
      required_date: '2024-03-30',
      asset_affected: 'Server PROD-001',
      location: 'Data Center Lantai 2',
      estimated_duration: 4,
      required_skills: ['Server Maintenance', 'Hardware Repair', 'Emergency Response'],
      attachments: ['server_logs.pdf', 'error_report.pdf'],
      workflow: [
        { step: 'initial_assessment', status: 'completed', assignee: 'IT Support', completed_date: '2024-03-30' },
        { step: 'approval4', status: 'pending', assignee: 'Maintenance Manager', completed_date: null },
        { step: 'result2', status: 'pending', assignee: 'Technical Team', completed_date: null }
      ]
    },
    {
      id: 2,
      request_code: 'JR-2024-002',
      title: 'Network Equipment Upgrade',
      description: 'Upgrade network switches for better performance',
      requester: 'Network Engineer',
      requester_email: 'network@company.com',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      request_date: '2024-03-29',
      required_date: '2024-04-02',
      asset_affected: 'Network Switch SW-001, SW-002',
      location: 'Server Room Lantai 1',
      estimated_duration: 8,
      required_skills: ['Network Configuration', 'Hardware Installation'],
      attachments: ['network_diagram.pdf', 'upgrade_plan.pdf'],
      workflow: [
        { step: 'initial_assessment', status: 'completed', assignee: 'IT Support', completed_date: '2024-03-29' },
        { step: 'approval4', status: 'completed', assignee: 'Maintenance Manager', completed_date: '2024-03-30' },
        { step: 'result2', status: 'pending', assignee: 'Technical Team', completed_date: null }
      ]
    },
    {
      id: 3,
      request_code: 'JR-2024-003',
      title: 'Routine HVAC Maintenance',
      description: 'Monthly preventive maintenance for HVAC system',
      requester: 'Facility Manager',
      requester_email: 'facility@company.com',
      department: 'Operations',
      priority: 'medium',
      status: 'completed',
      request_date: '2024-03-25',
      required_date: '2024-03-28',
      asset_affected: 'HVAC System Main Building',
      location: 'Building Mechanical Room',
      estimated_duration: 6,
      required_skills: ['HVAC Maintenance', 'Electrical Safety'],
      attachments: ['maintenance_checklist.pdf'],
      workflow: [
        { step: 'initial_assessment', status: 'completed', assignee: 'Facility Team', completed_date: '2024-03-25' },
        { step: 'approval4', status: 'completed', assignee: 'Maintenance Manager', completed_date: '2024-03-26' },
        { step: 'result2', status: 'completed', assignee: 'Technical Team', completed_date: '2024-03-28' }
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

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' }
  ];

  useEffect(() => {
    setJobRequestData(mockJobRequestData);
    setFilteredData(mockJobRequestData);
  }, []);

  useEffect(() => {
    let filtered = jobRequestData.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           request.request_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           request.requester.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, jobRequestData]);

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // API call to create job request

      const newRequest = {
        id: Date.now(),
        request_code: `JR-2024-${Date.now()}`,
        ...values,
        status: 'pending',
        request_date: new Date().toISOString().split('T')[0],
        workflow: [
          { step: 'initial_assessment', status: 'pending', assignee: 'IT Support', completed_date: null },
          { step: 'approval4', status: 'pending', assignee: 'Maintenance Manager', completed_date: null },
          { step: 'result2', status: 'pending', assignee: 'Technical Team', completed_date: null }
        ]
      };
      
      setJobRequestData(prev => [newRequest, ...prev]);
      message.success('Abnormality job request berhasil dibuat');
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Gagal membuat job request');
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
      setJobRequestData(mockJobRequestData);
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

  const getPriorityColor = (priority) => {
    const found = priorities.find(p => p.value === priority);
    return found ? found.color : 'default';
  };

  const getCurrentStep = (workflow) => {
    const pendingStep = workflow.find(step => step.status === 'pending');
    return pendingStep ? pendingStep.step : 'completed';
  };

  const pendingRequests = filteredData.filter(request => request.status === 'pending').length;
  const inProgressRequests = filteredData.filter(request => request.status === 'in_progress').length;
  const completedRequests = filteredData.filter(request => request.status === 'completed').length;
  const criticalRequests = filteredData.filter(request => request.priority === 'critical' && request.status !== 'completed').length;

  const columns = [
    {
      title: 'Request Code',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true },
    {
      title: 'Requester',
      key: 'requester',
      render: (_, record) => (
        <div>
          <div><strong>{record.requester}</strong></div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.department}
          </div>
        </div>
      ) },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ) },
    {
      title: 'Asset Affected',
      dataIndex: 'asset_affected',
      key: 'asset_affected',
      ellipsis: true },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div>{record.estimated_duration} hours</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Due: {record.required_date}
          </div>
        </div>
      ) },
    {
      title: 'Current Step',
      key: 'current_step',
      render: (_, record) => {
        const step = getCurrentStep(record.workflow);
        return step === 'completed' ? 
          <Tag color="green">COMPLETED</Tag> : 
          <Tag color="blue">{step.replace('_', ' ').toUpperCase()}</Tag>;
      } },
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
            <Button
              type="primary"
              size="small"
              icon={<ToolOutlined />}
              onClick={() => navigate('/result2', { state: { request: record } })}
            >
              Process
            </Button>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="job-request-abnormality">
      <div className="page-header">
        <h1>Abnormality Job Request</h1>
        <p>Management abnormality job request untuk maintenance dan technical support</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card pending">
              <div className="statistic-icon">⏳</div>
              <div className="statistic-content">
                <div className="statistic-title">Pending Requests</div>
                <div className="statistic-value">{pendingRequests}</div>
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
                <div className="statistic-value">{inProgressRequests}</div>
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
                <div className="statistic-value">{completedRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card critical">
              <div className="statistic-icon">🚨</div>
              <div className="statistic-content">
                <div className="statistic-title">Critical Requests</div>
                <div className="statistic-value">{criticalRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Daftar Abnormality Job Request"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Create Request
              </Button>
            }
          >
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari abnormality job request..."
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
                  `${range[0]}-${range[1]} dari ${total} requests` }}
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
        title="Create Abnormality Job Request"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form as="form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form as="form".Item
                controlId="title"
                label="Request Title"
                rules={[{ required: true, message: 'Title harus diisi!' }]}
              >
                <Input placeholder="Masukkan title abnormality request" />
              </Form.Group>
            </Col>
            <Col span={12}>
              <Form as="form".Item
                controlId="priority"
                label="Priority"
                rules={[{ required: true, message: 'Priority harus diisi!' }]}
              >
                <Select placeholder="Pilih priority">
                  {priorities.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      {priority.label}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
          </Row>

          <Form as="form".Item
            controlId="description"
            label="Description"
            rules={[{ required: true, message: 'Description harus diisi!' }]}
          >
            <Input.TextArea rows={4} placeholder="Deskripsikan abnormality request secara detail..." />
          </Form.Group>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form as="form".Item
                controlId="requester"
                label="Requester Name"
                rules={[{ required: true, message: 'Requester name harus diisi!' }]}
              >
                <Input placeholder="Nama requester" />
              </Form.Group>
            </Col>
            <Col span={12}>
              <Form as="form".Item
                controlId="requester_email"
                label="Requester Email"
                rules={[
                  { required: true, message: 'Email harus diisi!' },
                  { type: 'email', message: 'Format email tidak valid!' }
                ]}
              >
                <Input placeholder="email@company.com" />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form as="form".Item
                controlId="department"
                label="Department"
                rules={[{ required: true, message: 'Department harus diisi!' }]}
              >
                <Select placeholder="Pilih department">
                  <Option value="IT">IT</Option>
                  <Option value="Operations">Operations</Option>
                  <Option value="Finance">Finance</Option>
                  <Option value="HR">HR</Option>
                  <Option value="Marketing">Marketing</Option>
                </Select>
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="required_date"
                label="Required Date"
                rules={[{ required: true, message: 'Required date harus diisi!' }]}
              >
                <Input placeholder="YYYY-MM-DD" />
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="estimated_duration"
                label="Estimated Duration (hours)"
                rules={[{ required: true, message: 'Duration harus diisi!' }]}
              >
                <Input type="number" placeholder="4" />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form as="form".Item
                controlId="asset_affected"
                label="Asset Affected"
                rules={[{ required: true, message: 'Asset affected harus diisi!' }]}
              >
                <Input placeholder="Asset yang terpengaruh" />
              </Form.Group>
            </Col>
            <Col span={12}>
              <Form as="form".Item
                controlId="location"
                label="Location"
                rules={[{ required: true, message: 'Location harus diisi!' }]}
              >
                <Input placeholder="Lokasi pekerjaan" />
              </Form.Group>
            </Col>
          </Row>

          <Form as="form".Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Request
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Group>
        </Form>
      </Modal>

      <Modal
        title="Abnormality Job Request Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedRequest?.status === 'pending' && (
            <Button
              key="process"
              type="primary"
              icon={<ToolOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                navigate('/result2', { state: { request: selectedRequest } });
              }}
            >
              Process Request
            </Button>
          )
        ]}
        width={1000}
      >
        {selectedRequest && (
          <div className="request-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Request Information</h4>
                  <p><strong>Request Code:</strong> {selectedRequest.request_code}</p>
                  <p><strong>Title:</strong> {selectedRequest.title}</p>
                  <p><strong>Priority:</strong> <Tag color={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority.toUpperCase()}</Tag></p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedRequest.status)}>{selectedRequest.status.toUpperCase()}</Tag></p>
                  <p><strong>Request Date:</strong> {selectedRequest.request_date}</p>
                  <p><strong>Required Date:</strong> {selectedRequest.required_date}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Requester Information</h4>
                  <p><strong>Name:</strong> {selectedRequest.requester}</p>
                  <p><strong>Email:</strong> {selectedRequest.requester_email}</p>
                  <p><strong>Department:</strong> {selectedRequest.department}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Job Details</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p><strong>Asset Affected:</strong> {selectedRequest.asset_affected}</p>
                      <p><strong>Location:</strong> {selectedRequest.location}</p>
                      <p><strong>Estimated Duration:</strong> {selectedRequest.estimated_duration} hours</p>
                    </Col>
                    <Col span={12}>
                      <p><strong>Required Skills:</strong></p>
                      <div className="skills-tags">
                        {selectedRequest.required_skills.map((skill, index) => (
                          <Tag key={index} color="blue">{skill}</Tag>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedRequest.description}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Workflow Progress</h4>
                  <Steps current={selectedRequest.workflow.findIndex(step => step.status === 'pending')} size="small">
                    {selectedRequest.workflow.map((step, index) => (
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
                    {selectedRequest.attachments.map((file, index) => (
                      <Tag key={index} icon={<EyeOutlined />}>
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
