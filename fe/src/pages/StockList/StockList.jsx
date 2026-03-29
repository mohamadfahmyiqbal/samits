import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal } from 'antd';
import { 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './StockList.css';

const { Option } = Select;
const { Search } = Input;

export default function StockList() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  const mockStockData = [
    {
      id: 1,
      part_code: 'CPU-001',
      part_name: 'Intel Core i7-12700K Processor',
      category: 'CPU',
      current_stock: 15,
      minimum_stock: 10,
      maximum_stock: 50,
      unit: 'pcs',
      location: 'Warehouse A - Rack 1',
      supplier: 'PT. Intel Indonesia',
      last_restock: '2024-03-20',
      next_restock: '2024-04-20',
      status: 'normal',
      price: 5500000,
      total_value: 82500000
    },
    {
      id: 2,
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
      next_restock: '2024-04-15',
      status: 'low',
      price: 1200000,
      total_value: 9600000
    },
    {
      id: 3,
      part_code: 'SSD-003',
      part_name: 'SSD 1TB NVMe M.2',
      category: 'Storage',
      current_stock: 25,
      minimum_stock: 20,
      maximum_stock: 60,
      unit: 'pcs',
      location: 'Warehouse B - Rack 1',
      supplier: 'PT. Samsung Indonesia',
      last_restock: '2024-03-18',
      next_restock: '2024-04-18',
      status: 'normal',
      price: 1800000,
      total_value: 45000000
    },
    {
      id: 4,
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
      next_restock: '2024-04-10',
      status: 'critical',
      price: 2200000,
      total_value: 11000000
    },
    {
      id: 5,
      part_code: 'GPU-005',
      part_name: 'NVIDIA RTX 3060 12GB',
      category: 'Graphics Card',
      current_stock: 18,
      minimum_stock: 8,
      maximum_stock: 25,
      unit: 'pcs',
      location: 'Warehouse B - Rack 2',
      supplier: 'PT. NVIDIA Indonesia',
      last_restock: '2024-03-22',
      next_restock: '2024-04-22',
      status: 'normal',
      price: 8500000,
      total_value: 153000000
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'CPU', label: 'CPU' },
    { value: 'Memory', label: 'Memory' },
    { value: 'Storage', label: 'Storage' },
    { value: 'Power Supply', label: 'Power Supply' },
    { value: 'Graphics Card', label: 'Graphics Card' },
    { value: 'Motherboard', label: 'Motherboard' },
    { value: 'Cooling', label: 'Cooling' }
  ];

  useEffect(() => {
    setStockData(mockStockData);
    setFilteredData(mockStockData);
  }, []);

  useEffect(() => {
    let filtered = stockData.filter(item => {
      const matchesSearch = item.part_name.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.part_code.toLowerCase().includes(searchText.toLowerCase()) ||
                           item.supplier.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(filtered);
  }, [searchText, selectedCategory, stockData]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    form.setFieldsValue(item);
    setEditModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Hapus Item Stock',
      content: 'Apakah Anda yakin ingin menghapus item ini dari stock list?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          setStockData(prev => prev.filter(item => item.id !== id));
          message.success('Item berhasil dihapus');
        } catch (error) {
          message.error('Gagal menghapus item');
        }
      }
    });
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (selectedItem) {
        // Update existing item
        setStockData(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, ...values, total_value: values.current_stock * values.price }
            : item
        ));
        message.success('Item berhasil diperbarui');
      } else {
        // Add new item
        const newItem = {
          ...values,
          id: Date.now(),
          total_value: values.current_stock * values.price,
          status: values.current_stock <= values.minimum_stock / 2 ? 'critical' : 
                  values.current_stock <= values.minimum_stock ? 'low' : 'normal'
        };
        setStockData(prev => [newItem, ...prev]);
        message.success('Item berhasil ditambahkan');
      }
      setEditModalVisible(false);
      setSelectedItem(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal menyimpan item');
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
      case 'normal': return 'green';
      case 'low': return 'orange';
      case 'critical': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <CheckCircleOutlined />;
      case 'low': return <ExclamationCircleOutlined />;
      case 'critical': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const totalItems = filteredData.reduce((sum, item) => sum + item.current_stock, 0);
  const totalValue = filteredData.reduce((sum, item) => sum + item.total_value, 0);
  const lowStockItems = filteredData.filter(item => item.status === 'low' || item.status === 'critical').length;

  const columns = [
    {
      title: 'Part Code',
      dataIndex: 'part_code',
      key: 'part_code',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag> },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock, record) => (
        <div>
          <strong>{stock} {record.unit}</strong>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Min: {record.minimum_stock} | Max: {record.maximum_stock}
          </div>
        </div>
      ) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ) },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location' },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.price - b.price },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.total_value - b.total_value },
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

  return (
    <div className="stock-list">
      <div className="page-header">
        <h1>Stock List</h1>
        <p>Kelola daftar stock parts dan monitoring ketersediaan</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon total">📦</div>
              <div className="statistic-content">
                <div className="statistic-title">Total Items</div>
                <div className="statistic-value">{totalItems.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon value">💰</div>
              <div className="statistic-content">
                <div className="statistic-title">Total Value</div>
                <div className="statistic-value">Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon warning">⚠️</div>
              <div className="statistic-content">
                <div className="statistic-title">Low Stock Items</div>
                <div className="statistic-value">{lowStockItems}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Daftar Stock Parts"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedItem(null);
                    form.resetFields();
                    setEditModalVisible(true);
                  }}
                >
                  Tambah Item
                </Button>
              </Space>
            }
          >
            <div className="table-controls">
              <Space>
                <Search
                  placeholder="Cari parts..."
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 200 }}
                >
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} dari ${total} items` }}
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
        title={selectedItem ? 'Edit Stock Item' : 'Tambah Stock Item'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form as="form"
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form as="form".Item
                controlId="part_code"
                label="Part Code"
                rules={[{ required: true, message: 'Part code harus diisi!' }]}
              >
                <Input placeholder="Contoh: CPU-001" />
              </Form.Group>
            </Col>
            <Col span={12}>
              <Form as="form".Item
                controlId="part_name"
                label="Part Name"
                rules={[{ required: true, message: 'Part name harus diisi!' }]}
              >
                <Input placeholder="Contoh: Intel Core i7-12700K" />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form as="form".Item
                controlId="category"
                label="Category"
                rules={[{ required: true, message: 'Category harus diisi!' }]}
              >
                <Select placeholder="Pilih category">
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="unit"
                label="Unit"
                rules={[{ required: true, message: 'Unit harus diisi!' }]}
              >
                <Select placeholder="Pilih unit">
                  <Option value="pcs">pcs</Option>
                  <Option value="box">box</Option>
                  <Option value="set">set</Option>
                  <Option value="meter">meter</Option>
                </Select>
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="price"
                label="Unit Price (Rp)"
                rules={[{ required: true, message: 'Price harus diisi!' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form as="form".Item
                controlId="current_stock"
                label="Current Stock"
                rules={[{ required: true, message: 'Current stock harus diisi!' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="minimum_stock"
                label="Minimum Stock"
                rules={[{ required: true, message: 'Minimum stock harus diisi!' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Group>
            </Col>
            <Col span={8}>
              <Form as="form".Item
                controlId="maximum_stock"
                label="Maximum Stock"
                rules={[{ required: true, message: 'Maximum stock harus diisi!' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form as="form".Item
                controlId="location"
                label="Location"
                rules={[{ required: true, message: 'Location harus diisi!' }]}
              >
                <Input placeholder="Contoh: Warehouse A - Rack 1" />
              </Form.Group>
            </Col>
            <Col span={12}>
              <Form as="form".Item
                controlId="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Supplier harus diisi!' }]}
              >
                <Input placeholder="Contoh: PT. Intel Indonesia" />
              </Form.Group>
            </Col>
          </Row>

          <Form as="form".Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedItem ? 'Update' : 'Tambah'}
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Batal
              </Button>
            </Space>
          </Form.Group>
        </Form>
      </Modal>
    </div>
  );
}
