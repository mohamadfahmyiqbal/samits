import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  message,
  Timeline,
  Badge,
} from 'antd';
import {
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  DeliveredProcedureOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function Delivery() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [deliveryData, setDeliveryData] = useState([]);

  const mockDeliveryData = [
    {
      id: 1,
      delivery_code: 'DEL-2024-001',
      po_code: 'PO-2024-001',
      supplier: 'PT Teknologi Jaya',
      items: [
        { name: 'Laptop Dell XPS 15', qty: 5, unit: 'unit' },
        { name: 'Mouse Logitech', qty: 5, unit: 'unit' },
      ],
      delivery_date: '2024-03-28',
      status: 'delivered',
      receiver: 'John Doe',
      location: 'IT Office - Lantai 2',
      notes: 'Diterima dalam kondisi baik',
    },
    {
      id: 2,
      delivery_code: 'DEL-2024-002',
      po_code: 'PO-2024-002',
      supplier: 'PT Elektronik Nusantara',
      items: [{ name: 'Monitor LG 27 inch', qty: 3, unit: 'unit' }],
      delivery_date: '2024-03-27',
      status: 'in_transit',
      receiver: null,
      location: null,
      estimated_arrival: '2024-03-29',
    },
    {
      id: 3,
      delivery_code: 'DEL-2024-003',
      po_code: 'PO-2024-003',
      supplier: 'PT Hardware Solution',
      items: [
        { name: 'Server HP ProLiant', qty: 1, unit: 'unit' },
        { name: 'RAM 32GB', qty: 4, unit: 'unit' },
      ],
      delivery_date: null,
      status: 'pending',
      receiver: null,
      location: null,
      estimated_arrival: '2024-04-02',
    },
  ];

  useEffect(() => {
    setDeliveryData(mockDeliveryData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'in_transit':
        return 'blue';
      case 'delivered':
        return 'green';
      case 'partial':
        return 'yellow';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'MENUNGGU';
      case 'in_transit':
        return 'DALAM PENGIRIMAN';
      case 'delivered':
        return 'TERKIRIM';
      case 'partial':
        return 'SEBAGIAN';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'in_transit':
        return <TruckOutlined />;
      case 'delivered':
        return <CheckCircleOutlined />;
      default:
        return <InboxOutlined />;
    }
  };

  const filteredDeliveries = deliveryData.filter(
    (del) =>
      del.delivery_code.toLowerCase().includes(searchText.toLowerCase()) ||
      del.supplier.toLowerCase().includes(searchText.toLowerCase()) ||
      del.po_code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleReceiveDelivery = (record) => {
    message.success(`Delivery ${record.delivery_code} diterima!`);
    setDeliveryData((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: 'delivered',
              receiver: 'Current User',
              delivery_date: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const columns = [
    {
      title: 'Kode Delivery',
      dataIndex: 'delivery_code',
      key: 'delivery_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'PO Ref',
      dataIndex: 'po_code',
      key: 'po_code',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <div>
          {record.items.map((item, idx) => (
            <div key={idx} style={{ fontSize: '12px' }}>
              {item.name} ({item.qty} {item.unit})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Tanggal',
      key: 'date',
      render: (_, record) => (
        <div>
          {record.delivery_date ? (
            <span>{record.delivery_date}</span>
          ) : (
            <span style={{ color: '#888' }}>Est: {record.estimated_arrival}</span>
          )}
        </div>
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
          {record.status === 'in_transit' && (
            <Button
              type='primary'
              size='small'
              icon={<DeliveredProcedureOutlined />}
              onClick={() => handleReceiveDelivery(record)}
            >
              Terima
            </Button>
          )}
          {record.status === 'delivered' && (
            <Button
              size='small'
              icon={<ArrowRightOutlined />}
              onClick={() =>
                navigate('/delivery-distribusi', { state: { delivery_code: record.delivery_code } })
              }
            >
              Distribusi
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='delivery'>
      <div className='page-header'>
        <h1>Delivery</h1>
        <p>Monitoring dan penerimaan pengiriman aset</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {deliveryData.filter((d) => d.status === 'pending').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Menunggu</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TruckOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {deliveryData.filter((d) => d.status === 'in_transit').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Dalam Pengiriman</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {deliveryData.filter((d) => d.status === 'delivered').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Terkirim</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <InboxOutlined style={{ fontSize: 32, color: '#722ed1' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#722ed1' }}>
                {deliveryData.length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari delivery (kode, supplier, PO...)'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredDeliveries}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredDeliveries.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
}
