import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Steps, Alert } from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  CalculatorOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './ApprovalFinance.css';

const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;

export default function ApprovalFinance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pv } = location.state || {};

  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [financeForm] = Form.useForm();

  const mockApprovalData = [
    {
      id: 1,
      approval_code: 'AP2-2024-001',
      pv_code: 'PV-2024-001',
      request_code: 'REQ-2024-001',
      title: 'New Laptop Request for Development Team',
      vendor_name: 'PT. Teknologi Maju',
      total_amount: 90000000,
      discount_amount: 4500000,
      tax_amount: 8550000,
      final_amount: 94050000,
      budget_code: 'IT-2024-DEV-001',
      budget_remaining: 120000000,
      status: 'pending',
      created_date: '2024-03-31',
      evaluation_score: 4.5,
      evaluator: 'Procurement Manager',
      evaluation_notes: 'Good vendor reputation, competitive pricing',
      items: [
        {
          item_name: 'Laptop Dell XPS 15',
          quantity: 5,
          unit_price: 18000000,
          total_price: 90000000,
          specifications: 'Intel Core i7, 16GB RAM, 512GB SSD, RTX 3060'
        }
      ],
      financial_analysis: {
        budget_compliance: 'compliant',
        cost_benefit_score: 4.2,
        roi_estimate: '18 months',
        depreciation_years: 3,
        annual_depreciation: 31350000
      },
      attachments: ['pv_evaluation.pdf', 'budget_analysis.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'Development Manager', completed_date: '2024-03-30' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-30' },
        { step: 'approval_finance', status: 'pending', assignee: 'Finance Manager', completed_date: null },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
      ]
    },
    {
      id: 2,
      approval_code: 'AP2-2024-002',
      pv_code: 'PV-2024-002',
      request_code: 'REQ-2024-002',
      title: 'Server Upgrade Request',
      vendor_name: 'PT. Server Indonesia',
      total_amount: 120000000,
      discount_amount: 12000000,
      tax_amount: 10800000,
      final_amount: 118800000,
      budget_code: 'IT-2024-INFRA-001',
      budget_remaining: 150000000,
      status: 'in_progress',
      created_date: '2024-03-31',
      evaluation_score: 4.2,
      evaluator: 'Procurement Manager',
      evaluation_notes: 'Excellent vendor, competitive pricing',
      items: [
        {
          item_name: 'Server Dell PowerEdge R740',
          quantity: 2,
          unit_price: 60000000,
          total_price: 120000000,
          specifications: 'Intel Xeon Silver, 64GB RAM, 2TB SSD RAID'
        }
      ],
      financial_analysis: {
        budget_compliance: 'compliant',
        cost_benefit_score: 4.5,
        roi_estimate: '24 months',
        depreciation_years: 5,
        annual_depreciation: 23760000
      },
      attachments: ['pv_evaluation.pdf', 'financial_analysis.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'IT Infrastructure Manager', completed_date: '2024-03-29' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-30' },
        { step: 'approval_finance', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-31' },
        { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
      ]
    },
    {
      id: 3,
      approval_code: 'AP2-2024-003',
      pv_code: 'PV-2024-003',
      request_code: 'REQ-2024-003',
      title: 'Office Furniture Request',
      vendor_name: 'PT. Furniture Indonesia',
      total_amount: 15000000,
      discount_amount: 750000,
      tax_amount: 1425000,
      final_amount: 15675000,
      budget_code: 'HR-2024-OFFICE-001',
      budget_remaining: 50000000,
      status: 'completed',
      created_date: '2024-03-27',
      evaluation_score: 3.8,
      evaluator: 'Procurement Manager',
      evaluation_notes: 'Standard quality, reasonable pricing',
      items: [
        {
          item_name: 'Ergonomic Chair',
          quantity: 10,
          unit_price: 1500000,
          total_price: 15000000,
          specifications: 'Adjustable height, lumbar support, armrests'
        }
      ],
      financial_analysis: {
        budget_compliance: 'compliant',
        cost_benefit_score: 3.5,
        roi_estimate: '36 months',
        depreciation_years: 5,
        annual_depreciation: 3135000
      },
      attachments: ['pv_evaluation.pdf', 'budget_check.pdf'],
      workflow: [
        { step: 'req_aset', status: 'completed', assignee: 'HR Manager', completed_date: '2024-03-25' },
        { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: '2024-03-26' },
        { step: 'approval_finance', status: 'completed', assignee: 'Finance Manager', completed_date: '2024-03-27' },
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
    if (pv) {
      // Add new approval from PV
      const newApproval = {
        id: Date.now(),
        approval_code: `AP2-2024-${Date.now()}`,
        pv_code: pv.pv_code,
        request_code: pv.request_code,
        title: pv.title,
        vendor_name: pv.vendor_name,
        total_amount: pv.total_amount,
        discount_amount: pv.discount_amount,
        tax_amount: pv.tax_amount,
        final_amount: pv.final_amount,
        budget_code: 'IT-2024-DEFAULT',
        budget_remaining: 200000000,
        status: 'pending',
        created_date: new Date().toISOString().split('T')[0],
        evaluation_score: pv.evaluation_score,
        evaluator: pv.evaluator,
        evaluation_notes: pv.evaluation_notes,
        items: pv.items,
        financial_analysis: {
          budget_compliance: 'pending',
          cost_benefit_score: 0,
          roi_estimate: 'pending',
          depreciation_years: 3,
          annual_depreciation: pv.final_amount / 3
        },
        attachments: pv.attachments,
        workflow: [
          { step: 'req_aset', status: 'completed', assignee: 'Requester', completed_date: new Date().toISOString().split('T')[0] },
          { step: 'pv', status: 'completed', assignee: 'Procurement Team', completed_date: new Date().toISOString().split('T')[0] },
          { step: 'approval_finance', status: 'pending', assignee: 'Finance Manager', completed_date: null },
          { step: 'po', status: 'pending', assignee: 'Procurement Manager', completed_date: null }
        ]
      };
      setApprovalData([newApproval, ...mockApprovalData]);
    } else {
      setApprovalData(mockApprovalData);
    }
    setFilteredData(mockApprovalData);
  }, [pv]);

  useEffect(() => {
    let filtered = approvalData.filter(approval => {
      const matchesSearch = approval.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           approval.approval_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           approval.vendor_name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, approvalData]);

  const handleFinanceAnalysis = (approval) => {
    setSelectedApproval(approval);
    financeForm.setFieldsValue({
      approval_code: approval.approval_code,
      budget_compliance: approval.financial_analysis.budget_compliance,
      cost_benefit_score: approval.financial_analysis.cost_benefit_score,
      roi_estimate: approval.financial_analysis.roi_estimate,
      depreciation_years: approval.financial_analysis.depreciation_years,
      annual_depreciation: approval.financial_analysis.annual_depreciation
    });
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve

      setApprovalData(prev => prev.map(approval => {
        if (approval.id === id) {
          const currentStepIndex = approval.workflow.findIndex(step => step.step === 'approval_finance');
          const nextStep = approval.workflow[currentStepIndex + 1];
          
          if (nextStep) {
            // Move to next step
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
            // Complete the workflow
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
      
      message.success('Finance approval berhasil');
    } catch (error) {
      message.error('Gagal meng-approve');
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

  const getBudgetComplianceColor = (compliance) => {
    switch (compliance) {
      case 'compliant': return 'green';
      case 'exceeded': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  const pendingApprovals = filteredData.filter(approval => approval.status === 'pending').length;
  const inProgressApprovals = filteredData.filter(approval => approval.status === 'in_progress').length;
  const completedApprovals = filteredData.filter(approval => approval.status === 'completed').length;
  const totalValue = filteredData.reduce((sum, approval) => sum + approval.final_amount, 0);

  const columns = [
    {
      title: 'Approval Code',
      dataIndex: 'approval_code',
      key: 'approval_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'PV Code',
      dataIndex: 'pv_code',
      key: 'pv_code' },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name' },
    {
      title: 'Final Amount',
      dataIndex: 'final_amount',
      key: 'final_amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.final_amount - b.final_amount },
    {
      title: 'Budget Status',
      key: 'budget_status',
      render: (_, record) => (
        <div>
          <Tag color={getBudgetComplianceColor(record.financial_analysis.budget_compliance)}>
            {record.financial_analysis.budget_compliance.toUpperCase()}
          </Tag>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Remaining: Rp {record.budget_remaining.toLocaleString('id-ID')}
          </div>
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
                icon={<CalculatorOutlined />}
                onClick={() => handleFinanceAnalysis(record)}
              >
                Financial Analysis
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={loading}
              >
                Approve
              </Button>
            </>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="approval-finance">
      <div className="page-header">
        <h1>Finance Approval</h1>
        <p>Finance approval dan analisis anggaran untuk permintaan aset</p>
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
                <div className="statistic-title">Total Value</div>
                <div className="statistic-value">Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Daftar Finance Approval">
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari approval..."
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
        title="Finance Approval Detail"
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
                key="analyze"
                type="primary"
                icon={<CalculatorOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleFinanceAnalysis(selectedApproval);
                }}
              >
                Financial Analysis
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(selectedApproval.id)}
                loading={loading}
              >
                Approve
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
                  <p><strong>PV Code:</strong> {selectedApproval.pv_code}</p>
                  <p><strong>Request Code:</strong> {selectedApproval.request_code}</p>
                  <p><strong>Title:</strong> {selectedApproval.title}</p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedApproval.status)}>{selectedApproval.status.toUpperCase()}</Tag></p>
                  <p><strong>Created Date:</strong> {selectedApproval.created_date}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Vendor & Pricing</h4>
                  <p><strong>Vendor:</strong> {selectedApproval.vendor_name}</p>
                  <p><strong>Total Amount:</strong> Rp {selectedApproval.total_amount.toLocaleString('id-ID')}</p>
                  <p><strong>Discount:</strong> Rp {selectedApproval.discount_amount.toLocaleString('id-ID')}</p>
                  <p><strong>Tax (10%):</strong> Rp {selectedApproval.tax_amount.toLocaleString('id-ID')}</p>
                  <p><strong>Final Amount:</strong> <span style={{ color: '#1890ff', fontWeight: 'bold' }}>Rp {selectedApproval.final_amount.toLocaleString('id-ID')}</span></p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Financial Analysis</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size="small" title="Budget Analysis">
                        <p><strong>Budget Code:</strong> {selectedApproval.budget_code}</p>
                        <p><strong>Budget Remaining:</strong> Rp {selectedApproval.budget_remaining.toLocaleString('id-ID')}</p>
                        <p><strong>Budget Compliance:</strong> <Tag color={getBudgetComplianceColor(selectedApproval.financial_analysis.budget_compliance)}>{selectedApproval.financial_analysis.budget_compliance.toUpperCase()}</Tag></p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="Cost Benefit Analysis">
                        <p><strong>Cost Benefit Score:</strong> {selectedApproval.financial_analysis.cost_benefit_score}/5.0</p>
                        <p><strong>ROI Estimate:</strong> {selectedApproval.financial_analysis.roi_estimate}</p>
                        <p><strong>Depreciation Years:</strong> {selectedApproval.financial_analysis.depreciation_years}</p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="Depreciation Analysis">
                        <p><strong>Annual Depreciation:</strong> Rp {selectedApproval.financial_analysis.annual_depreciation.toLocaleString('id-ID')}</p>
                        <p><strong>Monthly Depreciation:</strong> Rp {Math.round(selectedApproval.financial_analysis.annual_depreciation / 12).toLocaleString('id-ID')}</p>
                        <p><strong>Total Depreciation:</strong> Rp {selectedApproval.final_amount.toLocaleString('id-ID')}</p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Items Summary</h4>
                  <div className="items-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Item Name</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Quantity</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Unit Price</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Total Price</th>
                          <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'left' }}>Specifications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApproval.items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.item_name}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.quantity}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {item.unit_price.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>Rp {item.total_price.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>{item.specifications}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                          <td colSpan="2" style={{ padding: '8px', border: '1px solid #f0f0f0', fontWeight: 'bold', color: '#1890ff' }}>
                            Rp {selectedApproval.final_amount.toLocaleString('id-ID')}
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
