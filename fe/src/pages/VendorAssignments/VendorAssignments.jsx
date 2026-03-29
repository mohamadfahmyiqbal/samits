import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, message, Avatar, Rate } from 'antd';
import {
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  PlusOutlined,
  EyeOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function VendorAssignments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [vendorData, setVendorData] = useState([]);

  const mockVendorData = [
    {
      id: 1,
      vendor_code: 'VDR-001',
      company_name: 'PT Teknologi Jaya',
      contact_person: 'Budi Santoso',
      phone: '021-12345678',
      email: 'budi@teknologijaya.co.id',
      category: 'Hardware Supplier',
      status: 'active',
      rating: 4.5,
      total_assignments: 15,
      completed_assignments: 14,
    },
    {
      id: 2,
      vendor_code: 'VDR-002',
      company_name: 'PT Elektronik Nusantara',
      contact_person: 'Siti Aminah',
      phone: '021-87654321',
      email: 'siti@elektronikusantara.co.id',
      category: 'Electronics',
      status: 'active',
      rating: 4.8,
      total_assignments: 23,
      completed_assignments: 23,
    },
    {
      id: 3,
      vendor_code: 'VDR-003',
      company_name: 'PT Hardware Solution',
      contact_person: 'Ahmad Fauzi',
      phone: '021-55556666',
      email: 'ahmad@hardwaresolution.co.id',
      category: 'Server & Network',
      status: 'inactive',
      rating: 3.2,
      total_assignments: 8,
      completed_assignments: 5,
    },
  ];

  useEffect(() => {
    setVendorData(mockVendorData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const filteredVendors = vendorData.filter(
    (vendor) =>
      vendor.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
      vendor.contact_person.toLowerCase().includes(searchText.toLowerCase()) ||
      vendor.vendor_code.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Kode',
      dataIndex: 'vendor_code',
      key: 'vendor_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Vendor',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<TeamOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <small style={{ color: '#888' }}>{record.category}</small>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: 'Kontak',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined /> {record.phone}
          </div>
          <div>
            <MailOutlined /> {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12 }} />
      ),
    },
    {
      title: 'Assignments',
      key: 'assignments',
      render: (_, record) => (
        <span>
          {record.completed_assignments}/{record.total_assignments}
          <Tag
            color={record.completed_assignments === record.total_assignments ? 'green' : 'orange'}
            style={{ marginLeft: 8 }}
          >
            {Math.round((record.completed_assignments / record.total_assignments) * 100)}%
          </Tag>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          icon={status === 'active' ? <CheckCircleOutlined /> : null}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space>
          <Button type='primary' size='small' icon={<EyeOutlined />}>
            Detail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='vendor-assignments'>
      <div className='page-header'>
        <h1>Vendor Assignments</h1>
        <p>Manajemen vendor dan kontraktor</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {vendorData.length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total Vendors</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {vendorData.filter((v) => v.status === 'active').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Active</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <StarOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {(vendorData.reduce((acc, v) => acc + v.rating, 0) / vendorData.length).toFixed(1)}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Avg Rating</p>
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
                Add Vendor
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari vendor (nama, kode, contact person...)'
              prefix={<TeamOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredVendors}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredVendors.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
}
