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
  InputNumber,
} from 'antd';
import { ReloadOutlined, EditOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { inventoryService } from '../../services';
import '../../App.css';

const { Search } = Input;
const { Option } = Select;

const determineStatus = (current, minimum) => {
  if (minimum === null || minimum === undefined) return 'unknown';
  if (current < minimum * 0.5) return 'critical';
  if (current <= minimum) return 'low';
  return 'normal';
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'normal':
      return <CheckCircleOutlined />;
    case 'low':
    case 'critical':
      return <ExclamationCircleOutlined />;
    default:
      return null;
  }
};

const renderNumber = (value) =>
  value === null || value === undefined ? '—' : value.toLocaleString('id-ID');

const getMonthlyForecast = (record) => {
  if (record.monthly_usage !== null && record.monthly_usage !== undefined) {
    return record.monthly_usage;
  }
  if (record.minimum_stock !== null && record.minimum_stock !== undefined) {
    return Math.max(1, Math.round(record.minimum_stock * 2));
  }
  return null;
};

const getYearlyForecast = (record) => {
  if (record.yearly_usage !== null && record.yearly_usage !== undefined) {
    return record.yearly_usage;
  }
  const monthly = getMonthlyForecast(record);
  if (monthly !== null && monthly !== undefined) {
    return monthly * 12;
  }
  return null;
};

const getRequirement = (record) => {
  const minimum = record.minimum_stock ?? 0;
  const current = record.current_stock ?? 0;
  return Math.max(0, minimum - current);
};

