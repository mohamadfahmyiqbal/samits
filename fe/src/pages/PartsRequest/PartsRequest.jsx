import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, Select, message, Badge } from 'antd';
import {
  ToolOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function PartsRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [requestData, setRequestData] = useState([]);

  const mockRequestData = [
    {
      id: 1,
      request_code: 'PR-2024-001',
      work_order_ref: 'WO-2024-001',
      part_name: 'Power Supply Dell XPS',
      part_number: 'PS-DELL-450W',
      quantity: 1,
      urgency: 'high',
      status: 'pending',
      requester: 'Tech John',
      request_date: '2024-03-28',
      estimated_cost: 1500000,
      vendor: 'PT Elektronik Jaya',
    },
    {
      id: 2,
      request_code: 'PR-2024-002',
      work_order_ref: 'WO-2024-002',
      part_name: 'Cooling Fan HP ProLiant',
      part_number: 'CF-HP-120MM',
      quantity: 2,
      urgency: 'medium',
      status: 'approved',
      requester: 'Tech Jane',
      request_date: '2024-03-27',
      estimated_cost: 2500000,
      vendor: 'PT Hardware Solution',
    },
    {
      id: 3,
      request_code: 'PR-2024-003',
      work_order_ref: 'WO-2024-003',
      part_name: 'Thermal Paste',
      part_number: 'TP-ARCTIC-MX4',
      quantity: 5,
      urgency: 'low',
      status: 'ordered',
      requester: 'Tech Mike',
      request_date: '2024-03-26',
      estimated_cost: 750000,
      vendor: 'PT Cooling Specialist',
    },
  ];

  useEffect(() => {
    setRequestData(mockRequestData);
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'blue';
      case 'ordered':
        return 'purple';
      case 'received':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const filteredRequests = requestData.filter(
    (req) =>
      req.request_code.toLowerCase().includes(searchText.toLowerCase()) ||
      req.part_name.toLowerCase().includes(searchText.toLowerCase()) ||
      req.work_order_ref.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Kode',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'WO Ref',
      dataIndex: 'work_order_ref',
      key: 'work_order_ref',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
    },
    {
      title: 'Part Number',
      dataIndex: 'part_number',
      key: 'part_number',
      render: (text) => <code>{text}</code>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => <Tag color={getUrgencyColor(urgency)}>{urgency.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={
            status === 'received'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : status === 'approved'
                  ? 'processing'
                  : status === 'rejected'
                    ? 'error'
                    : 'default'
          }
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Estimasi',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost) => `Rp ${cost.toLocaleString('id-ID')}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='primary' size='small' icon={<EyeOutlined />}>
            Detail
          </Button>
          {record.status === 'pending' && (
            <Button type='primary' size='small' icon={<SendOutlined />}>
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='parts-request'>
      <div className='page-header'>
        <h1>Parts Request</h1>
        <p>Pengajuan dan manajemen permintaan spare parts</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {requestData.length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total Requests</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {requestData.filter((r) => r.status === 'pending').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Pending</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {requestData.filter((r) => r.status === 'received').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Received</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Button
                type='primary'
                size='large'
                icon={<PlusOutlined />}
                style={{ width: '100%', height: '80px' }}
              >
                Request Part
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari request (kode, part name, WO ref...)'
              prefix={<ToolOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} placeholder='Filter Status' defaultValue='all'>
              <Option value='all'>Semua Status</Option>
              <Option value='pending'>Pending</Option>
              <Option value='approved'>Approved</Option>
              <Option value='ordered'>Ordered</Option>
              <Option value='received'>Received</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredRequests.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
}
