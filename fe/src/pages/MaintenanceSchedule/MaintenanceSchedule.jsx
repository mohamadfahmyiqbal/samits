import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, message, Steps, Modal } from 'antd';
import { 
  CalendarOutlined,
  TeamOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './MaintenanceSchedule.css';

const { Step } = Steps;

export default function MaintenanceSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const { category, subcategory, schedule, selectedDate, selectedTime } = location.state || {};

  const mockScheduleData = [
    {
      id: 1,
      schedule_code: 'MS-2024-001',
      category: 'Preventive Maintenance',
      subcategory: 'Monthly Check',
      equipment: 'Server HP ProLiant DL360',
      location: 'Data Center Lantai 2',
      team: 'Team Alpha',
      date: '2024-03-28',
      start_time: '08:00',
      end_time: '10:00',
      status: 'scheduled',
      priority: 'medium',
      created_by: 'Admin',
      created_date: '2024-03-25',
      notes: 'Monthly preventive maintenance for server'
    },
    {
      id: 2,
      schedule_code: 'MS-2024-002',
      category: 'Corrective Maintenance',
      subcategory: 'Emergency Repair',
      equipment: 'Laptop Dell XPS 15',
      location: 'IT Office',
      team: 'Team Beta',
      date: '2024-03-27',
      start_time: '14:00',
      end_time: '16:00',
      status: 'in_progress',
      priority: 'high',
      created_by: 'User',
      created_date: '2024-03-24',
      notes: 'Emergency repair for laptop display issue'
    },
    {
      id: 3,
      schedule_code: 'MS-2024-003',
      category: 'Predictive Maintenance',
      subcategory: 'Vibration Analysis',
      equipment: 'Industrial Pump Unit A',
      location: 'Production Area',
      team: 'Team Gamma',
      date: '2024-03-29',
      start_time: '09:00',
      end_time: '12:00',
      status: 'pending',
      priority: 'low',
      created_by: 'Maintenance',
      created_date: '2024-03-26',
      notes: 'Vibration analysis for pump unit'
    }
  ];

  useEffect(() => {
    setScheduleData(mockScheduleData);
    
    // Add new schedule if coming from previous steps
    if (category && subcategory && schedule) {
      const newSchedule = {
        id: Date.now(),
        schedule_code: `MS-2024-${Date.now()}`,
        category: category.name,
        subcategory: subcategory.name,
        equipment: 'New Equipment',
        location: schedule.location || 'To be determined',
        team: schedule.team_name || 'To be assigned',
        date: selectedDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        start_time: schedule.start_time || '09:00',
        end_time: schedule.end_time || '11:00',
        status: 'scheduled',
        priority: schedule.priority || 'medium',
        created_by: 'Current User',
        created_date: new Date().toISOString().split('T')[0],
        notes: schedule.notes || 'New maintenance schedule'
      };
      
      setScheduleData(prev => [newSchedule, ...prev]);
      message.success('Jadwal maintenance berhasil dibuat!');
    }
  }, [category, subcategory, schedule, selectedDate]);

  const handleViewDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setDetailModalVisible(true);
  };

  const handleEdit = (schedule) => {
    navigate('/pilih-category', { 
      state: { 
        editMode: true,
        scheduleData: schedule
      } 
    });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Hapus Jadwal Maintenance',
      content: 'Apakah Anda yakin ingin menghapus jadwal maintenance ini?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          setScheduleData(prev => prev.filter(item => item.id !== id));
          message.success('Jadwal berhasil dihapus');
        } catch (error) {
          message.error('Gagal menghapus jadwal');
        }
      }
    });
  };

  const handlePrint = (schedule) => {
    message.info('Fitur print akan segera tersedia');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'in_progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <CalendarOutlined />;
      case 'in_progress': return <ClockCircleOutlined />;
      case 'completed': return <CheckCircleOutlined />;
      case 'cancelled': return <ExclamationCircleOutlined />;
      default: return <CalendarOutlined />;
    }
  };

  const columns = [
    {
      title: 'Schedule Code',
      dataIndex: 'schedule_code',
      key: 'schedule_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag> },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment' },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location' },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      render: (team) => <Tag color="green">{team}</Tag> },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <small>{record.start_time} - {record.end_time}</small>
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ').toUpperCase()}
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ) },
  ];

  const timelineItems = selectedSchedule ? [
    {
      label: 'Created',
      children: (
        <div>
          <p><strong>Date:</strong> {selectedSchedule.created_date}</p>
          <p><strong>By:</strong> {selectedSchedule.created_by}</p>
        </div>
      ),
      color: 'green' },
    {
      label: 'Scheduled',
      children: (
        <div>
          <p><strong>Date:</strong> {selectedSchedule.date}</p>
          <p><strong>Time:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
          <p><strong>Team:</strong> {selectedSchedule.team}</p>
        </div>
      ),
      color: 'blue' },
    ...(selectedSchedule.status === 'completed' ? [{
      label: 'Completed',
      children: (
        <div>
          <p>Maintenance completed successfully</p>
        </div>
      ),
      color: 'green' }] : []),
  ] : [];

  return (
    <div className="maintenance-schedule">
      <div className="page-header">
        <h1>Maintenance Schedule</h1>
        <p>Kelola jadwal maintenance dan monitoring status</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <CalendarOutlined className="statistic-icon scheduled" />
              <div className="statistic-content">
                <div className="statistic-title">Scheduled</div>
                <div className="statistic-value">
                  {scheduleData.filter(item => item.status === 'scheduled').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <ClockCircleOutlined className="statistic-icon in-progress" />
              <div className="statistic-content">
                <div className="statistic-title">In Progress</div>
                <div className="statistic-value">
                  {scheduleData.filter(item => item.status === 'in_progress').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <CheckCircleOutlined className="statistic-icon completed" />
              <div className="statistic-content">
                <div className="statistic-title">Completed</div>
                <div className="statistic-value">
                  {scheduleData.filter(item => item.status === 'completed').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <ExclamationCircleOutlined className="statistic-icon pending" />
              <div className="statistic-content">
                <div className="statistic-title">Pending</div>
                <div className="statistic-value">
                  {scheduleData.filter(item => item.status === 'pending').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Daftar Jadwal Maintenance"
            extra={
              <Button 
                type="primary" 
                onClick={() => navigate('/pilih-category')}
              >
                + Tambah Jadwal
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={scheduleData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: scheduleData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} dari ${total} jadwal` }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="expanded-content">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <h4>Detail Schedule</h4>
                        <p><strong>Subcategory:</strong> {record.subcategory}</p>
                        <p><strong>Priority:</strong> <Tag color={getPriorityColor(record.priority)}>{record.priority.toUpperCase()}</Tag></p>
                        <p><strong>Created Date:</strong> {record.created_date}</p>
                        <p><strong>Created By:</strong> {record.created_by}</p>
                      </Col>
                      <Col span={12}>
                        <h4>Catatan</h4>
                        <p>{record.notes}</p>
                      </Col>
                    </Row>
                  </div>
                ),
                rowExpandable: (record) => record.notes }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Detail Maintenance Schedule"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedSchedule(null);
        }}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            Print
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedSchedule && (
          <div className="schedule-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Informasi Schedule</h4>
                  <p><strong>Kode:</strong> {selectedSchedule.schedule_code}</p>
                  <p><strong>Kategori:</strong> {selectedSchedule.category}</p>
                  <p><strong>Subkategori:</strong> {selectedSchedule.subcategory}</p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedSchedule.status)}>{selectedSchedule.status.replace('_', ' ').toUpperCase()}</Tag></p>
                  <p><strong>Priority:</strong> <Tag color={getPriorityColor(selectedSchedule.priority)}>{selectedSchedule.priority.toUpperCase()}</Tag></p>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Detail Waktu & Lokasi</h4>
                  <p><strong>Tanggal:</strong> {selectedSchedule.date}</p>
                  <p><strong>Waktu:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
                  <p><strong>Lokasi:</strong> {selectedSchedule.location}</p>
                  <p><strong>Equipment:</strong> {selectedSchedule.equipment}</p>
                  <p><strong>Tim:</strong> {selectedSchedule.team}</p>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Catatan</h4>
                  <p>{selectedSchedule.notes}</p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="detail-section">
                  <h4>Timeline</h4>
                  <Timeline items={timelineItems} />
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
