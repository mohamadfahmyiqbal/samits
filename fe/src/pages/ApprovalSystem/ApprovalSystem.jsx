import React, { useState, useEffect } from 'react';
import {
  Badge,
  Form,
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Alert,
  Tag,
  Steps,
  Tooltip,
} from 'antd';
import { UserOutlined, EyeOutlined, FileTextOutlined, HistoryOutlined } from '@ant-design/icons';
import './ApprovalSystem.css';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

export default function ApprovalSystem() {
  const [form] = Form.useForm();
  const [approvalData, setApprovalData] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const approvalColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Tipe',
      dataIndex: 'request_type',
      key: 'request_type',
      render: (type) => {
        const colorMap = {
          asset_request: 'blue',
          disposal: 'red',
          transfer: 'green',
          maintenance: 'orange',
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Judul',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      title: 'Pemohon',
      dataIndex: 'requester_name',
      key: 'requester_name',
    },
    {
      title: 'Level Saat Ini',
      dataIndex: 'current_level',
      key: 'current_level',
      render: (level, record) => (
        <div>
          <Badge count={level} style={{ backgroundColor: '#52c41a' }} />
          <div style={{ fontSize: '12px', color: '#666' }}>{record.total_levels} levels</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
          completed: 'success',
        };
        const iconMap = {
          pending: <ClockCircleOutlined />,
          approved: <CheckCircleOutlined />,
          rejected: <CloseCircleOutlined />,
          completed: <CheckCircleOutlined />,
        };
        return (
          <Tag color={colorMap[status]} icon={iconMap[status]}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_date',
      key: 'created_date',
      render: (date) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className='action-buttons'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Detail
          </Button>
          {record.status === 'pending' && record.can_approve && (
            <Button type='primary' size='small' onClick={() => handleApprove(record)}>
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    // Mock approval data
    setApprovalData([
      {
        id: 1,
        request_id: 'REQ-001',
        request_type: 'asset_request',
        title: 'Pengajuan Laptop Dell XPS 15',
        requester_name: 'John Doe',
        requester_nik: '12345',
        current_level: 1,
        total_levels: 3,
        status: 'pending',
        created_date: '2024-03-25',
        can_approve: true,
        approval_flow: [
          {
            level: 1,
            role: 'Supervisor',
            name: 'Alice Johnson',
            status: 'pending',
            action_date: null,
          },
          { level: 2, role: 'Manager', name: 'Bob Wilson', status: 'pending', action_date: null },
          {
            level: 3,
            role: 'Director',
            name: 'Charlie Brown',
            status: 'pending',
            action_date: null,
          },
        ],
        details: {
          asset_name: 'Laptop Dell XPS 15',
          quantity: 5,
          estimated_cost: 125000000,
          justification: 'Penggantian laptop yang sudah tua untuk tim development',
        },
      },
      {
        id: 2,
        request_id: 'REQ-002',
        request_type: 'disposal',
        title: 'Disposal Aset IT Tahun 2024',
        requester_name: 'Jane Smith',
        requester_nik: '67890',
        current_level: 2,
        total_levels: 4,
        status: 'pending',
        created_date: '2024-03-24',
        can_approve: true,
        approval_flow: [
          {
            level: 1,
            role: 'Supervisor',
            name: 'Alice Johnson',
            status: 'approved',
            action_date: '2024-03-24',
            comments: 'Approved for disposal',
          },
          { level: 2, role: 'Manager', name: 'Bob Wilson', status: 'pending', action_date: null },
          { level: 3, role: 'Finance', name: 'Diana Prince', status: 'pending', action_date: null },
          {
            level: 4,
            role: 'Director',
            name: 'Charlie Brown',
            status: 'pending',
            action_date: null,
          },
        ],
        details: {
          assets_count: 5,
          total_depreciation: 45000000,
          disposal_type: 'scrap',
          justification: 'Aset sudah tidak layak pakai dan depresiasi > 80%',
        },
      },
      {
        id: 3,
        request_id: 'REQ-003',
        request_type: 'transfer',
        title: 'Pemindahan Aset ke Surabaya',
        requester_name: 'Mike Johnson',
        requester_nik: '54321',
        current_level: 3,
        total_levels: 3,
        status: 'approved',
        created_date: '2024-03-23',
        can_approve: false,
        approval_flow: [
          {
            level: 1,
            role: 'Supervisor',
            name: 'Alice Johnson',
            status: 'approved',
            action_date: '2024-03-23',
            comments: 'Approved for transfer',
          },
          {
            level: 2,
            role: 'Manager',
            name: 'Bob Wilson',
            status: 'approved',
            action_date: '2024-03-23',
            comments: 'Transfer approved',
          },
          {
            level: 3,
            role: 'Director',
            name: 'Charlie Brown',
            status: 'approved',
            action_date: '2024-03-24',
            comments: 'Final approval granted',
          },
        ],
        details: {
          assets_count: 3,
          from_location: 'Jakarta',
          to_location: 'Surabaya',
          justification: 'Penyesuaian kebutuhan aset di kantor Surabaya',
        },
      },
    ]);
  }, []);

  const handleViewDetail = (approval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  const handleApprove = (approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async (values) => {
    try {
      setLoading(true);

      const approvalData = {
        request_id: selectedApproval.request_id,
        action: values.action,
        comments: values.comments,
        approved_by: 'current_user', // Replace with actual user
        approved_date: new Date().toISOString(),
      };

      // API call to submit approval

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update local state
      setApprovalData((prev) =>
        prev.map((item) => {
          if (item.id === selectedApproval.id) {
            const updatedFlow = [...item.approval_flow];
            const currentLevelIndex = updatedFlow.findIndex(
              (flow) => flow.level === item.current_level
            );

            if (currentLevelIndex !== -1) {
              updatedFlow[currentLevelIndex] = {
                ...updatedFlow[currentLevelIndex],
                status: values.action === 'approve' ? 'approved' : 'rejected',
                action_date: new Date().toISOString().split('T')[0],
                comments: values.comments,
              };
            }

            const newStatus =
              values.action === 'approve'
                ? item.current_level === item.total_levels
                  ? 'completed'
                  : 'pending'
                : 'rejected';
            const newLevel =
              values.action === 'approve' && item.current_level < item.total_levels
                ? item.current_level + 1
                : item.current_level;

            return {
              ...item,
              status: newStatus,
              current_level: newLevel,
              approval_flow: updatedFlow,
              can_approve:
                values.action === 'approve' &&
                newStatus === 'pending' &&
                newLevel <= item.total_levels,
            };
          }
          return item;
        })
      );

      message.success(`Request ${values.action === 'approve' ? 'disetujui' : 'ditolak'}!`);
      setShowApprovalModal(false);
      setSelectedApproval(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal memproses approval');
    } finally {
      setLoading(false);
    }
  };

  const getApprovalSteps = (approvalFlow, currentLevel) => {
    return approvalFlow.map((step, index) => ({
      title: step.role,
      description: step.name,
      status:
        step.status === 'approved'
          ? 'finish'
          : step.status === 'rejected'
            ? 'error'
            : step.level === currentLevel
              ? 'process'
              : 'wait',
      icon:
        step.status === 'approved' ? (
          <CheckCircleOutlined />
        ) : step.status === 'rejected' ? (
          <CloseCircleOutlined />
        ) : (
          <UserOutlined />
        ),
    }));
  };

  const filteredData = approvalData.filter((item) => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'approved') return item.status === 'approved' || item.status === 'completed';
    if (activeTab === 'rejected') return item.status === 'rejected';
    return true;
  });

  return (
    <div className='approval-system'>
      <div className='page-header'>
        <h1>Sistem Approval</h1>
        <p>Kelola persetujuan multi-level untuk berbagai request</p>
      </div>

      <Card>
        <div className='tab-navigation'>
          <Button
            type={activeTab === 'pending' ? 'primary' : 'default'}
            onClick={() => setActiveTab('pending')}
          >
            Menunggu ({approvalData.filter((d) => d.status === 'pending').length})
          </Button>
          <Button
            type={activeTab === 'approved' ? 'primary' : 'default'}
            onClick={() => setActiveTab('approved')}
          >
            Disetujui (
            {approvalData.filter((d) => d.status === 'approved' || d.status === 'completed').length}
            )
          </Button>
          <Button
            type={activeTab === 'rejected' ? 'primary' : 'default'}
            onClick={() => setActiveTab('rejected')}
          >
            Ditolak ({approvalData.filter((d) => d.status === 'rejected').length})
          </Button>
          <Button
            type={activeTab === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveTab('all')}
          >
            Semua ({approvalData.length})
          </Button>
        </div>

        <Table
          columns={approvalColumns}
          dataSource={filteredData}
          rowKey='id'
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title='Detail Approval'
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key='close' onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>,
        ]}
        width={900}
      >
        {selectedApproval && (
          <div className='approval-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Request</h4>
                <p>
                  <strong>Request ID:</strong> {selectedApproval.request_id}
                </p>
                <p>
                  <strong>Tipe:</strong> <Tag color='blue'>{selectedApproval.request_type}</Tag>
                </p>
                <p>
                  <strong>Judul:</strong> {selectedApproval.title}
                </p>
                <p>
                  <strong>Pemohon:</strong> {selectedApproval.requester_name}
                </p>
                <p>
                  <strong>Status:</strong> <Tag color='orange'>{selectedApproval.status}</Tag>
                </p>
              </Col>
              <Col span={12}>
                <h4>Progress Approval</h4>
                <p>
                  <strong>Level Saat Ini:</strong> {selectedApproval.current_level}/
                  {selectedApproval.total_levels}
                </p>
                <div className='approval-steps'>
                  <Steps
                    current={selectedApproval.current_level - 1}
                    items={getApprovalSteps(
                      selectedApproval.approval_flow,
                      selectedApproval.current_level
                    )}
                    size='small'
                  />
                </div>
              </Col>
            </Row>

            <Divider />

            <div className='request-details'>
              <h4>Detail Request</h4>
              {selectedApproval.request_type === 'asset_request' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Nama Aset:</strong> {selectedApproval.details.asset_name}
                    </p>
                    <p>
                      <strong>Jumlah:</strong> {selectedApproval.details.quantity}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Estimasi Biaya:</strong> Rp{' '}
                      {selectedApproval.details.estimated_cost.toLocaleString('id-ID')}
                    </p>
                    <p>
                      <strong>Justifikasi:</strong> {selectedApproval.details.justification}
                    </p>
                  </Col>
                </Row>
              )}
              {selectedApproval.request_type === 'disposal' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Jumlah Aset:</strong> {selectedApproval.details.assets_count}
                    </p>
                    <p>
                      <strong>Tipe Disposal:</strong> {selectedApproval.details.disposal_type}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Total Depresiasi:</strong> Rp{' '}
                      {selectedApproval.details.total_depreciation.toLocaleString('id-ID')}
                    </p>
                    <p>
                      <strong>Justifikasi:</strong> {selectedApproval.details.justification}
                    </p>
                  </Col>
                </Row>
              )}
              {selectedApproval.request_type === 'transfer' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Jumlah Aset:</strong> {selectedApproval.details.assets_count}
                    </p>
                    <p>
                      <strong>Dari:</strong> {selectedApproval.details.from_location}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Ke:</strong> {selectedApproval.details.to_location}
                    </p>
                    <p>
                      <strong>Justifikasi:</strong> {selectedApproval.details.justification}
                    </p>
                  </Col>
                </Row>
              )}
            </div>

            <Divider />

            <div className='approval-history'>
              <h4>Riwayat Approval</h4>
              <Timeline>
                {selectedApproval.approval_flow.map((step, index) => (
                  <Timeline.Item
                    key={index}
                    color={
                      step.status === 'approved'
                        ? 'green'
                        : step.status === 'rejected'
                          ? 'red'
                          : step.level === selectedApproval.current_level
                            ? 'blue'
                            : 'gray'
                    }
                    dot={
                      step.status === 'approved' ? (
                        <CheckCircleOutlined />
                      ) : step.status === 'rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )
                    }
                  >
                    <div className='timeline-content'>
                      <div className='timeline-header'>
                        <strong>
                          Level {step.level} - {step.role}
                        </strong>
                        <Tag
                          color={
                            step.status === 'approved'
                              ? 'green'
                              : step.status === 'rejected'
                                ? 'red'
                                : 'orange'
                          }
                        >
                          {step.status}
                        </Tag>
                      </div>
                      <p>
                        <strong>Nama:</strong> {step.name}
                      </p>
                      {step.action_date && (
                        <p>
                          <strong>Tanggal:</strong> {step.action_date}
                        </p>
                      )}
                      {step.comments && (
                        <p>
                          <strong>Catatan:</strong> {step.comments}
                        </p>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title='Proses Approval'
        open={showApprovalModal}
        onCancel={() => setShowApprovalModal(false)}
        footer={null}
        width={600}
      >
        {selectedApproval && (
          <Form form={form} layout='vertical' onFinish={handleSubmitApproval}>
            <Alert
              message={`Approval: ${selectedApproval.request_id}`}
              description={`${selectedApproval.title} - ${selectedApproval.requester_name}`}
              type='info'
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name='action'
              label='Aksi'
              rules={[{ required: true, message: 'Pilih aksi!' }]}
            >
              <Select placeholder='Pilih aksi'>
                <Option value='approve'>Setujui</Option>
                <Option value='reject'>Tolak</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='comments'
              label='Catatan'
              rules={[{ required: true, message: 'Masukkan catatan!' }]}
            >
              <TextArea rows={4} placeholder='Masukkan catatan approval...' />
            </Form.Item>

            <Form.Item>
              <div className='form-actions'>
                <Button onClick={() => setShowApprovalModal(false)}>Batal</Button>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Proses
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
