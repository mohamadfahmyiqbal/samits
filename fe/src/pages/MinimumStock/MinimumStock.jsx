import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Space,
  message,
  Input,
  Select,
  Modal,
  Alert,
} from 'antd';
import { ReloadOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import './MinimumStock.css';

const { Option } = Select;
const { Search } = Input;

export default function MinimumStock() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addStockModalVisible, setAddStockModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  const mockStockData = [
    {
      id: 1,
      part_code: 'RAM-002',
      part_name: 'DDR4 16GB 3200MHz RAM',
      category: 'Memory',
      current_stock: 8,
      minimum_stock: 15,
      maximum_stock: 40,
      unit: 'pcs',
      location: 'Warehouse A - Rack 2',
      supplier: 'PT. Kingston Indonesia',
      last_restock: '2024-03-15',
      days_since_restock: 13,
      status: 'low',
      shortage: 7,
      estimated_restock_date: '2024-04-15',
      price: 1200000,
      urgency: 'medium',
    },
    {
      id: 2,
      part_code: 'PSU-004',
      part_name: 'Power Supply 750W 80+ Gold',
      category: 'Power Supply',
      current_stock: 5,
      minimum_stock: 12,
      maximum_stock: 30,
      unit: 'pcs',
      location: 'Warehouse A - Rack 3',
      supplier: 'PT. Corsair Indonesia',
      last_restock: '2024-03-10',
      days_since_restock: 18,
      status: 'critical',
      shortage: 7,
      estimated_restock_date: '2024-04-10',
      price: 2200000,
      urgency: 'high',
    },
    {
      id: 3,
      part_code: 'FAN-006',
      part_name: 'Case Fan 120mm RGB',
      category: 'Cooling',
      current_stock: 3,
      minimum_stock: 10,
      maximum_stock: 25,
      unit: 'pcs',
      location: 'Warehouse B - Rack 1',
      supplier: 'PT. Cooler Master Indonesia',
      last_restock: '2024-03-05',
      days_since_restock: 23,
      status: 'critical',
      shortage: 7,
      estimated_restock_date: '2024-04-05',
      price: 350000,
      urgency: 'high',
    },
    {
      id: 4,
      part_code: 'MB-007',
      part_name: 'Motherboard B660M Gaming',
      category: 'Motherboard',
      current_stock: 11,
      minimum_stock: 15,
      maximum_stock: 35,
      unit: 'pcs',
      location: 'Warehouse A - Rack 1',
      supplier: 'PT. ASUS Indonesia',
      last_restock: '2024-03-18',
      days_since_restock: 10,
      status: 'low',
      shortage: 4,
      estimated_restock_date: '2024-04-18',
      price: 3200000,
      urgency: 'medium',
    },
    {
      id: 5,
      part_code: 'CAB-008',
      part_name: 'SATA Data Cable 1m',
      category: 'Accessories',
      current_stock: 2,
      minimum_stock: 20,
      maximum_stock: 50,
      unit: 'pcs',
      location: 'Warehouse B - Rack 3',
      supplier: 'PT. Vention Indonesia',
      last_restock: '2024-03-01',
      days_since_restock: 27,
      status: 'critical',
      shortage: 18,
      estimated_restock_date: '2024-04-01',
      price: 45000,
      urgency: 'critical',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Memory', label: 'Memory' },
    { value: 'Power Supply', label: 'Power Supply' },
    { value: 'Cooling', label: 'Cooling' },
    { value: 'Motherboard', label: 'Motherboard' },
    { value: 'Accessories', label: 'Accessories' },
  ];

  useEffect(() => {
    setStockData(mockStockData);
    setFilteredData(mockStockData);
  }, []);

  useEffect(() => {
    let filtered = stockData.filter((item) => {
      const matchesSearch =
        item.part_name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.part_code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(filtered);
  }, [searchText, selectedCategory, stockData]);

  const handleAddStock = (item) => {
    setSelectedItem(item);
    form.setFieldsValue({
      part_code: item.part_code,
      part_name: item.part_name,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      shortage: item.shortage,
    });
    setAddStockModalVisible(true);
  };

  const handleAddStockSubmit = async (values) => {
    setLoading(true);
    try {
      const addQuantity = values.add_quantity;

      // Update stock data
      setStockData((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                current_stock: item.current_stock + addQuantity,
                status: item.current_stock + addQuantity >= item.minimum_stock ? 'normal' : 'low',
                shortage: Math.max(0, item.shortage - addQuantity),
              }
            : item
        )
      );

      message.success(`Berhasil menambah ${addQuantity} ${selectedItem.unit} ke stock`);
      setAddStockModalVisible(false);
      setSelectedItem(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal menambah stock');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStockData(mockStockData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'green';
      case 'low':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low':
        return 'green';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      case 'critical':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'low':
        return <CheckCircleOutlined />;
      case 'medium':
        return <WarningOutlined />;
      case 'high':
        return <ExclamationCircleOutlined />;
      case 'critical':
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  const totalShortage = filteredData.reduce((sum, item) => sum + item.shortage, 0);
  const criticalItems = filteredData.filter((item) => item.status === 'critical').length;
  const lowItems = filteredData.filter((item) => item.status === 'low').length;

  const columns = [
    {
      title: 'Part Code',
      dataIndex: 'part_code',
      key: 'part_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color='blue'>{category}</Tag>,
    },
    {
      title: 'Stock Status',
      dataIndex: 'current_stock',
      key: 'stock_status',
      render: (current, record) => (
        <div>
          <div>
            <strong>
              {current} / {record.minimum_stock} {record.unit}
            </strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Shortage:{' '}
            <span style={{ color: '#ff4d4f' }}>
              {record.shortage} {record.unit}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => (
        <Tag color={getUrgencyColor(urgency)} icon={getUrgencyIcon(urgency)}>
          {urgency.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Restock',
      key: 'last_restock',
      render: (_, record) => (
        <div>
          <div>{record.last_restock}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.days_since_restock} days ago
          </div>
        </div>
      ),
    },
    {
      title: 'Est. Restock',
      dataIndex: 'estimated_restock_date',
      key: 'estimated_restock_date',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          size='small'
          icon={<PlusOutlined />}
          onClick={() => handleAddStock(record)}
        >
          Add Stock
        </Button>
      ),
    },
  ];

  return (
    <div className='minimum-stock'>
      <div className='page-header'>
        <h1>Minimum Stock Alert</h1>
        <p>Monitoring dan management stock yang berada di bawah minimum level</p>
      </div>

      <Alert
        message='Stock Alert'
        description={`Terdapat ${criticalItems} item dengan stock kritis dan ${lowItems} item dengan stock rendah yang perlu segera ditangani.`}
        type='warning'
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div className='statistic-card critical'>
              <div className='statistic-icon'>🚨</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Critical Items</div>
                <div className='statistic-value'>{criticalItems}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className='statistic-card low'>
              <div className='statistic-icon'>⚠️</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Low Stock Items</div>
                <div className='statistic-value'>{lowItems}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className='statistic-card shortage'>
              <div className='statistic-icon'>📉</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Shortage</div>
                <div className='statistic-value'>{totalShortage} units</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title='Daftar Item Minimum Stock'>
            <div className='table-controls'>
              <Space>
                <Search
                  placeholder='Cari parts...'
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 200 }}
                >
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                  Refresh
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey='id'
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} items`,
              }}
              rowClassName={(record) => {
                if (record.status === 'critical') return 'row-critical';
                if (record.status === 'low') return 'row-low';
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title='Add Stock'
        open={addStockModalVisible}
        onCancel={() => {
          setAddStockModalVisible(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <Form form={form} layout='vertical' onFinish={handleAddStockSubmit}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item name='part_code' label='Part Code'>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='part_name' label='Part Name'>
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item name='current_stock' label='Current Stock'>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='minimum_stock' label='Minimum Stock'>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='shortage' label='Shortage'>
                  <Input disabled style={{ color: '#ff4d4f' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name='add_quantity'
              label='Quantity to Add'
              rules={[
                { required: true, message: 'Masukkan quantity yang akan ditambahkan!' },
                { type: 'number', min: 1, message: 'Quantity harus lebih dari 0!' },
              ]}
            >
              <Input type='number' placeholder='Masukkan quantity' addonAfter={selectedItem.unit} />
            </Form.Item>

            <Form.Item name='notes' label='Notes'>
              <Input.TextArea rows={3} placeholder='Catatan untuk penambahan stock...' />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Add Stock
                </Button>
                <Button onClick={() => setAddStockModalVisible(false)}>Batal</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
