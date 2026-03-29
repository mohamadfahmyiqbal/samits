import React, { useState, useEffect } from 'react';
import {
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
  Steps } from 'antd';
import {
  ReloadOutlined,
  EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './UserApproval.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function UserApproval() {
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const mockApprovalData = [
    {
      id: 1,
      request_code: 'UA-2024-001',
      request_type: 'Asset Disposal',
      title: 'Disposal Request - Laptop Dell Latitude 5420',
      requester: 'Ahmad Wijaya',
      requester_email: 'ahmad.wijaya@company.com',
      department: 'IT',
      priority: 'medium',
      current_step: 'user_approval',
      status: 'pending',
      request_date: '2024-03-25',
      asset_details: {
        asset_code: 'AST-001',
        asset_name: 'Laptop Dell Latitude 5420',
        current_value: 2500000,
        purchase_date: '2022-01-15',
        depreciation_years: 3 },
      description: 'Laptop sudah tidak layak pakai dan sering mengalami kerusakan',
      attachments: ['disposal_form.pdf', 'asset_condition_report.pdf'],
      workflow: [
        {
          step: 'user_approval',
          status: 'pending',
          assignee: 'Department Head',
          completed_date: null },
        {
          step: 'finance_approval',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ] },
    {
      id: 2,
      request_code: 'UA-2024-002',
      request_type: 'Asset Transfer',
      title: 'Asset Transfer Request - Monitor LG 27 inch',
      requester: 'Siti Nurhaliza',
      requester_email: 'siti.nurhaliza@company.com',
      department: 'Finance',
      priority: 'high',
      current_step: 'user_approval',
      status: 'pending',
      request_date: '2024-03-26',
      asset_details: {
        asset_code: 'AST-002',
        asset_name: 'Monitor LG 27 inch',
        current_value: 3500000,
        purchase_date: '2022-06-20',
        depreciation_years: 5 },
      description: 'Transfer monitor dari Finance ke IT Department untuk kebutuhan development',
      attachments: ['transfer_form.pdf'],
      workflow: [
        {
          step: 'user_approval',
          status: 'pending',
          assignee: 'Department Head',
          completed_date: null },
        {
          step: 'finance_approval',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ] },
    {
      id: 3,
      request_code: 'UA-2024-003',
      request_type: 'Asset Write-off',
      title: 'Write-off Request - Server RAM 8GB DDR3',
      requester: 'Budi Santoso',
      requester_email: 'budi.santoso@company.com',
      department: 'Operations',
      priority: 'low',
      current_step: 'finance_approval',
      status: 'in_progress',
      request_date: '2024-03-24',
      asset_details: {
        asset_code: 'AST-003',
        asset_name: 'Server RAM 8GB DDR3',
        current_value: 500000,
        purchase_date: '2021-03-10',
        depreciation_years: 3 },
      description: 'RAM sudah tidak compatible dengan sistem baru dan tidak bisa digunakan',
      attachments: ['writeoff_form.pdf', 'technical_assessment.pdf'],
      workflow: [
        {
          step: 'user_approval',
          status: 'completed',
          assignee: 'Department Head',
          completed_date: '2024-03-25' },
        {
          step: 'finance_approval',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ] },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' },
  ];

  useEffect(() => {
    setApprovalData(mockApprovalData);
    setFilteredData(mockApprovalData);
  }, []);

  useEffect(() => {
    let filtered = approvalData.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchText.toLowerCase()) ||
        request.request_code.toLowerCase().includes(searchText.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, approvalData]);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve request

      setApprovalData((prev) =>
        prev.map((request) => {
          if (request.id === id) {
            const currentStepIndex = request.workflow.findIndex(
              (step) => step.step === request.current_step
            );
            const nextStep = request.workflow[currentStepIndex + 1];

            if (nextStep) {
              // Move to next step
              return {
                ...request,
                workflow: request.workflow.map((step, index) =>
                  index === currentStepIndex
                    ? {
                        ...step,
                        status: 'completed',
                        completed_date: new Date().toISOString().split('T')[0] }
                    : index === currentStepIndex + 1
                      ? { ...step, status: 'pending' }
                      : step
                ),
                current_step: nextStep.step,
                status: 'in_progress' };
            } else {
              // Complete the workflow
              return {
                ...request,
                workflow: request.workflow.map((step, index) =>
                  index === currentStepIndex
                    ? {
                        ...step,
                        status: 'completed',
                        completed_date: new Date().toISOString().split('T')[0] }
                    : step
                ),
                current_step: 'completed',
                status: 'completed' };
            }
          }
          return request;
        })
      );

      message.success('Request berhasil di-approve');
    } catch (error) {
      message.error('Gagal meng-approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    Modal.confirm({
      title: 'Reject Request',
      content: 'Apakah Anda yakin ingin menolak request ini?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: async () => {
        setLoading(true);
        try {
          setApprovalData((prev) =>
            prev.map((request) =>
              request.id === id ? { ...request, status: 'rejected' } : request
            )
          );
          message.success('Request berhasil ditolak');
        } catch (error) {
          message.error('Gagal menolak request');
        } finally {
          setLoading(false);
        }
      } });
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setApprovalData(mockApprovalData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
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

  const getWorkflowStep = (workflow) => {
    const currentStep = workflow.find((step) => step.status === 'pending');
    return currentStep ? currentStep.step : 'completed';
  };

  const pendingRequests = filteredData.filter((request) => request.status === 'pending').length;
  const inProgressRequests = filteredData.filter(
    (request) => request.status === 'in_progress'
  ).length;
  const completedRequests = filteredData.filter((request) => request.status === 'completed').length;

  const columns = [
    {
      title: 'Request Code',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Request Type',
      dataIndex: 'request_type',
      key: 'request_type',
      render: (type) => <Tag color='blue'>{type}</Tag> },
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
          <div>
            <strong>{record.requester}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.department}</div>
        </div>
      ) },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag> },
    {
      title: 'Current Step',
      key: 'current_step',
      render: (_, record) => {
        const step = getWorkflowStep(record.workflow);
        return step === 'completed' ? (
          <Tag color='green'>COMPLETED</Tag>
        ) : (
          <Tag color='blue'>{step.replace('_', ' ').toUpperCase()}</Tag>
        );
      } },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.replace('_', ' ').toUpperCase()}</Tag>
      ) },
    {
      title: 'Request Date',
      dataIndex: 'request_date',
      key: 'request_date' },
    {
      title: 'Action',
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
          {record.status === 'pending' && record.current_step === 'user_approval' && (
            <>
              <Button
                type='primary'
                size='small'
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={loading}
              >
                Approve
              </Button>
              <Button
                type='primary'
                danger
                size='small'
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ) },
  ];

  return (
    <div className='user-approval'>
      <div className='page-header'>
        <h1>User Approval</h1>
        <p>Management approval request dari user untuk berbagai keperluan aset</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div className='statistic-card pending'>
              <div className='statistic-icon'>⏳</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Pending Requests</div>
                <div className='statistic-value'>{pendingRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className='statistic-card in-progress'>
              <div className='statistic-icon'>🔄</div>
              <div className='statistic-content'>
                <div className='statistic-title'>In Progress</div>
                <div className='statistic-value'>{inProgressRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className='statistic-card completed'>
              <div className='statistic-icon'>✅</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Completed</div>
                <div className='statistic-value'>{completedRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title='Daftar Approval Request'>
            <div className='table-controls'>
              <Space>
                <Search
                  placeholder='Cari request...'
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
                  Refresh
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
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} requests` }}
              rowClassName={(record) => {
                if (record.status === 'pending' && record.current_step === 'user_approval')
                  return 'row-pending';
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
        title='Request Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedRequest?.status === 'pending' &&
            selectedRequest?.current_step === 'user_approval' && (
              <>
                <Button
                  key='approve'
                  type='primary'
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(selectedRequest.id)}
                  loading={loading}
                >
                  Approve
                </Button>
                <Button
                  key='reject'
                  type='primary'
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  Reject
                </Button>
              </>
            ),
        ]}
        width={1000}
      >
        {selectedRequest && (
          <div className='request-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Request Information</h4>
                  <p>
                    <strong>Request Code:</strong> {selectedRequest.request_code}
                  </p>
                  <p>
                    <strong>Request Type:</strong> {selectedRequest.request_type}
                  </p>
                  <p>
                    <strong>Title:</strong> {selectedRequest.title}
                  </p>
                  <p>
                    <strong>Priority:</strong>{' '}
                    <Tag color={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority.toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag color={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Request Date:</strong> {selectedRequest.request_date}
                  </p>
                </div>
              </Col>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Requester Information</h4>
                  <p>
                    <strong>Name:</strong> {selectedRequest.requester}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedRequest.requester_email}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedRequest.department}
                  </p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Asset Details</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p>
                        <strong>Asset Code:</strong> {selectedRequest.asset_details.asset_code}
                      </p>
                      <p>
                        <strong>Asset Name:</strong> {selectedRequest.asset_details.asset_name}
                      </p>
                      <p>
                        <strong>Current Value:</strong> Rp{' '}
                        {selectedRequest.asset_details.current_value.toLocaleString('id-ID')}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>Purchase Date:</strong>{' '}
                        {selectedRequest.asset_details.purchase_date}
                      </p>
                      <p>
                        <strong>Depreciation Years:</strong>{' '}
                        {selectedRequest.asset_details.depreciation_years}
                      </p>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Description</h4>
                  <p>{selectedRequest.description}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Workflow Progress</h4>
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
                                Completed: {step.completed_date}
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
                  <h4>Attachments</h4>
                  <div className='attachments'>
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
