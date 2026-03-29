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
} from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './PartCategory.css';

const { Option } = Select;
const { Search } = Input;

export default function PartCategory() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  const mockCategoryData = [
    {
      id: 1,
      category_code: 'CPU',
      category_name: 'CPU (Central Processing Unit)',
      description: 'Processors for desktop and server computers',
      total_items: 15,
      low_stock_items: 3,
      critical_stock_items: 1,
      total_value: 82500000,
      average_price: 5500000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 2,
      category_code: 'RAM',
      category_name: 'Memory (RAM)',
      description: 'Random Access Memory modules for computers',
      total_items: 25,
      low_stock_items: 8,
      critical_stock_items: 2,
      total_value: 30000000,
      average_price: 1200000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 3,
      category_code: 'STORAGE',
      category_name: 'Storage Devices',
      description: 'SSD, HDD, and other storage solutions',
      total_items: 35,
      low_stock_items: 5,
      critical_stock_items: 0,
      total_value: 63000000,
      average_price: 1800000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 4,
      category_code: 'PSU',
      category_name: 'Power Supply Unit',
      description: 'Power supplies for computers and servers',
      total_items: 20,
      low_stock_items: 7,
      critical_stock_items: 3,
      total_value: 44000000,
      average_price: 2200000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 5,
      category_code: 'GPU',
      category_name: 'Graphics Card',
      description: 'Video cards and graphics processing units',
      total_items: 18,
      low_stock_items: 2,
      critical_stock_items: 0,
      total_value: 153000000,
      average_price: 8500000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 6,
      category_code: 'MB',
      category_name: 'Motherboard',
      description: 'Main circuit boards for computers',
      total_items: 12,
      low_stock_items: 4,
      critical_stock_items: 1,
      total_value: 38400000,
      average_price: 3200000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 7,
      category_code: 'COOLING',
      category_name: 'Cooling Solutions',
      description: 'Fans, coolers, and thermal management',
      total_items: 30,
      low_stock_items: 10,
      critical_stock_items: 4,
      total_value: 10500000,
      average_price: 350000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
    {
      id: 8,
      category_code: 'ACC',
      category_name: 'Accessories',
      description: 'Cables, adapters, and other accessories',
      total_items: 45,
      low_stock_items: 15,
      critical_stock_items: 6,
      total_value: 5625000,
      average_price: 125000,
      last_updated: '2024-03-25',
      status: 'active',
      created_date: '2024-01-15',
    },
  ];

  useEffect(() => {
    setCategoryData(mockCategoryData);
    setFilteredData(mockCategoryData);
  }, []);

  useEffect(() => {
    let filtered = categoryData.filter(
      (item) =>
        item.category_name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category_code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, categoryData]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue(category);
    setEditModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Hapus Kategori',
      content:
        'Apakah Anda yakin ingin menghapus kategori ini? Semua item dalam kategori ini akan terpengaruh.',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          setCategoryData((prev) => prev.filter((item) => item.id !== id));
          message.success('Kategori berhasil dihapus');
        } catch (error) {
          message.error('Gagal menghapus kategori');
        }
      },
    });
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (selectedCategory) {
        // Update existing category
        setCategoryData((prev) =>
          prev.map((item) =>
            item.id === selectedCategory.id
              ? { ...item, ...values, last_updated: new Date().toISOString().split('T')[0] }
              : item
          )
        );
        message.success('Kategori berhasil diperbarui');
      } else {
        // Add new category
        const newCategory = {
          ...values,
          id: Date.now(),
          total_items: 0,
          low_stock_items: 0,
          critical_stock_items: 0,
          total_value: 0,
          average_price: 0,
          last_updated: new Date().toISOString().split('T')[0],
          created_date: new Date().toISOString().split('T')[0],
        };
        setCategoryData((prev) => [newCategory, ...prev]);
        message.success('Kategori berhasil ditambahkan');
      }
      setEditModalVisible(false);
      setSelectedCategory(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setCategoryData(mockCategoryData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStockHealth = (low, critical) => {
    if (critical > 0) return { status: 'critical', color: 'red', icon: '🚨' };
    if (low > 0) return { status: 'warning', color: 'orange', icon: '⚠️' };
    return { status: 'good', color: 'green', icon: '✅' };
  };

  const totalCategories = filteredData.length;
  const totalItems = filteredData.reduce((sum, item) => sum + item.total_items, 0);
  const totalLowStock = filteredData.reduce((sum, item) => sum + item.low_stock_items, 0);
  const totalCritical = filteredData.reduce((sum, item) => sum + item.critical_stock_items, 0);
  const totalValue = filteredData.reduce((sum, item) => sum + item.total_value, 0);

  const columns = [
    {
      title: 'Category Code',
      dataIndex: 'category_code',
      key: 'category_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Category Name',
      dataIndex: 'category_name',
      key: 'category_name',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Items Summary',
      key: 'items_summary',
      render: (_, record) => (
        <div>
          <div>
            <strong>Total:</strong> {record.total_items} items
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Low: <span style={{ color: '#faad14' }}>{record.low_stock_items}</span> | Critical:{' '}
            <span style={{ color: '#ff4d4f' }}>{record.critical_stock_items}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Stock Health',
      key: 'stock_health',
      render: (_, record) => {
        const health = getStockHealth(record.low_stock_items, record.critical_stock_items);
        return (
          <Tag color={health.color}>
            {health.icon} {health.status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.total_value - b.total_value,
    },
    {
      title: 'Avg Price',
      dataIndex: 'average_price',
      key: 'average_price',
      render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type='primary'
            danger
            size='small'
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='part-category'>
      <div className='page-header'>
        <h1>Part Category Management</h1>
        <p>Kelola kategori parts dan monitoring stock health per kategori</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon total'>📁</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Categories</div>
                <div className='statistic-value'>{totalCategories}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon items'>📦</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Items</div>
                <div className='statistic-value'>{totalItems.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon warning'>⚠️</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Low Stock Items</div>
                <div className='statistic-value'>{totalLowStock}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon value'>💰</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Value</div>
                <div className='statistic-value'>Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title='Daftar Kategori Parts'
            extra={
              <Space>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedCategory(null);
                    form.resetFields();
                    setEditModalVisible(true);
                  }}
                >
                  Tambah Kategori
                </Button>
              </Space>
            }
          >
            <div className='table-controls'>
              <Space>
                <Search
                  placeholder='Cari kategori...'
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
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
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kategori`,
              }}
              rowClassName={(record) => {
                if (record.critical_stock_items > 0) return 'row-critical';
                if (record.low_stock_items > 0) return 'row-warning';
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={selectedCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={handleSave}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='category_code'
                label='Category Code'
                rules={[{ required: true, message: 'Category code harus diisi!' }]}
              >
                <Input placeholder='Contoh: CPU' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='category_name'
                label='Category Name'
                rules={[{ required: true, message: 'Category name harus diisi!' }]}
              >
                <Input placeholder='Contoh: CPU (Central Processing Unit)' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='description'
            label='Description'
            rules={[{ required: true, message: 'Description harus diisi!' }]}
          >
            <Input.TextArea rows={3} placeholder='Deskripsi kategori parts...' />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='status'
                label='Status'
                rules={[{ required: true, message: 'Status harus diisi!' }]}
              >
                <Select placeholder='Pilih status'>
                  <Option value='active'>Active</Option>
                  <Option value='inactive'>Inactive</Option>
                  <Option value='maintenance'>Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='minimum_threshold'
                label='Minimum Threshold (%)'
                rules={[{ required: true, message: 'Minimum threshold harus diisi!' }]}
              >
                <Input type='number' placeholder='20' min='1' max='100' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                {selectedCategory ? 'Update' : 'Tambah'}
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
