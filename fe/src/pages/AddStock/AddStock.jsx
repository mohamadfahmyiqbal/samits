import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Tag, Space, message, Input, Select, Modal, Upload } from 'antd';
import { 
  ReloadOutlined,
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  TruckOutlined
} from '@ant-design/icons';
import './AddStock.css';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

export default function AddStock() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
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
      price: 5500000,
      last_updated: '2024-03-25'
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
      price: 1200000,
      last_updated: '2024-03-25'
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
      price: 1800000,
      last_updated: '2024-03-25'
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
      price: 2200000,
      last_updated: '2024-03-25'
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
      price: 8500000,
      last_updated: '2024-03-25'
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

  const suppliers = [
    { value: 'PT. Intel Indonesia', label: 'PT. Intel Indonesia' },
    { value: 'PT. Kingston Indonesia', label: 'PT. Kingston Indonesia' },
    { value: 'PT. Samsung Indonesia', label: 'PT. Samsung Indonesia' },
    { value: 'PT. Corsair Indonesia', label: 'PT. Corsair Indonesia' },
    { value: 'PT. NVIDIA Indonesia', label: 'PT. NVIDIA Indonesia' },
    { value: 'PT. ASUS Indonesia', label: 'PT. ASUS Indonesia' },
    { value: 'PT. Cooler Master Indonesia', label: 'PT. Cooler Master Indonesia' },
    { value: 'Other', label: 'Other' }
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

  const handleAddStock = (item) => {
    form.setFieldsValue({
      part_code: item.part_code,
      part_name: item.part_name,
      category: item.category,
      current_stock: item.current_stock,
      unit: item.unit,
      location: item.location,
      supplier: item.supplier,
      price: item.price
    });
    setAddModalVisible(true);
  };

  const handleAddNew = () => {
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const addQuantity = values.add_quantity;
      const totalPrice = addQuantity * values.price;
      
      // Update existing stock or add new
      if (values.part_code) {
        // Update existing
        setStockData(prev => prev.map(item => 
          item.part_code === values.part_code 
            ? { 
                ...item, 
                current_stock: item.current_stock + addQuantity,
                last_updated: new Date().toISOString().split('T')[0]
              }
            : item
        ));
        message.success(`Berhasil menambah ${addQuantity} ${values.unit} ke stock ${values.part_name}`);
      } else {
        // Add new item
        const newItem = {
          id: Date.now(),
          part_code: values.new_part_code,
          part_name: values.new_part_name,
          category: values.category,
          current_stock: addQuantity,
          minimum_stock: values.minimum_stock || 10,
          maximum_stock: values.maximum_stock || 50,
          unit: values.unit,
          location: values.location,
          supplier: values.supplier,
          price: values.price,
          last_updated: new Date().toISOString().split('T')[0]
        };
        setStockData(prev => [newItem, ...prev]);
        message.success(`Berhasil menambah item baru: ${values.new_part_name}`);
      }
      
      setAddModalVisible(false);
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

  const getStockStatus = (current, minimum, maximum) => {
    if (current <= minimum / 2) return { status: 'critical', color: 'red' };
    if (current <= minimum) return { status: 'low', color: 'orange' };
    if (current >= maximum) return { status: 'overstock', color: 'purple' };
    return { status: 'normal', color: 'green' };
  };

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
      render: (stock, record) => {
        const stockInfo = getStockStatus(stock, record.minimum_stock, record.maximum_stock);
        return (
          <div>
            <strong>{stock} {record.unit}</strong>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Min: {record.minimum_stock} | Max: {record.maximum_stock}
            </div>
          </div>
        );
      } },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const stockInfo = getStockStatus(record.current_stock, record.minimum_stock, record.maximum_stock);
        return (
          <Tag color={stockInfo.color}>
            {stockInfo.status.toUpperCase()}
          </Tag>
        );
      } },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rp ${price.toLocaleString('id-ID')}` },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddStock(record)}
          >
            Add Stock
          </Button>
        </Space>
      ) },
  ];

  return (
    <div className="add-stock">
      <div className="page-header">
        <h1>Add Stock</h1>
        <p>Tambah stock parts dan management inventory</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon total">📦</div>
              <div className="statistic-content">
                <div className="statistic-title">Total Items</div>
                <div className="statistic-value">{stockData.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon low">⚠️</div>
              <div className="statistic-content">
                <div className="statistic-title">Low Stock</div>
                <div className="statistic-value">
                  {stockData.filter(item => item.current_stock <= item.minimum_stock).length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon normal">✅</div>
              <div className="statistic-content">
                <div className="statistic-title">Normal Stock</div>
                <div className="statistic-value">
                  {stockData.filter(item => {
                    const status = getStockStatus(item.current_stock, item.minimum_stock, item.maximum_stock);
                    return status.status === 'normal';
                  }).length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="statistic-card">
              <div className="statistic-icon overstock">📈</div>
              <div className="statistic-content">
                <div className="statistic-title">Overstock</div>
                <div className="statistic-value">
                  {stockData.filter(item => {
                    const status = getStockStatus(item.current_stock, item.minimum_stock, item.maximum_stock);
                    return status.status === 'overstock';
                  }).length}
                </div>
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
                  onClick={handleAddNew}
                >
                  Add New Item
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
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Add Stock"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form as="form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form as="form".Item
            controlId="add_type"
            label="Add Type"
            rules={[{ required: true, message: 'Pilih tipe penambahan!' }]}
          >
            <Select placeholder="Pilih tipe penambahan">
              <Option value="existing">Add to Existing Item</Option>
              <Option value="new">Add New Item</Option>
            </Select>
          </Form.Group>

          <Form as="form".Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.add_type !== currentValues.add_type}>
            {({ getFieldValue }) => {
              const addType = getFieldValue('add_type');
              
              if (addType === 'existing') {
                return (
                  <>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="part_code"
                          label="Part Code"
                          rules={[{ required: true, message: 'Pilih part code!' }]}
                        >
                          <Select placeholder="Pilih part code">
                            {stockData.map(item => (
                              <Option key={item.part_code} value={item.part_code}>
                                {item.part_code} - {item.part_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Group>
                      </Col>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="part_name"
                          label="Part Name"
                        >
                          <Input disabled />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form as="form".Item
                          controlId="current_stock"
                          label="Current Stock"
                        >
                          <Input disabled />
                        </Form.Group>
                      </Col>
                      <Col span={8}>
                        <Form as="form".Item
                          controlId="unit"
                          label="Unit"
                        >
                          <Input disabled />
                        </Form.Group>
                      </Col>
                      <Col span={8}>
                        <Form as="form".Item
                          controlId="add_quantity"
                          label="Quantity to Add"
                          rules={[
                            { required: true, message: 'Masukkan quantity!' },
                            { type: 'number', min: 1, message: 'Quantity harus lebih dari 0!' }
                          ]}
                        >
                          <Input type="number" placeholder="0" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                );
              }
              
              if (addType === 'new') {
                return (
                  <>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="new_part_code"
                          label="Part Code"
                          rules={[{ required: true, message: 'Part code harus diisi!' }]}
                        >
                          <Input placeholder="Contoh: CPU-001" />
                        </Form.Group>
                      </Col>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="new_part_name"
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
                          controlId="add_quantity"
                          label="Initial Quantity"
                          rules={[
                            { required: true, message: 'Masukkan quantity!' },
                            { type: 'number', min: 1, message: 'Quantity harus lebih dari 0!' }
                          ]}
                        >
                          <Input type="number" placeholder="0" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="minimum_stock"
                          label="Minimum Stock"
                          rules={[{ required: true, message: 'Minimum stock harus diisi!' }]}
                        >
                          <Input type="number" placeholder="10" />
                        </Form.Group>
                      </Col>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="maximum_stock"
                          label="Maximum Stock"
                          rules={[{ required: true, message: 'Maximum stock harus diisi!' }]}
                        >
                          <Input type="number" placeholder="50" />
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
                          <Select placeholder="Pilih supplier">
                            {suppliers.map(supplier => (
                              <Option key={supplier.value} value={supplier.value}>
                                {supplier.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="price"
                          label="Unit Price (Rp)"
                          rules={[{ required: true, message: 'Price harus diisi!' }]}
                        >
                          <Input type="number" placeholder="0" />
                        </Form.Group>
                      </Col>
                      <Col span={12}>
                        <Form as="form".Item
                          controlId="received_date"
                          label="Received Date"
                          rules={[{ required: true, message: 'Pilih tanggal penerimaan!' }]}
                        >
                          <DatePicker style={{ width: '100%' }} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                );
              }
              
              return null;
            }}
          </Form.Group>

          <Form as="form".Item
            controlId="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Catatan untuk penambahan stock..." />
          </Form.Group>

          <Form as="form".Item
            controlId="documents"
            label="Supporting Documents"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>
                Upload Documents
              </Button>
            </Upload>
          </Form.Group>

          <Form as="form".Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Stock
              </Button>
              <Button onClick={() => setAddModalVisible(false)}>
                Batal
              </Button>
            </Space>
          </Form.Group>
        </Form>
      </Modal>
    </div>
  );
}
