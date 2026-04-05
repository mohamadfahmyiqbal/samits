import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, Select, message, Timeline } from 'antd';
import {
  WarningOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function BreakdownLog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [breakdownData, setBreakdownData] = useState([]);

  const mockBreakdownData = [
    {
      id: 1,
      breakdown_code: 'BD-2024-001',
      equipment: 'Server HP ProLiant',
      location: 'Data Center',
      issue: 'Power supply failure',
      severity: 'critical',
      reported_by: 'John Doe',
      reported_date: '2024-03-28 08:30',
      status: 'in_progress',
      assigned_to: 'Tech Team Alpha',
      downtime_hours: 4.5,
      resolution: null,
      root_cause: null,
    },
    {
      id: 2,
      breakdown_code: 'BD-2024-002',
      equipment: 'Printer Canon LBP',
      location: 'HR Office',
      issue: 'Paper jam persistent',
      severity: 'low',
      reported_by: 'Jane Smith',
      reported_date: '2024-03-27 14:15',
      status: 'resolved',
      assigned_to: 'Tech Mike',
      downtime_hours: 2,
      resolution: 'Replaced roller mechanism',
      root_cause: 'Worn out paper feed roller',
    },
    {
      id: 3,
      breakdown_code: 'BD-2024-003',
      equipment: 'AC Data Center',
      issue: 'Cooling insufficient',
      severity: 'high',
      reported_by: 'System Admin',
      reported_date: '2024-03-26 11:00',
      status: 'resolved',
      assigned_to: 'HVAC Team',
      downtime_hours: 6,
      resolution: 'Replaced compressor',
      root_cause: 'Compressor failure',
    },
  ];

  useEffect(() => {
    setBreakdownData(mockBreakdownData);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'red';
      case 'in_progress':
        return 'blue';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'default';
    }
  };

  const filteredBreakdowns = breakdownData.filter((bd) => {
    const matchesSearch =
      bd.breakdown_code.toLowerCase().includes(searchText.toLowerCase()) ||
      bd.equipment.toLowerCase().includes(searchText.toLowerCase()) ||
      bd.issue.toLowerCase().includes(searchText.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' || bd.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const columns = [
    {
      title: 'Kode',
      dataIndex: 'breakdown_code',
      key: 'breakdown_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      key: 'issue',
      ellipsis: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag icon={<WarningOutlined />} color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Downtime',
      dataIndex: 'downtime_hours',
      key: 'downtime_hours',
      render: (hours, record) => <span>{hours ? `${hours} jam` : '-'}</span>,
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
          <Button type='primary' size='small' icon={<EyeOutlined />}>
            Detail
          </Button>
          {record.status !== 'resolved' && (
            <Button type='primary' size='small' icon={<ToolOutlined />}>
              Assign
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='breakdown-log'>
      <div className='page-header'>
        <h1>Breakdown Log</h1>
        <p>Log breakdown dan kegagalan equipment</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#ff4d4f' }}>
                {breakdownData.filter((b) => b.severity === 'critical').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Critical</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {
                  breakdownData.filter((b) => b.status === 'open' || b.status === 'in_progress')
                    .length
                }
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Open/In Progress</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {breakdownData.filter((b) => b.status === 'resolved').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Resolved</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {breakdownData.reduce((acc, bd) => acc + (bd.downtime_hours || 0), 0)} jam
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total Downtime</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari breakdown (kode, equipment, issue...)'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder='Filter Severity'
              value={filterSeverity}
              onChange={setFilterSeverity}
            >
              <Option value='all'>Semua Severity</Option>
              <Option value='critical'>Critical</Option>
              <Option value='high'>High</Option>
              <Option value='medium'>Medium</Option>
              <Option value='low'>Low</Option>
            </Select>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type='primary' icon={<PlusOutlined />}>
              Report Breakdown
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredBreakdowns}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredBreakdowns.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
}
