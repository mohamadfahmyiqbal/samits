import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps, Alert } from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ApprovalMaintenance.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function ApprovalMaintenance() {
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
      approval_code: 'AP4-2024-001',
      job_request_code: 'JR-2024-001',
      title: 'Emergency Server Maintenance',
      requester: 'System Administrator',
      department: 'IT',
      priority: 'critical',
      status: 'pending',
      created_date: '2024-03-30',
      result_data: {
        work_description: 'Emergency maintenance on production server due to hardware failure',
        findings: 'Power supply unit failed, need immediate replacement',
        recommendations: 'Replace PSU and perform full system diagnostic',
        work_status: 'completed',
        completion_percentage: 100,
        labor_hours: 4,
        parts_used: [
          { part_name: 'Power Supply Unit 750W', quantity: 1, unit_price: 2500000, total_price: 2500000 }
        ],
        total_cost: 4500000,
        next_maintenance_date: '2024-04-30'
      },
      evaluation_score: 4.8,
      evaluator: 'Maintenance Manager',
      evaluation_notes: 'Excellent response time, work completed professionally',
      safety_compliance: 'compliant',
      quality_score: 4.5,
      workflow: [
        { step: 'jobrequest2', status: 'completed', assignee: 'IT Support', completed_date: '2024-03-30' },
        { step: 'result2', status: 'completed', assignee: 'Technical Team', completed_date: '2024-03-30' },
        { step: 'approval4', status: 'pending', assignee: 'Maintenance Manager', completed_date: null }
      ],
      attachments: ['maintenance_report.pdf', 'parts_invoice.pdf', 'before_after_photos.pdf']
    },
    {
      id: 2,
      approval_code: 'AP4-2024-002',
      job_request_code: 'JR-2024-002',
      title: 'Network Equipment Upgrade',
      requester: 'Network Engineer',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      created_date: '2024-03-29',
      result_data: {
        work_description: 'Upgrade network switches for better performance',
        findings: 'Old switches showing signs of wear, affecting network performance',
        recommendations: 'Install new switches and update network configuration',
        work_status: 'completed',
        completion_percentage: 100,
        labor_hours: 8,
        parts_used: [
          { part_name: 'Network Switch 24-port', quantity: 2, unit_price: 8000000, total_price: 16000000 }
        ],
        total_cost: 20000000,
        next_maintenance_date: '2024-06-29'
      },
      evaluation_score: 4.2,
      evaluator: 'Maintenance Manager',
      evaluation_notes: 'Good work quality, network performance improved significantly',
      safety_compliance: 'compliant',
      quality_score: 4.0,
      workflow: [
        { step: 'jobrequest2', status: 'completed', assignee: 'IT Support', completed_date: '2024-03-29' },
        { step: 'result2', status: 'completed', assignee: 'Technical Team', completed_date: '2024-03-30' },
        { step: 'approval4', status: 'completed', assignee: 'Maintenance Manager', completed_date: '2024-03-31' }
      ],
      attachments: ['network_upgrade_report.pdf', 'performance_test.pdf']
    },
    {
      id: 3,
      approval_code: 'AP4-2024-003',
      job_request_code: 'JR-2024-003',
      title: 'Routine HVAC Maintenance',
      requester: 'Facility Manager',
      department: 'Operations',
      priority: 'medium',
      status: 'completed',
      created_date: '2024-03-25',
      result_data: {
        work_description: 'Monthly preventive maintenance for HVAC system',
        findings: 'Filters need replacement, system running efficiently',
        recommendations: 'Continue monthly maintenance schedule',
        work_status: 'completed',
        completion_percentage: 100,
        labor_hours: 6,
        parts_used: [
          { part_name: 'HVAC Filter Set', quantity: 4, unit_price: 500000, total_price: 2000000 }
        ],
        total_cost: 3500000,
        next_maintenance_date: '2024-04-25'
      },
      evaluation_score: 3.8,
      evaluator: 'Maintenance Manager',
      evaluation_notes: 'Standard maintenance completed as scheduled',
      safety_compliance: 'compliant',
      quality_score: 3.5,
      workflow: [
        { step: 'jobrequest2', status: 'completed', assignee: 'Facility Team', completed_date: '2024-03-25' },
        { step: 'result2', status: 'completed', assignee: 'Technical Team', completed_date: '2024-03-28' },
        { step: 'approval4', status: 'completed', assignee: 'Maintenance Manager', completed_date: '2024-03-28' }
      ],
      attachments: ['hvac_maintenance_checklist.pdf']
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
          const currentStepIndex = approval.workflow.findIndex(step => step.step === 'approval4');
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
      
      message.success('Maintenance approval berhasil');
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
              step.step === 'approval4' 
                ? { ...step, status: 'rejected', completed_date: new Date().toISOString().split('T')[0] }
                : step
            )
          };
        }
        return approval;
      }));
      
      message.success('Maintenance approval ditolak');
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

  const getSafetyComplianceColor = (compliance) => {
    switch (compliance) {
      case 'compliant': return 'green';
      case 'non_compliant': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  const pendingApprovals = filteredData.filter(approval => approval.status === 'pending').length;
  const inProgressApprovals = filteredData.filter(approval => approval.status === 'in_progress').length;
  const completedApprovals = filteredData.filter(approval => approval.status === 'completed').length;
  const criticalApprovals = filteredData.filter(approval => approval.priority === 'critical' && approval.status !== 'completed').length;
  const totalCost = filteredData.reduce((sum, approval) => sum + (approval.result_data?.total_cost || 0), 0);

  const columns = [
    {
      title: 'Approval Code',
      dataIndex: 'approval_code',
      key: 'approval_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Job Request',
      dataIndex: 'job_request_code',
      key: 'job_request_code' },
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
      title: 'Total Cost',
      key: 'total_cost',
      render: (_, record) => `Rp ${(record.result_data?.total_cost || 0).toLocaleString('id-ID')}` },
    {
      title: 'Safety Compliance',
      key: 'safety_compliance',
      render: (_, record) => (
        <Tag color={getSafetyComplianceColor(record.safety_compliance)}>
          {record.safety_compliance.toUpperCase()}
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
    <div className="approval-maintenance">
      <div className="page-header">
        <h1>Maintenance Approval</h1>
        <p>Approval hasil pekerjaan maintenance dari perspektif maintenance manager</p>
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
            <div className="statistic-card critical">
              <div className="statistic-icon">🚨</div>
              <div className="statistic-content">
                <div className="statistic-title">Critical Requests</div>
                <div className="statistic-value">{criticalApprovals}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Daftar Maintenance Approval">
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari maintenance approval..."
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
        title="Maintenance Approval Detail"
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
        width={1200}
      >
        {selectedApproval && (
          <div className="approval-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Approval Information</h4>
                  <p><strong>Approval Code:</strong> {selectedApproval.approval_code}</p>
                  <p><strong>Job Request Code:</strong> {selectedApproval.job_request_code}</p>
                  <p><strong>Title:</strong> {selectedApproval.title}</p>
                  <p><strong>Priority:</strong> <Tag color={getPriorityColor(selectedApproval.priority)}>{selectedApproval.priority.toUpperCase()}</Tag></p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedApproval.status)}>{selectedApproval.status.toUpperCase()}</Tag></p>
                  <p><strong>Created Date:</strong> {selectedApproval.created_date}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Requester Information</h4>
                  <p><strong>Name:</strong> {selectedApproval.requester}</p>
                  <p><strong>Department:</strong> {selectedApproval.department}</p>
                  <p><strong>Evaluation Score:</strong> {selectedApproval.evaluation_score}/5.0</p>
                  <p><strong>Evaluator:</strong> {selectedApproval.evaluator}</p>
                  <p><strong>Safety Compliance:</strong> <Tag color={getSafetyComplianceColor(selectedApproval.safety_compliance)}>{selectedApproval.safety_compliance.toUpperCase()}</Tag></p>
                  <p><strong>Quality Score:</strong> {selectedApproval.quality_score}/5.0</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Work Result Summary</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small" title="Work Details">
                        <p><strong>Work Description:</strong> {selectedApproval.result_data?.work_description}</p>
                        <p><strong>Findings:</strong> {selectedApproval.result_data?.findings}</p>
                        <p><strong>Recommendations:</strong> {selectedApproval.result_data?.recommendations}</p>
                        <p><strong>Work Status:</strong> {selectedApproval.result_data?.work_status}</p>
                        <p><strong>Completion:</strong> {selectedApproval.result_data?.completion_percentage}%</p>
                        <p><strong>Labor Hours:</strong> {selectedApproval.result_data?.labor_hours} hours</p>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title="Cost Analysis">
                        <p><strong>Total Cost:</strong> Rp {(selectedApproval.result_data?.total_cost || 0).toLocaleString('id-ID')}</p>
                        <p><strong>Next Maintenance:</strong> {selectedApproval.result_data?.next_maintenance_date}</p>
                        <p><strong>Evaluation Notes:</strong> {selectedApproval.evaluation_notes}</p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Parts Used</h4>
                  <div className="parts-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Part Name</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Quantity</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Unit Price</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedApproval.result_data?.parts_used || []).map((part, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{part.part_name}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{part.quantity}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {part.unit_price.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {part.total_price.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                          <td style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold', color: '#1890ff' }}>
                            Rp {(selectedApproval.result_data?.total_cost || 0).toLocaleString('id-ID')}
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
                      <Tag key={index} icon={<SafetyOutlined />}>
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
