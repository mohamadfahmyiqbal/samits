import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Timeline,
  Badge,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileSearchOutlined,
  CheckOutlined,
  SendOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export default function Approval3() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [approvalData, setApprovalData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [form] = Form.useForm();

  const { result_code, maintenance_code, result_data } = location.state || {};

  const mockApprovalData = [
    {
      id: 1,
      approval_code: 'APP3-2024-001',
      result_code: 'RES-2024-001',
      maintenance_code: 'MT2-2024-001',
      equipment: 'Server HP ProLiant DL360',
      maintenance_type: 'Preventive Maintenance',
      technician: 'John Doe',
      completion_date: '2024-03-28',
      status: 'pending',
      final_status: 'completed',
      completion_notes:
        'All maintenance tasks completed successfully. CPU temperature normalized, memory optimized, firmware updated.',
      issues_found: 'Minor dust accumulation cleaned',
      recommendations: 'Schedule next maintenance in 3 months',
      checklist_summary: {
        total: 5,
        completed: 5,
        failed: 0,
        skipped: 0,
      },
      parts_used: [
        { name: 'Cooling Fan', quantity: 1, cost: 500000 },
        { name: 'Thermal Paste', quantity: 1, cost: 150000 },
      ],
      labor_hours: 3.5,
      total_cost: 650000,
      submitted_by: 'John Doe',
      submitted_date: '2024-03-28',
      approval_history: [],
    },
    {
      id: 2,
      approval_code: 'APP3-2024-002',
      result_code: 'RES-2024-002',
      maintenance_code: 'MT2-2024-002',
      equipment: 'Laptop Dell XPS 15',
      maintenance_type: 'Corrective Maintenance',
      technician: 'Jane Smith',
      completion_date: '2024-03-27',
      status: 'approved',
      final_status: 'completed',
      completion_notes: 'Display cable successfully replaced. All display tests passed.',
      issues_found: 'Loose display cable connector',
      recommendations: 'Handle with care, avoid sudden movements',
      checklist_summary: {
        total: 3,
        completed: 3,
        failed: 0,
        skipped: 0,
      },
      parts_used: [{ name: 'Display Cable', quantity: 1, cost: 350000 }],
      labor_hours: 2,
      total_cost: 350000,
      submitted_by: 'Jane Smith',
      submitted_date: '2024-03-27',
      approved_by: 'Manager IT',
      approved_date: '2024-03-27',
      approval_notes: 'Maintenance completed satisfactorily. All checks passed.',
      approval_history: [
        {
          action: 'submitted',
          by: 'Jane Smith',
          date: '2024-03-27',
          notes: 'Submitted for approval',
        },
        {
          action: 'approved',
          by: 'Manager IT',
          date: '2024-03-27',
          notes: 'Maintenance completed satisfactorily',
        },
      ],
    },
    {
      id: 3,
      approval_code: 'APP3-2024-003',
      result_code: 'RES-2024-003',
      maintenance_code: 'MT2-2024-003',
      equipment: 'UPS System A',
      maintenance_type: 'Predictive Maintenance',
      technician: 'Mike Johnson',
      completion_date: '2024-03-29',
      status: 'rejected',
      final_status: 'partial',
      completion_notes: 'Some tests could not be completed due to power outage.',
      issues_found: 'Incomplete testing due to external factors',
      recommendations: 'Reschedule remaining tests',
      checklist_summary: {
        total: 3,
        completed: 1,
        failed: 0,
        skipped: 2,
      },
      parts_used: [],
      labor_hours: 1,
      total_cost: 0,
      submitted_by: 'Mike Johnson',
      submitted_date: '2024-03-29',
      rejected_by: 'Supervisor Maintenance',
      rejected_date: '2024-03-29',
      rejection_reason: 'Incomplete testing. Please reschedule and complete all checklist items.',
      approval_history: [
        {
          action: 'submitted',
          by: 'Mike Johnson',
          date: '2024-03-29',
          notes: 'Submitted for approval',
        },
        {
          action: 'rejected',
          by: 'Supervisor Maintenance',
          date: '2024-03-29',
          notes: 'Incomplete testing. Please reschedule.',
        },
      ],
    },
  ];

  useEffect(() => {
    setApprovalData(mockApprovalData);
  }, []);

  const handleViewDetail = (record) => {
    setSelectedApproval(record);
    setDetailModalVisible(true);
  };

  const handleAction = (record, type) => {
    setSelectedApproval(record);
    setActionType(type);
    setActionModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ decision: type });
  };

  const handleActionSubmit = async (values) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newStatus = values.decision === 'approve' ? 'approved' : 'rejected';
      const approverField = values.decision === 'approve' ? 'approved_by' : 'rejected_by';
      const dateField = values.decision === 'approve' ? 'approved_date' : 'rejected_date';
      const notesField = values.decision === 'approve' ? 'approval_notes' : 'rejection_reason';

      setApprovalData((prev) =>
        prev.map((item) =>
          item.id === selectedApproval.id
            ? {
                ...item,
                status: newStatus,
                [approverField]: values.approver_name,
                [dateField]: new Date().toISOString().split('T')[0],
                [notesField]: values.notes,
                approval_history: [
                  ...(item.approval_history || []),
                  {
                    action: newStatus,
                    by: values.approver_name,
                    date: new Date().toISOString().split('T')[0],
                    notes: values.notes,
                  },
                ],
              }
            : item
        )
      );

      message.success(
        `Result berhasil ${values.decision === 'approve' ? 'disetujui' : 'ditolak'}!`
      );
      setActionModalVisible(false);
    } catch (error) {
      message.error('Gagal memproses approval');
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = (record) => {
    Modal.confirm({
      title: 'Resubmit untuk Approval',
      content: `Apakah Anda yakin ingin mengajukan ulang ${record.approval_code}?`,
      onOk: () => {
        setApprovalData((prev) =>
          prev.map((item) =>
            item.id === record.id ? { ...item, status: 'pending', rejection_reason: null } : item
          )
        );
        message.success('Berhasil diajukan ulang!');
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'MENUNGGU';
      case 'approved':
        return 'DISETUJUI';
      case 'rejected':
        return 'DITOLAK';
      default:
        return status.toUpperCase();
    }
  };

  const columns = [
    {
      title: 'Kode Approval',
      dataIndex: 'approval_code',
      key: 'approval_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Result Ref',
      dataIndex: 'result_code',
      key: 'result_code',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Submitted By',
      dataIndex: 'submitted_by',
      key: 'submitted_by',
    },
    {
      title: 'Submitted Date',
      dataIndex: 'submitted_date',
      key: 'submitted_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Badge
            status={
              status === 'approved'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : status === 'rejected'
                    ? 'error'
                    : 'default'
            }
            text={getStatusText(status)}
          />
          {status === 'approved' && record.approved_by && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
              By: {record.approved_by}
            </div>
          )}
          {status === 'rejected' && record.rejected_by && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
              By: {record.rejected_by}
            </div>
          )}
        </div>
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
          {record.status === 'pending' && (
            <>
              <Button
                type='primary'
                size='small'
                icon={<CheckOutlined />}
                onClick={() => handleAction(record, 'approve')}
              >
                Approve
              </Button>
              <Button
                danger
                size='small'
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction(record, 'reject')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'rejected' && (
            <Button
              type='primary'
              size='small'
              icon={<SendOutlined />}
              onClick={() => handleResubmit(record)}
            >
              Resubmit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='approval3'>
      <div className='page-header'>
        <h1>Approval 3 - Maintenance Result</h1>
        <p>Approval workflow untuk maintenance results</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {approvalData.filter((item) => item.status === 'pending').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Menunggu Approval</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {approvalData.filter((item) => item.status === 'approved').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Disetujui</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#ff4d4f' }}>
                {approvalData.filter((item) => item.status === 'rejected').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Ditolak</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileSearchOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {approvalData.length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title='Daftar Approval Maintenance Result'
        extra={
          <Space>
            <Button type='default' icon={<ArrowLeftOutlined />} onClick={() => navigate('/result')}>
              Ke Result
            </Button>
            <Button
              type='primary'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/maintenance2')}
            >
              Ke Maintenance2
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={approvalData}
          rowKey='id'
          loading={loading}
          pagination={{
            total: approvalData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title='Detail Approval'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedApproval(null);
        }}
        footer={[
          <Button key='print' icon={<DownloadOutlined />}>
            Download
          </Button>,
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={900}
      >
        {selectedApproval && (
          <div className='approval-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size='small' title='Informasi Approval'>
                  <p>
                    <strong>Kode Approval:</strong> {selectedApproval.approval_code}
                  </p>
                  <p>
                    <strong>Result Ref:</strong> {selectedApproval.result_code}
                  </p>
                  <p>
                    <strong>Maintenance Ref:</strong> {selectedApproval.maintenance_code}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Tag color={getStatusColor(selectedApproval.status)} style={{ marginLeft: 8 }}>
                      {getStatusText(selectedApproval.status)}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size='small' title='Equipment & Maintenance'>
                  <p>
                    <strong>Equipment:</strong> {selectedApproval.equipment}
                  </p>
                  <p>
                    <strong>Jenis:</strong> {selectedApproval.maintenance_type}
                  </p>
                  <p>
                    <strong>Teknisi:</strong> {selectedApproval.technician}
                  </p>
                  <p>
                    <strong>Tanggal Selesai:</strong> {selectedApproval.completion_date}
                  </p>
                </Card>
              </Col>
            </Row>

            <Card size='small' title='Ringkasan Pekerjaan' style={{ marginTop: 16 }}>
              <p>
                <strong>Final Status:</strong>
                <Tag
                  color={selectedApproval.final_status === 'completed' ? 'green' : 'orange'}
                  style={{ marginLeft: 8 }}
                >
                  {selectedApproval.final_status.toUpperCase()}
                </Tag>
              </p>
              <p>
                <strong>Jam Kerja:</strong> {selectedApproval.labor_hours} jam
              </p>
              <p>
                <strong>Total Cost:</strong> Rp{' '}
                {selectedApproval.total_cost.toLocaleString('id-ID')}
              </p>
              <p>
                <strong>Checklist:</strong> {selectedApproval.checklist_summary.completed}/
                {selectedApproval.checklist_summary.total} completed
              </p>
            </Card>

            <Card size='small' title='Catatan Penyelesaian' style={{ marginTop: 16 }}>
              <p>{selectedApproval.completion_notes}</p>
            </Card>

            {selectedApproval.issues_found && (
              <Card size='small' title='Issues Ditemukan' style={{ marginTop: 16 }}>
                <Alert message={selectedApproval.issues_found} type='warning' />
              </Card>
            )}

            {selectedApproval.recommendations && (
              <Card size='small' title='Rekomendasi' style={{ marginTop: 16 }}>
                <p>{selectedApproval.recommendations}</p>
              </Card>
            )}

            {selectedApproval.approval_history && selectedApproval.approval_history.length > 0 && (
              <Card size='small' title='Approval History' style={{ marginTop: 16 }}>
                <Timeline>
                  {selectedApproval.approval_history.map((item, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        item.action === 'approved'
                          ? 'green'
                          : item.action === 'rejected'
                            ? 'red'
                            : 'blue'
                      }
                      dot={
                        item.action === 'approved' ? (
                          <CheckCircleOutlined />
                        ) : item.action === 'rejected' ? (
                          <CloseCircleOutlined />
                        ) : (
                          <HistoryOutlined />
                        )
                      }
                    >
                      <div>
                        <strong>{item.action.toUpperCase()}</strong> by {item.by}
                        <div style={{ fontSize: '12px', color: '#888' }}>{item.date}</div>
                        <p style={{ margin: '4px 0', color: '#666' }}>{item.notes}</p>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {selectedApproval.rejection_reason && (
              <Card size='small' title='Alasan Penolakan' style={{ marginTop: 16 }}>
                <Alert message={selectedApproval.rejection_reason} type='error' />
              </Card>
            )}

            {selectedApproval.approval_notes && (
              <Card size='small' title='Catatan Approval' style={{ marginTop: 16 }}>
                <Alert message={selectedApproval.approval_notes} type='success' />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={
          actionType === 'approve' ? 'Approve Maintenance Result' : 'Reject Maintenance Result'
        }
        open={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedApproval && (
          <Form form={form} layout='vertical' onFinish={handleActionSubmit}>
            <Alert
              message={actionType === 'approve' ? 'Menyetujui Result' : 'Menolak Result'}
              description={`${selectedApproval.approval_code} - ${selectedApproval.equipment}`}
              type={actionType === 'approve' ? 'success' : 'error'}
              style={{ marginBottom: 16 }}
            />

            <Form.Item name='decision' label='Keputusan' initialValue={actionType}>
              <Radio.Group disabled>
                <Radio value='approve'>Approve</Radio>
                <Radio value='reject'>Reject</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name='approver_name'
              label='Nama Approver'
              rules={[{ required: true, message: 'Masukkan nama approver!' }]}
            >
              <Input placeholder='Nama lengkap approver' />
            </Form.Item>

            <Form.Item
              name='notes'
              label={actionType === 'approve' ? 'Catatan Approval' : 'Alasan Penolakan'}
              rules={[
                {
                  required: true,
                  message: actionType === 'approve' ? 'Masukkan catatan!' : 'Masukkan alasan!',
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  actionType === 'approve'
                    ? 'Catatan terkait approval...'
                    : 'Jelaskan alasan penolakan...'
                }
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setActionModalVisible(false)}>Batal</Button>
                <Button
                  type={actionType === 'approve' ? 'primary' : 'default'}
                  danger={actionType === 'reject'}
                  htmlType='submit'
                  loading={loading}
                  icon={
                    actionType === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                  }
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
