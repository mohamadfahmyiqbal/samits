import React, { useState, useEffect } from 'react';
import {
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
  Upload,
  Divider,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
} from '@ant-design/icons';
import './MeetingMinutes.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function MeetingMinutes() {
  const [form] = Form.useForm();
  const [minutesData, setMinutesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [editingMinutes, setEditingMinutes] = useState(null);

  const mockMinutesData = [
    {
      id: 1,
      meetingNumber: 'MM-2024-001',
      meetingType: 'Board Meeting',
      meetingDate: '2024-03-30',
      meetingTime: '09:00',
      location: 'Main Conference Room',
      chairman: 'John Smith',
      secretary: 'Sarah Johnson',
      attendees: [
        { name: 'John Smith', role: 'Chairman', present: true },
        { name: 'Sarah Johnson', role: 'Secretary', present: true },
        { name: 'Michael Brown', role: 'CEO', present: true },
        { name: 'Emily Davis', role: 'CFO', present: true },
        { name: 'Robert Wilson', role: 'CTO', present: true },
      ],
      agenda: [
        'Q1 2024 Financial Review',
        'Strategic Planning Discussion',
        'Budget Approval for Q2',
        'New Initiative Proposals',
      ],
      discussions: [
        {
          topic: 'Q1 2024 Financial Review',
          presenter: 'Emily Davis',
          summary:
            'Revenue increased by 15% compared to Q1 2023. Operating costs reduced by 8% through efficiency improvements.',
          decisions: 'Approved financial statements and performance metrics',
        },
        {
          topic: 'Strategic Planning Discussion',
          presenter: 'Michael Brown',
          summary: 'Discussed expansion into new markets and digital transformation initiatives.',
          decisions: 'Approved strategic roadmap for 2024-2025',
        },
      ],
      decisions: [
        {
          decision: 'Budget Approval for Q2',
          details: 'Approved budget of $500,000 for marketing and expansion initiatives',
          responsible: 'Emily Davis',
          deadline: '2024-04-15',
        },
      ],
      actionItems: [
        {
          item: 'Prepare detailed implementation plan',
          assignee: 'Robert Wilson',
          deadline: '2024-04-10',
          status: 'pending',
        },
        {
          item: 'Schedule follow-up meeting with department heads',
          assignee: 'Sarah Johnson',
          deadline: '2024-04-05',
          status: 'completed',
        },
      ],
      nextMeeting: '2024-04-30',
      attachments: ['financial_report_q1.pdf', 'strategic_plan.pdf'],
      status: 'approved',
      createdBy: 'Sarah Johnson',
      createdDate: '2024-03-30',
    },
    {
      id: 2,
      meetingNumber: 'MM-2024-002',
      meetingType: 'Department Meeting',
      meetingDate: '2024-03-28',
      meetingTime: '14:00',
      location: 'IT Department Room',
      chairman: 'Robert Wilson',
      secretary: 'David Lee',
      attendees: [
        { name: 'Robert Wilson', role: 'CTO', present: true },
        { name: 'David Lee', role: 'IT Manager', present: true },
        { name: 'Lisa Chen', role: 'Lead Developer', present: true },
        { name: 'James Park', role: 'System Admin', present: true },
      ],
      agenda: [
        'System Performance Review',
        'Security Updates',
        'Project Status Updates',
        'Resource Allocation',
      ],
      discussions: [
        {
          topic: 'System Performance Review',
          presenter: 'Lisa Chen',
          summary: 'System uptime maintained at 99.9%. Response time improved by 20%.',
          decisions: 'Continue current performance optimization strategies',
        },
      ],
      decisions: [
        {
          decision: 'Security System Upgrade',
          details: 'Approved budget for new security monitoring tools',
          responsible: 'James Park',
          deadline: '2024-04-15',
        },
      ],
      actionItems: [
        {
          item: 'Implement new security protocols',
          assignee: 'James Park',
          deadline: '2024-04-20',
          status: 'pending',
        },
      ],
      nextMeeting: '2024-04-25',
      attachments: ['performance_report.pdf'],
      status: 'draft',
      createdBy: 'David Lee',
      createdDate: '2024-03-28',
    },
  ];

  useEffect(() => {
    setMinutesData(mockMinutesData);
  }, []);

  const handleCreate = () => {
    setEditingMinutes(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (minutes) => {
    setEditingMinutes(minutes);
    form.setFieldsValue({
      meetingType: minutes.meetingType,
      meetingDate: minutes.meetingDate,
      meetingTime: minutes.meetingTime,
      location: minutes.location,
      chairman: minutes.chairman,
      secretary: minutes.secretary,
      agenda: minutes.agenda.join('\n'),
      nextMeeting: minutes.nextMeeting,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const newMinutes = {
        id: editingMinutes ? editingMinutes.id : Date.now(),
        meetingNumber: editingMinutes ? editingMinutes.meetingNumber : `MM-2024-${Date.now()}`,
        ...values,
        agenda: values.agenda.split('\n').filter((item) => item.trim()),
        attendees: [],
        discussions: [],
        decisions: [],
        actionItems: [],
        attachments: [],
        status: 'draft',
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
      };

      if (editingMinutes) {
        setMinutesData((prev) =>
          prev.map((item) => (item.id === editingMinutes.id ? newMinutes : item))
        );
        message.success('Meeting minutes updated successfully');
      } else {
        setMinutesData((prev) => [newMinutes, ...prev]);
        message.success('Meeting minutes created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingMinutes(null);
    } catch (error) {
      message.error('Failed to save meeting minutes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (minutes) => {
    setSelectedMinutes(minutes);
    setDetailModalVisible(true);
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      setMinutesData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
      );
      message.success('Meeting minutes approved successfully');
    } catch (error) {
      message.error('Failed to approve meeting minutes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'default';
      default:
        return 'blue';
    }
  };

  const columns = [
    {
      title: 'Meeting Number',
      dataIndex: 'meetingNumber',
      key: 'meetingNumber',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Meeting Type',
      dataIndex: 'meetingType',
      key: 'meetingType',
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => (
        <div>
          <div>{record.meetingDate}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.meetingTime}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Chairman',
      dataIndex: 'chairman',
      key: 'chairman',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
          <Button
            type='primary'
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'approved'}
          >
            Edit
          </Button>
          {record.status === 'draft' && (
            <Button
              type='primary'
              size='small'
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.id)}
              loading={loading}
            >
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='meeting-minutes'>
      <div className='page-header'>
        <Title level={2}>Meeting Minutes</Title>
        <Paragraph>Management meeting minutes and documentation</Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon'>📝</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Minutes</div>
                <div className='statistic-value'>{minutesData.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card draft'>
              <div className='statistic-icon'>📄</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Draft</div>
                <div className='statistic-value'>
                  {minutesData.filter((m) => m.status === 'draft').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card approved'>
              <div className='statistic-icon'>✅</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Approved</div>
                <div className='statistic-value'>
                  {minutesData.filter((m) => m.status === 'approved').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon'>👥</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Attendees</div>
                <div className='statistic-value'>
                  {minutesData.reduce((sum, m) => sum + (m.attendees?.length || 0), 0)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title='Meeting Minutes List'
        extra={
          <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
            Create Minutes
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={minutesData}
          rowKey='id'
          loading={loading}
          pagination={{
            total: minutesData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} minutes`,
          }}
        />
      </Card>

      <Modal
        title={editingMinutes ? 'Edit Meeting Minutes' : 'Create Meeting Minutes'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingMinutes(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='meetingType'
                label='Meeting Type'
                rules={[{ required: true, message: 'Please select meeting type!' }]}
              >
                <Select placeholder='Select meeting type'>
                  <Option value='Board Meeting'>Board Meeting</Option>
                  <Option value='Department Meeting'>Department Meeting</Option>
                  <Option value='Project Meeting'>Project Meeting</Option>
                  <Option value='Committee Meeting'>Committee Meeting</Option>
                  <Option value='General Meeting'>General Meeting</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='location'
                label='Location'
                rules={[{ required: true, message: 'Please enter location!' }]}
              >
                <Input placeholder='Meeting location' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                name='meetingDate'
                label='Meeting Date'
                rules={[{ required: true, message: 'Please select meeting date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name='meetingTime'
                label='Meeting Time'
                rules={[{ required: true, message: 'Please enter meeting time!' }]}
              >
                <Input placeholder='09:00' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='nextMeeting' label='Next Meeting'>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='chairman'
                label='Chairman'
                rules={[{ required: true, message: 'Please enter chairman!' }]}
              >
                <Input placeholder='Chairman name' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='secretary'
                label='Secretary'
                rules={[{ required: true, message: 'Please enter secretary!' }]}
              >
                <Input placeholder='Secretary name' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='agenda'
            label='Agenda'
            rules={[{ required: true, message: 'Please enter agenda!' }]}
          >
            <TextArea rows={4} placeholder='Enter agenda items (one per line)' />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                {editingMinutes ? 'Update' : 'Create'} Minutes
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title='Meeting Minutes Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMinutes(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key='print' type='primary' icon={<PrinterOutlined />}>
            Print
          </Button>,
          <Button key='download' icon={<DownloadOutlined />}>
            Download PDF
          </Button>,
        ]}
        width={1000}
      >
        {selectedMinutes && (
          <div className='minutes-detail'>
            <div className='minutes-header'>
              <Title level={3}>{selectedMinutes.meetingNumber}</Title>
              <Paragraph>
                <strong>Meeting Type:</strong> {selectedMinutes.meetingType}
              </Paragraph>
              <Paragraph>
                <strong>Date:</strong> {selectedMinutes.meetingDate} at{' '}
                {selectedMinutes.meetingTime}
              </Paragraph>
              <Paragraph>
                <strong>Location:</strong> {selectedMinutes.location}
              </Paragraph>
              <Divider />
              <Paragraph>
                <strong>Chairman:</strong> {selectedMinutes.chairman}
              </Paragraph>
              <Paragraph>
                <strong>Secretary:</strong> {selectedMinutes.secretary}
              </Paragraph>
              <Paragraph>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedMinutes.status)}>
                  {selectedMinutes.status.toUpperCase()}
                </Tag>
              </Paragraph>
            </div>

            <div className='minutes-section'>
              <Title level={4}>Attendees</Title>
              <table className='attendees-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMinutes.attendees.map((attendee, index) => (
                    <tr key={index}>
                      <td>{attendee.name}</td>
                      <td>{attendee.role}</td>
                      <td>
                        <Tag color={attendee.present ? 'green' : 'red'}>
                          {attendee.present ? 'Present' : 'Absent'}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='minutes-section'>
              <Title level={4}>Agenda</Title>
              <ul>
                {selectedMinutes.agenda.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className='minutes-section'>
              <Title level={4}>Discussions</Title>
              {selectedMinutes.discussions.map((discussion, index) => (
                <div key={index} className='discussion-item'>
                  <Title level={5}>{discussion.topic}</Title>
                  <Paragraph>
                    <strong>Presenter:</strong> {discussion.presenter}
                  </Paragraph>
                  <Paragraph>{discussion.summary}</Paragraph>
                  <Paragraph>
                    <strong>Decisions:</strong> {discussion.decisions}
                  </Paragraph>
                </div>
              ))}
            </div>

            <div className='minutes-section'>
              <Title level={4}>Decisions</Title>
              {selectedMinutes.decisions.map((decision, index) => (
                <div key={index} className='decision-item'>
                  <Title level={5}>{decision.decision}</Title>
                  <Paragraph>{decision.details}</Paragraph>
                  <Paragraph>
                    <strong>Responsible:</strong> {decision.responsible}
                  </Paragraph>
                  <Paragraph>
                    <strong>Deadline:</strong> {decision.deadline}
                  </Paragraph>
                </div>
              ))}
            </div>

            <div className='minutes-section'>
              <Title level={4}>Action Items</Title>
              {selectedMinutes.actionItems.map((action, index) => (
                <div key={index} className='action-item'>
                  <Paragraph>
                    <strong>• {action.item}</strong>
                  </Paragraph>
                  <Paragraph>
                    <strong>Assignee:</strong> {action.assignee}
                  </Paragraph>
                  <Paragraph>
                    <strong>Deadline:</strong> {action.deadline}
                  </Paragraph>
                  <Paragraph>
                    <strong>Status:</strong>{' '}
                    <Tag color={action.status === 'completed' ? 'green' : 'orange'}>
                      {action.status.toUpperCase()}
                    </Tag>
                  </Paragraph>
                </div>
              ))}
            </div>

            <div className='minutes-section'>
              <Title level={4}>Next Meeting</Title>
              <Paragraph>{selectedMinutes.nextMeeting}</Paragraph>
            </div>

            <div className='minutes-section'>
              <Title level={4}>Attachments</Title>
              <Space>
                {selectedMinutes.attachments.map((file, index) => (
                  <Tag key={index} icon={<FileTextOutlined />}>
                    {file}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
