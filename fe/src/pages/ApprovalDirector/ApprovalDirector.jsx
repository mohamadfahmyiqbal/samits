import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps } from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  SolutionOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ApprovalDirector.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function ApprovalDirector() {
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [form] = Form.useForm();

  const mockApprovalData = [
    {
      id: 1,
      approval_code: 'APD-2024-001',
      user_request_code: 'UR-2024-001',
      title: 'New Employee Onboarding Request',
      requester: 'HR Manager',
      department: 'HR',
      priority: 'high',
      status: 'pending',
      created_date: '2024-03-30',
      request_data: {
        employee_name: 'John Doe',
        position: 'Senior Developer',
        department: 'IT',
        start_date: '2024-04-01',
        required_equipment: ['Laptop', 'Monitor', 'Phone'],
        access_level: 'full',
        training_required: ['Security Training', 'System Training']
      },
      evaluation_score: 4.2,
      evaluator: 'HR Director',
      evaluation_notes: 'Good candidate, meets all requirements',
      budget_impact: 15000000,
      strategic_importance: 'high',
      workflow: [
        { step: 'user_approval', status: 'completed', assignee: 'Department Head', completed_date: '2024-03-30' },
        { step: 'finance_approval', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-30' },
        { step: 'pd_approval', status: 'pending', assignee: 'Director', completed_date: null }
      ],
      attachments: ['candidate_resume.pdf', 'interview_notes.pdf', 'background_check.pdf']
    },
    {
      id: 2,
      approval_code: 'APD-2024-002',
      user_request_code: 'UR-2024-002',
      title: 'Department Budget Increase Request',
      requester: 'Finance Manager',
      department: 'Finance',
      priority: 'critical',
      status: 'in_progress',
      created_date: '2024-03-29',
      request_data: {
        department: 'Marketing',
        current_budget: 500000000,
        requested_increase: 100000000,
        new_budget: 600000000,
        justification: 'Q2 marketing campaign expansion',
        roi_projection: '250%',
        timeline: '6 months'
      },
      evaluation_score: 4.5,
      evaluator: 'Finance Director',
      evaluation_notes: 'Strong ROI projection, strategic alignment confirmed',
      budget_impact: 100000000,
      strategic_importance: 'critical',
      workflow: [
        { step: 'user_approval', status: 'completed', assignee: 'Finance Head', completed_date: '2024-03-29' },
        { step: 'finance_approval', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-30' },
        { step: 'pd_approval', status: 'completed', assignee: 'Director', completed_date: '2024-03-31' }
      ],
      attachments: ['budget_proposal.pdf', 'roi_analysis.pdf', 'strategic_plan.pdf']
    },
    {
      id: 3,
      approval_code: 'APD-2024-003',
      user_request_code: 'UR-2024-003',
      title: 'New Software License Purchase',
      requester: 'IT Manager',
      department: 'IT',
      priority: 'medium',
      status: 'completed',
      created_date: '2024-03-25',
      request_data: {
        software_name: 'Microsoft Office 365 Business',
        license_count: 100,
        annual_cost: 12000000,
        current_solution: 'Office 2019',
        benefits: ['Cloud integration', 'Collaboration tools', 'Security updates'],
        vendor: 'Microsoft'
      },
      evaluation_score: 3.8,
      evaluator: 'IT Director',
      evaluation_notes: 'Standard upgrade, cost-effective solution',
      budget_impact: 12000000,
      strategic_importance: 'medium',
      workflow: [
        { step: 'user_approval', status: 'completed', assignee: 'IT Head', completed_date: '2024-03-25' },
        { step: 'finance_approval', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-26' },
        { step: 'pd_approval', status: 'completed', assignee: 'Director', completed_date: '2024-03-27' }
      ],
      attachments: ['software_comparison.pdf', 'vendor_quote.pdf', 'implementation_plan.pdf']
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
    setApprovalData(mockApprovalData);
    setFilteredData(mockApprovalData);
  }, []);

  useEffect(() => {
    let filtered = approvalData.filter(approval => {
      const matchesSearch = approval.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           approval.approval_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           approval.requester.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, approvalData]);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve

      setApprovalData(prev => prev.map(approval => {
        if (approval.id === id) {
          const currentStepIndex = approval.workflow.findIndex(step => step.step === 'pd_approval');
          const nextStep = approval.workflow[currentStepIndex + 1];
          
          if (nextStep) {
            return {
              ...approval,
              workflow: approval.workflow.map((step, index) => 
                index === currentStepIndex 
                  ? { ...step, status: 'completed', completed_date: new Date().toISOString().split('T')[0] }
                  : index === currentStepIndex + 1
                  ? { ...step, status: 'pending' }
                  : step
              ),
              status: 'in_progress'
            };
          } else {
            return {
              ...approval,
              workflow: approval.workflow.map((step, index) => 
                index === currentStepIndex 
                  ? { ...step, status: 'completed', completed_date: new Date().toISOString().split('T')[0] }
                  : step
              ),
              status: 'completed'
            };
          }
        }
        return approval;
      }));
      
      message.success('Director approval berhasil');
    } catch (error) {
      message.error('Gagal meng-approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      setApprovalData(prev => prev.map(approval => {
        if (approval.id === id) {
          return {
            ...approval,
            status: 'rejected',
            workflow: approval.workflow.map((step, index) => 
              step.step === 'pd_approval' 
                ? { ...step, status: 'rejected', completed_date: new Date().toISOString().split('T')[0] }
                : step
            )
          };
        }
        return approval;
      }));
      
      message.success('Director approval ditolak');
    } catch (error) {
      message.error('Gagal menolak approval');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (approval) => {
    setSelectedApproval(approval);
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
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'green';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'default';
    }
  };

  const getStrategicImportanceColor = (importance) => {
    switch (importance) {
      case 'low': return 'green';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'default';
    }
  };

  const pendingApprovals = filteredData.filter(approval => approval.status === 'pending').length;
  const inProgressApprovals = filteredData.filter(approval => approval.status === 'in_progress').length;
  const completedApprovals = filteredData.filter(approval => approval.status === 'completed').length;
  const criticalApprovals = filteredData.filter(approval => approval.priority === 'critical' && approval.status !== 'completed').length;
  const totalBudgetImpact = filteredData.reduce((sum, approval) => sum + (approval.budget_impact || 0), 0);

  const columns = [
    {
      title: 'Approval Code',
      dataIndex: 'approval_code',
      key: 'approval_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'User Request',
      dataIndex: 'user_request_code',
      key: 'user_request_code' },
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
      title: 'Budget Impact',
      dataIndex: 'budget_impact',
      key: 'budget_impact',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.budget_impact - b.budget_impact },
    {
      title: 'Strategic Importance',
      key: 'strategic_importance',
      render: (_, record) => (
        <Tag color={getStrategicImportanceColor(record.strategic_importance)}>
          {record.strategic_importance.toUpperCase()}
        </Tag>
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
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={loading}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record.id)}
                loading={loading}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="approval-director">
      <div className="page-header">
        <h1>Director Approval</h1>
        <p>Final approval dari perspektif Director untuk strategic decisions</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card pending">
              <div className="statistic-icon">⏳</div>
              <div className="statistic-content">
                <div className="statistic-title">Pending Approval</div>
                <div className="statistic-value">{pendingApprovals}</div>
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
                <div className="statistic-value">{inProgressApprovals}</div>
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
                <div className="statistic-value">{completedApprovals}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card total">
              <div className="statistic-icon">💰</div>
              <div className="statistic-content">
                <div className="statistic-title">Total Budget Impact</div>
                <div className="statistic-value">Rp {totalBudgetImpact.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Daftar Director Approval">
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari director approval..."
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
                  `${range[0]}-${range[1]} dari ${total} approvals` }}
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
        title="Director Approval Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedApproval(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedApproval?.status === 'pending' && (
            <>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleApprove(selectedApproval.id);
                }}
                loading={loading}
              >
                Approve
              </Button>
              <Button
                key="reject"
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleReject(selectedApproval.id);
                }}
                loading={loading}
              >
                Reject
              </Button>
            </>
          )
        ]}
        width={1000}
      >
        {selectedApproval && (
          <div className="approval-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Approval Information</h4>
                  <p><strong>Approval Code:</strong> {selectedApproval.approval_code}</p>
                  <p><strong>User Request Code:</strong> {selectedApproval.user_request_code}</p>
                  <p><strong>Title:</strong> {selectedApproval.title}</p>
                  <p><strong>Priority:</strong> <Tag color={getPriorityColor(selectedApproval.priority)}>{selectedApproval.priority.toUpperCase()}</Tag></p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedApproval.status)}>{selectedApproval.status.toUpperCase()}</Tag></p>
                  <p><strong>Created Date:</strong> {selectedApproval.created_date}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Strategic Evaluation</h4>
                  <p><strong>Evaluation Score:</strong> {selectedApproval.evaluation_score}/5.0</p>
                  <p><strong>Evaluator:</strong> {selectedApproval.evaluator}</p>
                  <p><strong>Budget Impact:</strong> Rp {selectedApproval.budget_impact.toLocaleString('id-ID')}</p>
                  <p><strong>Strategic Importance:</strong> <Tag color={getStrategicImportanceColor(selectedApproval.strategic_importance)}>{selectedApproval.strategic_importance.toUpperCase()}</Tag></p>
                  <p><strong>Evaluation Notes:</strong> {selectedApproval.evaluation_notes}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Request Details</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small" title="Basic Information">
                        <p><strong>Requester:</strong> {selectedApproval.requester}</p>
                        <p><strong>Department:</strong> {selectedApproval.department}</p>
                        <p><strong>Request Date:</strong> {selectedApproval.created_date}</p>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title="Request Data">
                        {Object.entries(selectedApproval.request_data || {}).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> 
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </p>
                        ))}
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Workflow Progress</h4>
                  <Steps current={selectedApproval.workflow.findIndex(step => step.status === 'pending')} size="small">
                    {selectedApproval.workflow.map((step, index) => (
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
                    {selectedApproval.attachments.map((file, index) => (
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
