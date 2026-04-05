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
  InputNumber,
} from 'antd';
import { ReloadOutlined, EyeOutlined, DollarOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './FinanceApproval.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;
const { TextArea } = Input;

export default function FinanceApproval() {
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [financeForm] = Form.useForm();

  const mockApprovalData = [
    {
      id: 1,
      request_code: 'FA-2024-001',
      request_type: 'Asset Disposal',
      title: 'Disposal Request - Laptop Dell Latitude 5420',
      requester: 'Ahmad Wijaya',
      requester_email: 'ahmad.wijaya@company.com',
      department: 'IT',
      priority: 'medium',
      current_step: 'finance_approval',
      status: 'pending',
      request_date: '2024-03-25',
      asset_details: {
        asset_code: 'AST-001',
        asset_name: 'Laptop Dell Latitude 5420',
        current_value: 2500000,
        purchase_value: 15000000,
        purchase_date: '2022-01-15',
        depreciation_years: 3,
        accumulated_depreciation: 12500000,
        book_value: 2500000,
      },
      financial_impact: {
        disposal_value: 500000,
        loss_amount: 2000000,
        tax_impact: 200000,
        net_loss: 1800000,
      },
      description: 'Laptop sudah tidak layak pakai dan sering mengalami kerusakan',
      attachments: ['disposal_form.pdf', 'asset_condition_report.pdf', 'depreciation_schedule.pdf'],
      user_approval: {
        approved_by: 'Department Head',
        approved_date: '2024-03-26',
        notes: 'Asset sudah tidak produktif dan biaya maintenance tinggi',
      },
      workflow: [
        {
          step: 'user_approval',
          status: 'completed',
          assignee: 'Department Head',
          completed_date: '2024-03-26',
        },
        {
          step: 'finance_approval',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null,
        },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ],
    },
    {
      id: 2,
      request_code: 'FA-2024-002',
      request_type: 'Asset Transfer',
      title: 'Asset Transfer Request - Monitor LG 27 inch',
      requester: 'Siti Nurhaliza',
      requester_email: 'siti.nurhaliza@company.com',
      department: 'Finance',
      priority: 'high',
      current_step: 'finance_approval',
      status: 'in_progress',
      request_date: '2024-03-26',
      asset_details: {
        asset_code: 'AST-002',
        asset_name: 'Monitor LG 27 inch',
        current_value: 3500000,
        purchase_value: 8000000,
        purchase_date: '2022-06-20',
        depreciation_years: 5,
        accumulated_depreciation: 2800000,
        book_value: 5200000,
      },
      financial_impact: {
        transfer_cost: 0,
        administrative_cost: 100000,
        tax_impact: 0,
        net_impact: -100000,
      },
      description: 'Transfer monitor dari Finance ke IT Department untuk kebutuhan development',
      attachments: ['transfer_form.pdf', 'asset_valuation_report.pdf'],
      user_approval: {
        approved_by: 'Finance Department Head',
        approved_date: '2024-03-27',
        notes: 'Transfer disetujui karena kebutuhan development lebih urgent',
      },
      workflow: [
        {
          step: 'user_approval',
          status: 'completed',
          assignee: 'Finance Department Head',
          completed_date: '2024-03-27',
        },
        {
          step: 'finance_approval',
          status: 'pending',
          assignee: 'Finance Manager',
          completed_date: null,
        },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ],
    },
    {
      id: 3,
      request_code: 'FA-2024-003',
      request_type: 'Asset Write-off',
      title: 'Write-off Request - Server RAM 8GB DDR3',
      requester: 'Budi Santoso',
      requester_email: 'budi.santoso@company.com',
      department: 'Operations',
      priority: 'low',
      current_step: 'pd_approval',
      status: 'in_progress',
      request_date: '2024-03-24',
      asset_details: {
        asset_code: 'AST-003',
        asset_name: 'Server RAM 8GB DDR3',
        current_value: 500000,
        purchase_value: 2000000,
        purchase_date: '2021-03-10',
        depreciation_years: 3,
        accumulated_depreciation: 1500000,
        book_value: 500000,
      },
      financial_impact: {
        write_off_value: 0,
        loss_amount: 500000,
        tax_impact: 50000,
        net_loss: 450000,
      },
      description: 'RAM sudah tidak compatible dengan sistem baru dan tidak bisa digunakan',
      attachments: [
        'writeoff_form.pdf',
        'technical_assessment.pdf',
        'depreciation_calculation.pdf',
      ],
      user_approval: {
        approved_by: 'Operations Head',
        approved_date: '2024-03-25',
        notes: 'Asset sudah obsolete dan tidak ada nilai residual',
      },
      finance_approval: {
        approved_by: 'Finance Manager',
        approved_date: '2024-03-28',
        notes: 'Loss amount sudah dihitung dan sesuai dengan kebijakan depresiasi',
        financial_review: 'Depreciation calculation correct, tax impact minimal',
      },
      workflow: [
        {
          step: 'user_approval',
          status: 'completed',
          assignee: 'Operations Head',
          completed_date: '2024-03-25',
        },
        {
          step: 'finance_approval',
          status: 'completed',
          assignee: 'Finance Manager',
          completed_date: '2024-03-28',
        },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null },
      ],
    },
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
                        completed_date: new Date().toISOString().split('T')[0],
                      }
                    : index === currentStepIndex + 1
                      ? { ...step, status: 'pending' }
                      : step
                ),
                current_step: nextStep.step,
                status: 'in_progress',
                finance_approval: {
                  approved_by: 'Finance Manager',
                  approved_date: new Date().toISOString().split('T')[0],
                  notes: 'Financial review completed and approved',
                  financial_review: 'All calculations verified and compliant with policies',
                },
              };
            } else {
              // Complete the workflow
              return {
                ...request,
                workflow: request.workflow.map((step, index) =>
                  index === currentStepIndex
                    ? {
                        ...step,
                        status: 'completed',
                        completed_date: new Date().toISOString().split('T')[0],
                      }
                    : step
                ),
                current_step: 'completed',
                status: 'completed',
                finance_approval: {
                  approved_by: 'Finance Manager',
                  approved_date: new Date().toISOString().split('T')[0],
                  notes: 'Financial review completed and approved',
                  financial_review: 'All calculations verified and compliant with policies',
                },
              };
            }
          }
          return request;
        })
      );

      message.success('Request berhasil di-approve oleh Finance');
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
      },
    });
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const handleFinanceReview = (request) => {
    setSelectedRequest(request);
    financeForm.setFieldsValue({
      request_code: request.request_code,
      current_book_value: request.asset_details.book_value,
      proposed_disposal_value: request.financial_impact.disposal_value || 0,
      loss_amount: request.financial_impact.loss_amount || 0,
      tax_impact: request.financial_impact.tax_impact || 0,
    });
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

  const pendingRequests = filteredData.filter(
    (request) => request.status === 'pending' && request.current_step === 'finance_approval'
  ).length;
  const inProgressRequests = filteredData.filter(
    (request) => request.status === 'in_progress'
  ).length;
  const completedRequests = filteredData.filter((request) => request.status === 'completed').length;
  const totalFinancialImpact = filteredData.reduce(
    (sum, request) => sum + (request.financial_impact.loss_amount || 0),
    0
  );

  const columns = [
    {
      title: 'Request Code',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Request Type',
      dataIndex: 'request_type',
      key: 'request_type',
      render: (type) => <Tag color='blue'>{type}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Asset',
      key: 'asset',
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.asset_details.asset_name}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Book Value: Rp {record.asset_details.book_value.toLocaleString('id-ID')}
          </div>
        </div>
      ),
    },
    {
      title: 'Financial Impact',
      key: 'financial_impact',
      render: (_, record) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            Loss: Rp {(record.financial_impact.loss_amount || 0).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Tax: Rp {(record.financial_impact.tax_impact || 0).toLocaleString('id-ID')}
          </div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>,
    },
    {
      title: 'Current Step',
      key: 'current_step',
      render: (_, record) => {
        const step = record.current_step;
        return step === 'completed' ? (
          <Tag color='green'>COMPLETED</Tag>
        ) : (
          <Tag color='blue'>{step.replace('_', ' ').toUpperCase()}</Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
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
          {record.status === 'pending' && record.current_step === 'finance_approval' && (
            <>
              <Button
                type='primary'
                size='small'
                icon={<CalculatorOutlined />}
                onClick={() => handleFinanceReview(record)}
              >
                Finance Review
              </Button>
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
      ),
    },
  ];

  return (
    <div className='finance-approval'>
      <div className='page-header'>
        <h1>Finance Approval</h1>
        <p>Review dan approval request dari perspektif finansial</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card pending'>
              <div className='statistic-icon'>⏳</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Pending Finance Review</div>
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
                <div className='statistic-title'>In Progress</div>
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
                <div className='statistic-title'>Completed</div>
                <div className='statistic-value'>{completedRequests}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card impact'>
              <div className='statistic-icon'>💰</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Loss Impact</div>
                <div className='statistic-value'>
                  Rp {totalFinancialImpact.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title='Daftar Finance Approval Request'>
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
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} requests`,
              }}
              rowClassName={(record) => {
                if (record.status === 'pending' && record.current_step === 'finance_approval')
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
        title='Finance Request Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
          financeForm.resetFields();
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedRequest?.status === 'pending' &&
            selectedRequest?.current_step === 'finance_approval' && (
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
        width={1200}
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
                  <h4>Asset Details & Valuation</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <p>
                        <strong>Asset Code:</strong> {selectedRequest.asset_details.asset_code}
                      </p>
                      <p>
                        <strong>Asset Name:</strong> {selectedRequest.asset_details.asset_name}
                      </p>
                      <p>
                        <strong>Purchase Value:</strong> Rp{' '}
                        {selectedRequest.asset_details.purchase_value.toLocaleString('id-ID')}
                      </p>
                      <p>
                        <strong>Purchase Date:</strong>{' '}
                        {selectedRequest.asset_details.purchase_date}
                      </p>
                    </Col>
                    <Col span={8}>
                      <p>
                        <strong>Depreciation Years:</strong>{' '}
                        {selectedRequest.asset_details.depreciation_years}
                      </p>
                      <p>
                        <strong>Accumulated Depreciation:</strong> Rp{' '}
                        {selectedRequest.asset_details.accumulated_depreciation.toLocaleString(
                          'id-ID'
                        )}
                      </p>
                      <p>
                        <strong>Book Value:</strong>{' '}
                        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                          Rp {selectedRequest.asset_details.book_value.toLocaleString('id-ID')}
                        </span>
                      </p>
                    </Col>
                    <Col span={8}>
                      <p>
                        <strong>Current Market Value:</strong> Rp{' '}
                        {(selectedRequest.asset_details.current_value || 0).toLocaleString('id-ID')}
                      </p>
                      <p>
                        <strong>Depreciation Method:</strong> Straight Line
                      </p>
                      <p>
                        <strong>Annual Depreciation:</strong> Rp{' '}
                        {(
                          selectedRequest.asset_details.purchase_value /
                          selectedRequest.asset_details.depreciation_years
                        ).toLocaleString('id-ID')}
                      </p>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Financial Impact Analysis</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size='small' title='Gain/Loss Calculation'>
                        <p>
                          <strong>Book Value:</strong> Rp{' '}
                          {selectedRequest.asset_details.book_value.toLocaleString('id-ID')}
                        </p>
                        <p>
                          <strong>Disposal/Transfer Value:</strong> Rp{' '}
                          {(selectedRequest.financial_impact.disposal_value || 0).toLocaleString(
                            'id-ID'
                          )}
                        </p>
                        <p>
                          <strong>Loss Amount:</strong>{' '}
                          <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                            Rp{' '}
                            {(selectedRequest.financial_impact.loss_amount || 0).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size='small' title='Tax Impact'>
                        <p>
                          <strong>Tax on Gain/Loss:</strong> Rp{' '}
                          {(selectedRequest.financial_impact.tax_impact || 0).toLocaleString(
                            'id-ID'
                          )}
                        </p>
                        <p>
                          <strong>Tax Rate:</strong> 10%
                        </p>
                        <p>
                          <strong>Net Tax Impact:</strong>{' '}
                          <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                            Rp{' '}
                            {(selectedRequest.financial_impact.tax_impact || 0).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size='small' title='Net Impact'>
                        <p>
                          <strong>Administrative Cost:</strong> Rp{' '}
                          {(
                            selectedRequest.financial_impact.administrative_cost || 0
                          ).toLocaleString('id-ID')}
                        </p>
                        <p>
                          <strong>Net Loss/Gain:</strong>{' '}
                          <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                            Rp{' '}
                            {(
                              (selectedRequest.financial_impact.loss_amount || 0) +
                              (selectedRequest.financial_impact.tax_impact || 0) +
                              (selectedRequest.financial_impact.administrative_cost || 0)
                            ).toLocaleString('id-ID')}
                          </span>
                        </p>
                      </Card>
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

            {selectedRequest.user_approval && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className='detail-section'>
                    <h4>User Approval Details</h4>
                    <p>
                      <strong>Approved By:</strong> {selectedRequest.user_approval.approved_by}
                    </p>
                    <p>
                      <strong>Approved Date:</strong> {selectedRequest.user_approval.approved_date}
                    </p>
                    <p>
                      <strong>Notes:</strong> {selectedRequest.user_approval.notes}
                    </p>
                  </div>
                </Col>
              </Row>
            )}

            {selectedRequest.finance_approval && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className='detail-section'>
                    <h4>Finance Approval Details</h4>
                    <p>
                      <strong>Approved By:</strong> {selectedRequest.finance_approval.approved_by}
                    </p>
                    <p>
                      <strong>Approved Date:</strong>{' '}
                      {selectedRequest.finance_approval.approved_date}
                    </p>
                    <p>
                      <strong>Notes:</strong> {selectedRequest.finance_approval.notes}
                    </p>
                    <p>
                      <strong>Financial Review:</strong>{' '}
                      {selectedRequest.finance_approval.financial_review}
                    </p>
                  </div>
                </Col>
              </Row>
            )}

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

            {selectedRequest.status === 'pending' &&
              selectedRequest.current_step === 'finance_approval' && (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div className='detail-section'>
                      <h4>Finance Review Form</h4>
                      <Form form={financeForm} layout='vertical'>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Form.Item name='current_book_value' label='Current Book Value (Rp)'>
                              <InputNumber style={{ width: '100%' }} disabled />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name='proposed_disposal_value'
                              label='Proposed Disposal Value (Rp)'
                            >
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name='loss_amount' label='Loss Amount (Rp)'>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item name='tax_impact' label='Tax Impact (Rp)'>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name='administrative_cost' label='Administrative Cost (Rp)'>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item name='financial_review_notes' label='Financial Review Notes'>
                          <TextArea rows={3} placeholder='Enter your financial review notes...' />
                        </Form.Item>
                      </Form>
                    </div>
                  </Col>
                </Row>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
}
