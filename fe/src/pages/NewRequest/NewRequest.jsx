import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, Select, message, Badge } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function NewRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [requestData, setRequestData] = useState([]);

  const mockRequestData = [
    {
      id: 1,
      request_code: 'REQ-2024-001',
      request_type: 'New Asset',
      asset_name: 'Laptop Dell XPS 15',
      requester: 'John Doe',
      department: 'IT',
      request_date: '2024-03-25',
      status: 'pending',
      priority: 'high',
      estimated_cost: 25000000,
    },
    {
      id: 2,
      request_code: 'REQ-2024-002',
      request_type: 'Replacement',
      asset_name: 'Monitor LG 27 inch',
      requester: 'Jane Smith',
      department: 'HR',
      request_date: '2024-03-24',
      status: 'approved',
      priority: 'medium',
      estimated_cost: 4500000,
    },
    {
      id: 3,
      request_code: 'REQ-2024-003',
      request_type: 'Upgrade',
      asset_name: 'RAM 32GB DDR4',
      requester: 'Mike Johnson',
      department: 'Finance',
      request_date: '2024-03-23',
      status: 'rejected',
      priority: 'low',
      estimated_cost: 2000000,
    },
  ];

  useEffect(() => {
    setRequestData(mockRequestData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'completed':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'approved':
        return 'APPROVED';
      case 'rejected':
        return 'REJECTED';
      case 'completed':
        return 'COMPLETED';
      default:
        return status.toUpperCase();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const filteredRequests = requestData.filter((req) => {
    const matchesSearch =
      req.request_code.toLowerCase().includes(searchText.toLowerCase()) ||
      req.asset_name.toLowerCase().includes(searchText.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = () => {
    navigate('/aset');
  };

  const handleViewDetail = (record) => {
    message.info(`View detail for ${record.request_code}`);
  };

  const columns = [
    {
      title: 'Kode Request',
      dataIndex: 'request_code',
      key: 'request_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tipe',
      dataIndex: 'request_type',
      key: 'request_type',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Nama Aset',
      dataIndex: 'asset_name',
      key: 'asset_name',
    },
    {
      title: 'Requester',
      dataIndex: 'requester',
      key: 'requester',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.department}</small>
        </div>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'request_date',
      key: 'request_date',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
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
      ),
    },
    {
      title: 'Estimasi Biaya',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost) => `Rp ${cost.toLocaleString('id-ID')}`,
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
          {record.status === 'approved' && (
            <Button
              type='primary'
              size='small'
              icon={<ArrowRightOutlined />}
              onClick={() =>
                navigate('/req-aset', { state: { request_code: record.request_code } })
              }
            >
              Process
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='new-request'>
      <div className='page-header'>
        <h1>New Request</h1>
        <p>Kelola pengajuan aset baru</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
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
              <Badge status='warning' />
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
                {requestData.filter((r) => r.status === 'approved').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Approved</p>
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
                onClick={handleCreateRequest}
                style={{ width: '100%', height: '80px' }}
              >
                Buat Request Baru
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari request (kode, nama aset, requester...)'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder='Filter Status'
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value='all'>Semua Status</Option>
              <Option value='pending'>Pending</Option>
              <Option value='approved'>Approved</Option>
              <Option value='rejected'>Rejected</Option>
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
