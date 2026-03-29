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
  DatePicker,
  Timeline,
} from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FileSearchOutlined,
  EditOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export default function Maintenance2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [form] = Form.useForm();

  const mockMaintenanceData = [
    {
      id: 1,
      maintenance_code: 'MT2-2024-001',
      schedule_code: 'MS-2024-001',
      category: 'Preventive Maintenance',
      equipment: 'Server HP ProLiant DL360',
      location: 'Data Center Lantai 2',
      team: 'Team Alpha',
      technician: 'John Doe',
      start_date: '2024-03-28',
      status: 'in_progress',
      priority: 'high',
      progress: 65,
      checklist_items: [
        { item: 'Check CPU temperature', status: 'completed', notes: 'Normal: 45°C' },
        { item: 'Check memory usage', status: 'completed', notes: 'RAM usage 60%' },
        { item: 'Check disk health', status: 'in_progress', notes: 'Running SMART test' },
        { item: 'Update firmware', status: 'pending', notes: 'Waiting for disk check' },
        { item: 'Clean dust filters', status: 'pending', notes: '' },
      ],
      notes: 'Monthly preventive maintenance in progress',
    },
    {
      id: 2,
      maintenance_code: 'MT2-2024-002',
      schedule_code: 'MS-2024-002',
      category: 'Corrective Maintenance',
      equipment: 'Laptop Dell XPS 15',
      location: 'IT Office',
      team: 'Team Beta',
      technician: 'Jane Smith',
      start_date: '2024-03-27',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      checklist_items: [
        { item: 'Diagnose issue', status: 'completed', notes: 'Display cable loose' },
        { item: 'Replace cable', status: 'completed', notes: 'New cable installed' },
        { item: 'Test display', status: 'completed', notes: 'All tests passed' },
      ],
      notes: 'Display issue resolved successfully',
    },
    {
      id: 3,
      maintenance_code: 'MT2-2024-003',
      schedule_code: 'MS-2024-003',
      category: 'Predictive Maintenance',
      equipment: 'UPS System A',
      location: 'Server Room',
      team: 'Team Gamma',
      technician: 'Mike Johnson',
      start_date: '2024-03-29',
      status: 'pending',
      priority: 'low',
      progress: 0,
      checklist_items: [
        { item: 'Battery voltage check', status: 'pending', notes: '' },
        { item: 'Load test', status: 'pending', notes: '' },
        { item: 'Transfer switch test', status: 'pending', notes: '' },
      ],
      notes: 'Scheduled predictive maintenance',
    },
  ];

  useEffect(() => {
    setMaintenanceData(mockMaintenanceData);
  }, []);

  const handleViewDetail = (record) => {
    setSelectedMaintenance(record);
    setDetailModalVisible(true);
  };

  const handleStartMaintenance = (record) => {
    Modal.confirm({
      title: 'Mulai Maintenance',
      content: `Apakah Anda yakin ingin memulai maintenance ${record.maintenance_code}?`,
      onOk: () => {
        setMaintenanceData((prev) =>
          prev.map((item) =>
            item.id === record.id ? { ...item, status: 'in_progress', progress: 10 } : item
          )
        );
        message.success('Maintenance dimulai!');
      },
    });
  };

  const handleCompleteClick = (record) => {
    setSelectedMaintenance(record);
    setCompleteModalVisible(true);
    form.resetFields();
  };

  const handleCompleteSubmit = async (values) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMaintenanceData((prev) =>
        prev.map((item) =>
          item.id === selectedMaintenance.id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                completion_notes: values.completion_notes,
                completed_date: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );

      message.success('Maintenance berhasil diselesaikan!');
      setCompleteModalVisible(false);

      // Navigate to Result page
      navigate('/result', {
        state: {
          maintenance_code: selectedMaintenance.maintenance_code,
          equipment: selectedMaintenance.equipment,
          completion_data: values,
        },
      });
    } catch (error) {
      message.error('Gagal menyelesaikan maintenance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'orange';
      case 'paused':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'in_progress':
        return <PlayCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'paused':
        return <PauseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'SELESAI';
      case 'in_progress':
        return 'BERJALAN';
      case 'pending':
        return 'MENUNGGU';
      case 'paused':
        return 'DIJEDA';
      default:
        return status.toUpperCase();
    }
  };

  const columns = [
    {
      title: 'Kode Maintenance',
      dataIndex: 'maintenance_code',
      key: 'maintenance_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Schedule Ref',
      dataIndex: 'schedule_code',
      key: 'schedule_code',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Teknisi',
      dataIndex: 'technician',
      key: 'technician',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.team}</small>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <div>
          <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
            {getStatusText(record.status)}
          </Tag>
          <div style={{ marginTop: 4, fontSize: '12px' }}>{progress}% complete</div>
        </div>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag
          color={
            priority === 'critical'
              ? 'red'
              : priority === 'high'
                ? 'orange'
                : priority === 'medium'
                  ? 'blue'
                  : 'green'
          }
        >
          {priority.toUpperCase()}
        </Tag>
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
            <Button
              type='primary'
              size='small'
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartMaintenance(record)}
            >
              Mulai
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type='primary'
              size='small'
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteClick(record)}
            >
              Selesai
            </Button>
          )}
          {record.status === 'completed' && (
            <Button
              type='default'
              size='small'
              icon={<ArrowRightOutlined />}
              onClick={() =>
                navigate('/result', { state: { maintenance_code: record.maintenance_code } })
              }
            >
              Result
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='maintenance2'>
      <div className='page-header'>
        <h1>Maintenance Execution</h1>
        <p>Eksekusi dan monitoring maintenance activities</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='stat-card'>
              <ClockCircleOutlined className='stat-icon pending' />
              <div className='stat-content'>
                <h3>{maintenanceData.filter((item) => item.status === 'pending').length}</h3>
                <p>Menunggu</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card'>
              <PlayCircleOutlined className='stat-icon in-progress' />
              <div className='stat-content'>
                <h3>{maintenanceData.filter((item) => item.status === 'in_progress').length}</h3>
                <p>Berjalan</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card'>
              <CheckCircleOutlined className='stat-icon completed' />
              <div className='stat-content'>
                <h3>{maintenanceData.filter((item) => item.status === 'completed').length}</h3>
                <p>Selesai</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card'>
              <ToolOutlined className='stat-icon total' />
              <div className='stat-content'>
                <h3>{maintenanceData.length}</h3>
                <p>Total</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title='Daftar Maintenance Activities'
        extra={
          <Button
            type='primary'
            icon={<FileSearchOutlined />}
            onClick={() => navigate('/maintenance schedule')}
          >
            Lihat Jadwal
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={maintenanceData}
          rowKey='id'
          loading={loading}
          pagination={{
            total: maintenanceData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title='Detail Maintenance Activity'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMaintenance(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {selectedMaintenance && (
          <div className='maintenance-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Maintenance</h4>
                <p>
                  <strong>Kode:</strong> {selectedMaintenance.maintenance_code}
                </p>
                <p>
                  <strong>Schedule Ref:</strong> {selectedMaintenance.schedule_code}
                </p>
                <p>
                  <strong>Kategori:</strong> {selectedMaintenance.category}
                </p>
                <p>
                  <strong>Status:</strong>
                  <Tag color={getStatusColor(selectedMaintenance.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedMaintenance.status)}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <h4>Equipment & Team</h4>
                <p>
                  <strong>Equipment:</strong> {selectedMaintenance.equipment}
                </p>
                <p>
                  <strong>Lokasi:</strong> {selectedMaintenance.location}
                </p>
                <p>
                  <strong>Teknisi:</strong> {selectedMaintenance.technician}
                </p>
                <p>
                  <strong>Tim:</strong> {selectedMaintenance.team}
                </p>
              </Col>
            </Row>

            <h4 style={{ marginTop: 24 }}>Checklist Items</h4>
            <Timeline>
              {selectedMaintenance.checklist_items.map((item, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    item.status === 'completed'
                      ? 'green'
                      : item.status === 'in_progress'
                        ? 'blue'
                        : 'gray'
                  }
                  dot={
                    item.status === 'completed' ? (
                      <CheckCircleOutlined />
                    ) : item.status === 'in_progress' ? (
                      <PlayCircleOutlined />
                    ) : (
                      <ClockCircleOutlined />
                    )
                  }
                >
                  <div>
                    <strong>{item.item}</strong>
                    <Tag
                      color={
                        item.status === 'completed'
                          ? 'green'
                          : item.status === 'in_progress'
                            ? 'blue'
                            : 'default'
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {item.status}
                    </Tag>
                    {item.notes && <p style={{ margin: '4px 0', color: '#666' }}>{item.notes}</p>}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>

            {selectedMaintenance.notes && (
              <>
                <h4 style={{ marginTop: 24 }}>Catatan</h4>
                <p>{selectedMaintenance.notes}</p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Complete Modal */}
      <Modal
        title='Selesaikan Maintenance'
        open={completeModalVisible}
        onCancel={() => {
          setCompleteModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedMaintenance && (
          <Form form={form} layout='vertical' onFinish={handleCompleteSubmit}>
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <p>
                <strong>Maintenance:</strong> {selectedMaintenance.maintenance_code}
              </p>
              <p>
                <strong>Equipment:</strong> {selectedMaintenance.equipment}
              </p>
              <p>
                <strong>Teknisi:</strong> {selectedMaintenance.technician}
              </p>
            </div>

            <Form.Item
              name='completion_notes'
              label='Catatan Penyelesaian'
              rules={[{ required: true, message: 'Masukkan catatan penyelesaian!' }]}
            >
              <TextArea rows={4} placeholder='Deskripsikan hasil maintenance...' />
            </Form.Item>

            <Form.Item
              name='final_status'
              label='Status Akhir'
              rules={[{ required: true, message: 'Pilih status akhir!' }]}
              initialValue='completed'
            >
              <Select placeholder='Pilih status'>
                <Option value='completed'>Selesai - Berhasil</Option>
                <Option value='partial'>Selesai - Partial</Option>
                <Option value='failed'>Gagal</Option>
              </Select>
            </Form.Item>

            <Form.Item name='issues_found' label='Issues Ditemukan (Opsional)'>
              <TextArea
                rows={2}
                placeholder='Jelaskan issues yang ditemukan selama maintenance...'
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setCompleteModalVisible(false)}>Batal</Button>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  Selesaikan & Lanjut ke Result
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
