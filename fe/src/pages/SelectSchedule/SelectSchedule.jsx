import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  message,
  Steps,
  Table,
  Tag,
  Space,
  Alert,
} from 'antd';
import { CalendarOutlined, TeamOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './SelectSchedule.css';

const { Option } = Select;
const { Step } = Steps;

export default function SelectSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryData } = location.state || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    category: categoryData?.category || '',
    subcategory: categoryData?.subcategory || '',
    priority: categoryData?.priority || 'medium',
    criticality: categoryData?.criticality || 'medium',
    description: categoryData?.description || '',
    requester: categoryData?.requester || '',
    department: categoryData?.department || '',
    location: categoryData?.location || '',
    required_skills: categoryData?.required_skills || [],
    estimated_duration: categoryData?.estimated_duration || 2,
    required_date: categoryData?.required_date || '',
    schedule_date: '',
    schedule_time: '',
    assigned_team: '',
    team_members: [],
    tools_required: [],
    materials_required: [],
    notes: '',
  });

  const teams = [
    {
      id: 1,
      name: 'Maintenance Team Alpha',
      leader: 'John Smith',
      members: ['John Smith', 'Mike Johnson', 'Sarah Wilson'],
      specialization: 'Preventive Maintenance',
      availability: 'available',
      current_workload: 3,
      max_workload: 5,
    },
    {
      id: 2,
      name: 'Technical Support Team',
      leader: 'David Brown',
      members: ['David Brown', 'Tom Davis', 'Lisa Anderson'],
      specialization: 'Corrective Maintenance',
      availability: 'available',
      current_workload: 2,
      max_workload: 4,
    },
    {
      id: 3,
      name: 'Emergency Response Team',
      leader: 'Robert Taylor',
      members: ['Robert Taylor', 'James White', 'Jennifer Martin'],
      specialization: 'Emergency Repairs',
      availability: 'busy',
      current_workload: 5,
      max_workload: 5,
    },
    {
      id: 4,
      name: 'Specialized Equipment Team',
      leader: 'William Harris',
      members: ['William Harris', 'Chris Clark', 'Amanda Lewis'],
      specialization: 'Heavy Equipment',
      availability: 'available',
      current_workload: 1,
      max_workload: 3,
    },
  ];

  const availableSlots = [
    { time: '08:00', available: true },
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
  ];

  useEffect(() => {
    if (categoryData) {
      setScheduleData((prev) => ({
        ...prev,
        category: categoryData.category,
        subcategory: categoryData.subcategory,
        priority: categoryData.priority,
        criticality: categoryData.criticality,
        description: categoryData.description,
        requester: categoryData.requester,
        department: categoryData.department,
        location: categoryData.location,
        required_skills: categoryData.required_skills,
        estimated_duration: categoryData.estimated_duration,
        required_date: categoryData.required_date,
      }));
      form.setFieldsValue({
        category: categoryData.category,
        subcategory: categoryData.subcategory,
        priority: categoryData.priority,
        criticality: categoryData.criticality,
        description: categoryData.description,
        requester: categoryData.requester,
        department: categoryData.department,
        location: categoryData.location,
        required_skills: categoryData.required_skills,
        estimated_duration: categoryData.estimated_duration,
        required_date: categoryData.required_date,
      });
    }
  }, [categoryData, form]);

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
    setScheduleData((prev) => ({ ...prev, schedule_date: dateString }));
  };

  const handleTimeChange = (time, timeString) => {
    setSelectedTime(timeString);
    setScheduleData((prev) => ({ ...prev, schedule_time: timeString }));
  };

  const handleTeamChange = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    setSelectedTeam(team);
    setScheduleData((prev) => ({
      ...prev,
      assigned_team: team.name,
      team_members: team.members,
    }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const finalScheduleData = {
        ...scheduleData,
        ...values,
        schedule_date: selectedDate,
        schedule_time: selectedTime,
        assigned_team: selectedTeam?.name,
        team_members: selectedTeam?.members || [],
      };

      // Navigate to maintenance schedule with schedule data
      navigate('/maintenance-schedule', {
        state: {
          categoryData: categoryData,
          scheduleData: finalScheduleData,
        },
      });

      message.success('Schedule selected successfully');
    } catch (error) {
      message.error('Failed to select schedule');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTeamAvailabilityColor = (team) => {
    if (team.availability === 'busy') return 'red';
    if (team.current_workload >= team.max_workload - 1) return 'orange';
    return 'green';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'green';
      case 'medium':
        return 'blue';
      case 'high':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'low':
        return 'green';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      default:
        return 'default';
    }
  };

  const teamColumns = [
    {
      title: 'Team Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Team Leader',
      dataIndex: 'leader',
      key: 'leader',
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => (
        <div>
          {record.members.map((member, index) => (
            <Tag key={index} size='small'>
              {member}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Workload',
      key: 'workload',
      render: (_, record) => (
        <div>
          <div>
            {record.current_workload}/{record.max_workload}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {Math.round((record.current_workload / record.max_workload) * 100)}% utilized
          </div>
        </div>
      ),
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_, record) => (
        <Tag color={getTeamAvailabilityColor(record)}>{record.availability.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          size='small'
          onClick={() => handleTeamChange(record.id)}
          disabled={record.availability === 'busy'}
        >
          {record.availability === 'busy' ? 'Unavailable' : 'Select Team'}
        </Button>
      ),
    },
  ];

  return (
    <div className='select-schedule'>
      <div className='page-header'>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          Back to Category Selection
        </Button>
        <h1>Select Maintenance Schedule</h1>
        <p>Choose date, time, and team for maintenance scheduling</p>
      </div>

      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title='Date & Time' icon={<CalendarOutlined />} />
          <Step title='Team Selection' icon={<TeamOutlined />} />
          <Step title='Review & Submit' icon={<CheckCircleOutlined />} />
        </Steps>

        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          {/* Step 1: Date & Time Selection */}
          {currentStep === 0 && (
            <div className='step-content'>
              <Card size='small' title='Request Summary' style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <p>
                      <strong>Category:</strong> {scheduleData.category}
                    </p>
                    <p>
                      <strong>Subcategory:</strong> {scheduleData.subcategory}
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Priority:</strong>{' '}
                      <Tag color={getPriorityColor(scheduleData.priority)}>
                        {scheduleData.priority.toUpperCase()}
                      </Tag>
                    </p>
                    <p>
                      <strong>Criticality:</strong>{' '}
                      <Tag color={getCriticalityColor(scheduleData.criticality)}>
                        {scheduleData.criticality?.toUpperCase() || 'MEDIUM'}
                      </Tag>
                    </p>
                    <p>
                      <strong>Duration:</strong> {scheduleData.estimated_duration} hours
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Location:</strong> {scheduleData.location}
                    </p>
                    <p>
                      <strong>Required Date:</strong> {scheduleData.required_date}
                    </p>
                    <p>
                      <strong>Required Skills:</strong>{' '}
                      {scheduleData.required_skills?.map((skill, index) => (
                        <Tag key={index} color='blue' style={{ marginBottom: 4 }}>
                          {skill}
                        </Tag>
                      ))}
                    </p>
                  </Col>
                </Row>
              </Card>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name='schedule_date'
                    label='Schedule Date'
                    rules={[{ required: true, message: 'Please select schedule date!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      onChange={handleDateChange}
                      placeholder='Select maintenance date'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name='schedule_time'
                    label='Schedule Time'
                    rules={[{ required: true, message: 'Please select schedule time!' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      onChange={handleTimeChange}
                      format='HH:mm'
                      placeholder='Select maintenance time'
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Card size='small' title='Available Time Slots' style={{ marginBottom: 16 }}>
                <div className='time-slots'>
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`time-slot ${!slot.available ? 'unavailable' : ''}`}
                    >
                      <span>{slot.time}</span>
                      <Tag color={slot.available ? 'green' : 'red'}>
                        {slot.available ? 'Available' : 'Occupied'}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>

              <Form.Item name='notes' label='Special Requirements'>
                <Input.TextArea
                  rows={3}
                  placeholder='Any special requirements or notes for the maintenance...'
                />
              </Form.Item>
            </div>
          )}

          {/* Step 2: Team Selection */}
          {currentStep === 1 && (
            <div className='step-content'>
              <Card size='small' title='Schedule Information' style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <p>
                      <strong>Date:</strong> {selectedDate || 'Not selected'}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedTime || 'Not selected'}
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Category:</strong> {scheduleData.category}
                    </p>
                    <p>
                      <strong>Duration:</strong> {scheduleData.estimated_duration} hours
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Location:</strong> {scheduleData.location}
                    </p>
                    <p>
                      <strong>Priority:</strong>{' '}
                      <Tag color={getPriorityColor(scheduleData.priority)}>
                        {scheduleData.priority.toUpperCase()}
                      </Tag>
                    </p>
                  </Col>
                </Row>
              </Card>

              <Form.Item
                name='assigned_team'
                label='Available Teams'
                rules={[{ required: true, message: 'Please select a team!' }]}
              >
                <Table
                  columns={teamColumns}
                  dataSource={teams}
                  rowKey='id'
                  pagination={false}
                  size='small'
                  rowClassName={(record) => (selectedTeam?.id === record.id ? 'selected-row' : '')}
                />
              </Form.Item>

              {selectedTeam && (
                <Card size='small' title='Selected Team Details' style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p>
                        <strong>Team Name:</strong> {selectedTeam.name}
                      </p>
                      <p>
                        <strong>Team Leader:</strong> {selectedTeam.leader}
                      </p>
                      <p>
                        <strong>Specialization:</strong> {selectedTeam.specialization}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>Members:</strong>
                      </p>
                      <div className='team-members'>
                        {selectedTeam.members.map((member, index) => (
                          <Tag key={index} icon={<TeamOutlined />}>
                            {member}
                          </Tag>
                        ))}
                      </div>
                      <p>
                        <strong>Current Workload:</strong> {selectedTeam.current_workload}/
                        {selectedTeam.max_workload}
                      </p>
                    </Col>
                  </Row>
                </Card>
              )}

              <Form.Item name='tools_required' label='Tools Required'>
                <Select
                  mode='multiple'
                  placeholder='Select tools required'
                  style={{ width: '100%' }}
                >
                  <Option value='Wrench Set'>Wrench Set</Option>
                  <Option value='Screwdriver Set'>Screwdriver Set</Option>
                  <Option value='Multimeter'>Multimeter</Option>
                  <Option value='Power Tools'>Power Tools</Option>
                  <Option value='Safety Equipment'>Safety Equipment</Option>
                  <Option value='Ladder'>Ladder</Option>
                </Select>
              </Form.Item>

              <Form.Item name='materials_required' label='Materials Required'>
                <Select
                  mode='multiple'
                  placeholder='Select materials required'
                  style={{ width: '100%' }}
                >
                  <Option value='Lubricants'>Lubricants</Option>
                  <Option value='Filters'>Filters</Option>
                  <Option value='Bolts & Nuts'>Bolts & Nuts</Option>
                  <Option value='Electrical Parts'>Electrical Parts</Option>
                  <Option value='Cleaning Supplies'>Cleaning Supplies</Option>
                  <Option value='Safety Gear'>Safety Gear</Option>
                </Select>
              </Form.Item>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 2 && (
            <div className='step-content'>
              <Card title='Schedule Summary' style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className='summary-section'>
                      <h4>Maintenance Details</h4>
                      <p>
                        <strong>Category:</strong> {scheduleData.category}
                      </p>
                      <p>
                        <strong>Subcategory:</strong> {scheduleData.subcategory}
                      </p>
                      <p>
                        <strong>Priority:</strong>{' '}
                        <Tag color={getPriorityColor(scheduleData.priority)}>
                          {scheduleData.priority.toUpperCase()}
                        </Tag>
                      </p>
                      <p>
                        <strong>Criticality:</strong>{' '}
                        <Tag color={getCriticalityColor(scheduleData.criticality)}>
                          {scheduleData.criticality?.toUpperCase() || 'MEDIUM'}
                        </Tag>
                      </p>
                      <p>
                        <strong>Duration:</strong> {scheduleData.estimated_duration} hours
                      </p>
                      <p>
                        <strong>Location:</strong> {scheduleData.location}
                      </p>
                      <p>
                        <strong>Required Skills:</strong>{' '}
                        {scheduleData.required_skills?.map((skill, index) => (
                          <Tag key={index} color='blue' style={{ marginBottom: 4 }}>
                            {skill}
                          </Tag>
                        ))}
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className='summary-section'>
                      <h4>Schedule Information</h4>
                      <p>
                        <strong>Date:</strong> {selectedDate}
                      </p>
                      <p>
                        <strong>Time:</strong> {selectedTime}
                      </p>
                      <p>
                        <strong>Assigned Team:</strong> {selectedTeam?.name}
                      </p>
                      <p>
                        <strong>Team Leader:</strong> {selectedTeam?.leader}
                      </p>
                      <p>
                        <strong>Team Members:</strong> {selectedTeam?.members.join(', ')}
                      </p>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div className='summary-section'>
                      <h4>Request Description</h4>
                      <p>{scheduleData.description}</p>
                      {scheduleData.notes && (
                        <p>
                          <strong>Special Requirements:</strong> {scheduleData.notes}
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>

              <Alert
                message='Schedule Confirmation'
                description='Please review all the information above before submitting the maintenance schedule. Once submitted, the assigned team will be notified automatically.'
                type='info'
                showIcon
                style={{ marginBottom: 16 }}
              />
            </div>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={prevStep} icon={<LeftOutlined />}>
                  Previous
                </Button>
              )}
              {currentStep < 2 && (
                <Button type='primary' onClick={nextStep} icon={<RightOutlined />}>
                  Next
                </Button>
              )}
              {currentStep === 2 && (
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  Submit Schedule
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