const StockList = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [form] = Form.useForm();

  const loadStockData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryService.listParts({ limit: 200 });
      const stocks = response.data?.data || [];
      setStockData(stocks);
    } catch (error) {
      console.error('Gagal memuat data stok:', error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          'Tidak dapat mengambil data inventory saat ini.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  useEffect(() => {
    const text = searchText.toLowerCase();
    const filtered = stockData.filter((item) => {
      const searchable = `${item.part_name ?? ''} ${item.part_code ?? ''}`.toLowerCase();
      const matchesSearch = searchable.includes(text);
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(filtered);
  }, [searchText, selectedCategory, stockData]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(stockData.map((item) => item.category).filter(Boolean)));
    return [{ value: 'all', label: 'Semua Kategori' }, ...categories.map((category) => ({ value: category, label: category }))];
  }, [stockData]);

  const totalItems = useMemo(
    () => stockData.reduce((sum, item) => sum + (item.current_stock || 0), 0),
    [stockData],
  );
  const totalValue = useMemo(
    () => stockData.reduce((sum, item) => sum + (item.price || 0) * (item.current_stock || 0), 0),
    [stockData],
  );
  const lowStockItems = useMemo(
    () =>
      stockData.filter(
        (item) =>
          item.minimum_stock !== null &&
          item.minimum_stock !== undefined &&
          item.current_stock <= item.minimum_stock,
      ).length,
    [stockData],
  );
  const alerts = useMemo(
    () =>
      stockData.filter(
        (item) =>
          item.minimum_stock !== null &&
          item.minimum_stock !== undefined &&
          item.current_stock <= item.minimum_stock,
      ),
    [stockData],
  );

  const handleAdjustmentModal = (stock = null) => {
    form.resetFields();
    setSelectedStock(stock);
    setAdjustModalVisible(true);
  };

  const handleStockSelect = (stockId) => {
    const stock = stockData.find((item) => item.id === stockId);
    setSelectedStock(stock || null);
  };

  const handleRefresh = useCallback(() => {
    loadStockData();
  }, [loadStockData]);

  const handleSubmitAdjustment = async (values) => {
    if (!selectedStock) {
      message.warning('Pilih item stok terlebih dahulu sebelum menyimpan penyesuaian.');
      return;
    }

    setOperationLoading(true);
    try {
      await inventoryService.createTransaction({
        stock_id: selectedStock.id,
        type: values.adjustmentType,
        quantity: Number(values.quantity),
        notes: values.notes || 'Penyesuaian stok manual',
      });
      message.success('Penyesuaian stok berhasil');
      setAdjustModalVisible(false);
      setSelectedStock(null);
      form.resetFields();
      loadStockData();
    } catch (error) {
      console.error('Gagal menyesuaikan stok:', error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          'Terjadi kesalahan saat menyimpan penyesuaian stok.',
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Set stok menjadi 0?',
      content: `Mengatur stok part ${record.part_name} menjadi nol akan mencatat transaksi keluar penuh.`,
      okText: 'Set Zero',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await inventoryService.createTransaction({
            stock_id: record.id,
            type: 'out',
            quantity: record.current_stock || 0,
            notes: 'Reset stok melalui UI',
          });
          message.success('Stok di-reset menjadi 0.');
          loadStockData();
        } catch (error) {
          console.error('Gagal reset stok:', error);
          message.error('Gagal mereset stok bagian ini.');
        }
      },
    });
  };

  const columns = [
    {
      title: 'No Keranjang',
      key: 'basket_number',
      ellipsis: true,
      render: (_, record) => record.part_code || `#${record.part_id ?? record.id}`,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag color='blue'>{value || '—'}</Tag>,
    },
    {
      title: 'Nama Perangkat',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'Satuan',
      dataIndex: 'unit',
      key: 'unit',
      render: (value) => value || 'Unit',
    },
    {
      title: 'Standar Stok',
      key: 'standard_stock',
      children: [
        {
          title: 'Qty',
          key: 'standard_qty',
          align: 'right',
          render: (_, record) => renderNumber(record.minimum_stock),
        },
        {
          title: 'Monthly',
          key: 'standard_monthly',
          align: 'right',
          render: (_, record) => renderNumber(getMonthlyForecast(record)),
        },
        {
          title: 'Yearly',
          key: 'standard_yearly',
          align: 'right',
          render: (_, record) => renderNumber(getYearlyForecast(record)),
        },
      ],
    },
    {
      title: 'Act Stock',
      key: 'actual_stock',
      align: 'right',
      render: (_, record) => (
        <strong>
          {renderNumber(record.current_stock)} {record.unit || 'unit'}
        </strong>
      ),
    },
    {
      title: 'Kebutuhan',
      key: 'need',
      align: 'right',
      render: (_, record) => {
        const need = getRequirement(record);
        if (!need) return '—';
        return `${need.toLocaleString('id-ID')} ${record.unit || 'unit'}`;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 190,
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => handleAdjustmentModal(record)}
          >
            Adjust
          </Button>
          <Button danger onClick={() => handleDelete(record)}>
            Reset
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='stock-list'>
      <div className='page-header'>
        <h1>Stock List</h1>
        <p>Kelola daftar stok parts dan monitoring ketersediaan.</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon total'>📦</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Items</div>
                <div className='statistic-value'>{totalItems.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
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
        <Col span={8}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon warning'>⚠️</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Low Stock Items</div>
                <div className='statistic-value'>{lowStockItems}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card type='inner'>
            <Tag color='orange'>
              Terdapat {alerts.length} item stok rendah/critical (≤ minimum stock).
            </Tag>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title='Daftar Stock Parts'
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button type='primary' onClick={() => handleAdjustmentModal()}>
                  Adjust Stock
                </Button>
              </Space>
            }
          >
            <div className='table-controls' style={{ marginBottom: 16 }}>
              <Space wrap>
                <Search
                  placeholder='Cari parts...'
                  allowClear
                  style={{ width: 260 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                  style={{ width: 220 }}
                >
                  {categoryOptions.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
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
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => {
                const status = determineStatus(record.current_stock ?? 0, record.minimum_stock);
                if (status === 'critical') return 'row-critical';
                if (status === 'low') return 'row-low';
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={selectedStock ? `Penyesuaian ${selectedStock.part_name}` : 'Penyesuaian Stok'}
        open={adjustModalVisible}
        onCancel={() => {
          setAdjustModalVisible(false);
          setSelectedStock(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmitAdjustment}>
          {!selectedStock && (
            <Form.Item
              name='stockId'
              label='Pilih Part'
              rules={[{ required: true, message: 'Harap pilih part terlebih dahulu' }]}
            >
              <Select
                placeholder='Cari part untuk disesuaikan'
                showSearch
                optionFilterProp='children'
                onChange={handleStockSelect}
              >
                {stockData.map((stock) => (
                  <Option key={stock.id} value={stock.id}>
                    {stock.part_name} (Gudang {stock.warehouse_id ?? '-'})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {selectedStock && (
            <Form.Item label='Current Stock'>
              <Input value={`${selectedStock.current_stock ?? 0}`} disabled />
            </Form.Item>
          )}
          <Form.Item
            name='adjustmentType'
            label='Tipe Penyesuaian'
            initialValue='in'
            rules={[{ required: true, message: 'Pilih tipe penyesuaian' }]}
          >
            <Select>
              <Option value='in'>Stok Masuk</Option>
              <Option value='out'>Stok Keluar</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='quantity'
            label='Jumlah'
            rules={[
              { required: true, message: 'Masukkan jumlah penyesuaian' },
              { type: 'number', min: 1, message: 'Jumlah harus lebih dari 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name='notes' label='Catatan'>
            <Input.TextArea rows={3} placeholder='Opsional: alasan penyesuaian' />
          </Form.Item>
          <Form.Item className='text-right'>
            <Space>
              <Button
                onClick={() => {
                  setAdjustModalVisible(false);
                  setSelectedStock(null);
                }}
              >
                Batal
              </Button>
              <Button type='primary' htmlType='submit' loading={operationLoading}>
                Simpan Penyesuaian
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockList;
