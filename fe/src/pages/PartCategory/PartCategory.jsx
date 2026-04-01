import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { partCategoryService } from '../../services';
import '../../App.css';

const { Option } = Select;
const { Search } = Input;

const statusColor = {
  active: 'green',
  inactive: 'red',
  maintenance: 'orange',
};

const PartCategory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partCategoryService.list();
      setCategoryData(res.data || []);
    } catch (error) {
      console.error('Gagal mengambil kategori:', error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          'Tidak dapat mengambil data kategori saat ini.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const text = searchText.toLowerCase();
    const filtered = categoryData.filter((item) => {
      const searchable = `${item.category_name ?? ''} ${item.category_code ?? ''} ${item.description ??
        ''}`.toLowerCase();
      const matchesSearch = searchable.includes(text);
      const matchesCategory = categoryFilter === 'all' || item.category_code === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(filtered);
  }, [searchText, categoryData, categoryFilter]);

  const totalCategories = filteredData.length;
  const totalItems = useMemo(
    () => filteredData.reduce((sum, item) => sum + (Number(item.total_items) || 0), 0),
    [filteredData],
  );
  const totalLowStock = useMemo(
    () => filteredData.reduce((sum, item) => sum + (Number(item.low_stock_items) || 0), 0),
    [filteredData],
  );
  const totalCritical = useMemo(
    () => filteredData.reduce((sum, item) => sum + (Number(item.critical_stock_items) || 0), 0),
    [filteredData],
  );
  const totalValue = useMemo(
    () => filteredData.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0),
    [filteredData],
  );

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(categoryData.map((item) => item.category_code).filter(Boolean)),
    );
    return [
      { value: 'all', label: 'Semua Kategori' },
      ...categories.map((entry) => ({ value: entry, label: entry })),
    ];
  }, [categoryData]);

  const handleEdit = (record) => {
    setSelectedCategory(record);
    form.setFieldsValue({
      category_code: record.category_code,
      category_name: record.category_name,
      description: record.description,
      status: record.status,
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Hapus Kategori',
      content: 'Semua stok yang terkait tidak akan terhapus, hanya kategori yang dihapus.',
      okText: 'Hapus',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await partCategoryService.remove(record.id);
          message.success('Kategori berhasil dihapus');
          loadCategories();
        } catch (error) {
          console.error('Gagal menghapus kategori:', error);
          message.error('Gagal menghapus kategori');
        }
      },
    });
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        category_code: values.category_code.trim(),
        category_name: values.category_name.trim(),
        description: values.description?.trim() || '',
        status: values.status,
        minimum_threshold: Number(values.minimum_stock ?? 20),
      };
      if (selectedCategory) {
        await partCategoryService.update(selectedCategory.id, payload);
        message.success('Kategori berhasil diperbarui');
      } else {
        await partCategoryService.create(payload);
        message.success('Kategori berhasil ditambahkan');
      }
      setEditModalVisible(false);
      setSelectedCategory(null);
      form.resetFields();
      loadCategories();
    } catch (error) {
      console.error('Gagal menyimpan kategori:', error);
      message.error(
        error?.response?.data?.message || error?.message || 'Gagal menyimpan kategori.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCategories();
  };

  const columns = [
    {
      title: 'Category Code',
      dataIndex: 'category_code',
      key: 'category_code',
      render: (value) => <strong>{value}</strong>,
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
            <strong>Total Items:</strong> {record.total_items ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Low: <span style={{ color: '#faad14' }}>{record.low_stock_items ?? 0}</span> | Critical:{' '}
            <span style={{ color: '#ff4d4f' }}>{record.critical_stock_items ?? 0}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColor[status] || 'default'}>{(status || 'unknown').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`,
      sorter: (a, b) => Number(a.total_value || 0) - Number(b.total_value || 0),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (value) => (value ? new Date(value).toLocaleDateString('id-ID') : '-'),
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
          <Button type='primary' danger size='small' icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
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
                <div className='statistic-value'>
                  {totalLowStock}
                  <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                    Critical: {totalCritical}
                  </div>
                </div>
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
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                  Refresh
                </Button>
              </Space>
            }
          >
            <div className='table-controls' style={{ marginBottom: 12 }}>
              <Space wrap>
                <Search
                  placeholder='Cari kategori...'
                  allowClear
                  style={{ width: 260 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={categoryFilter}
                  style={{ width: 220 }}
                  onChange={(value) => setCategoryFilter(value)}
                >
                  {categoryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
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
          </Row>

          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                {selectedCategory ? 'Update' : 'Tambah'}
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedCategory(null);
                  form.resetFields();
                }}
              >
                Batal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartCategory;
