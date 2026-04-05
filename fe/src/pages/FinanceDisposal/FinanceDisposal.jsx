import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Tag,
  Space,
  message,
  Upload,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import './FinanceDisposal.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function FinanceDisposal() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [disposalModalVisible, setDisposalModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockFinanceData = [
    {
      id: 1,
      asset_code: 'AST-001',
      asset_name: 'Laptop Dell Latitude 5420',
      category: 'Hardware',
      purchase_date: '2022-01-15',
      purchase_value: 15000000,
      current_value: 2500000,
      depreciation_years: 3,
      book_value: 2500000,
      status: 'active',
      disposal_reason: '',
      disposal_date: null,
      disposal_value: 0,
      loss_amount: 0,
      tax_impact: 0,
      net_loss: 0,
      attachments: [],
    },
    {
      id: 2,
      asset_code: 'AST-002',
      asset_name: 'Server HP ProLiant DL380',
      category: 'Hardware',
      purchase_date: '2021-06-20',
      purchase_value: 50000000,
      current_value: 10000000,
      depreciation_years: 5,
      book_value: 10000000,
      status: 'active',
      disposal_reason: '',
      disposal_date: null,
      disposal_value: 0,
      loss_amount: 0,
      tax_impact: 0,
      net_loss: 0,
      attachments: [],
    },
    {
      id: 3,
      asset_code: 'AST-003',
      asset_name: 'Monitor LG 27 inch',
      category: 'Hardware',
      purchase_date: '2022-03-10',
      purchase_value: 8000000,
      current_value: 2000000,
      depreciation_years: 3,
      book_value: 2000000,
      status: 'disposed',
      disposal_reason: 'Screen damage, not cost-effective to repair',
      disposal_date: '2024-03-25',
      disposal_value: 500000,
      loss_amount: 1500000,
      tax_impact: 150000,
      net_loss: 1650000,
      attachments: ['disposal_form.pdf', 'damage_report.pdf'],
    },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'disposed', label: 'Disposed' },
    { value: 'pending_disposal', label: 'Pending Disposal' },
  ];

  useEffect(() => {
    setFinanceData(mockFinanceData);
    setFilteredData(mockFinanceData);
  }, []);

  useEffect(() => {
    let filtered = financeData.filter((asset) => {
      const matchesSearch =
        asset.asset_name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, financeData]);

  const handleDisposal = (asset) => {
    setSelectedAsset(asset);
    form.setFieldsValue({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      disposal_reason: '',
      disposal_value: 0,
      disposal_date: new Date().toISOString().split('T')[0],
    });
    setDisposalModalVisible(true);
  };

  const handleDisposalSubmit = async (values) => {
    setLoading(true);
    try {
      const lossAmount = selectedAsset.book_value - values.disposal_value;
      const taxImpact = lossAmount * 0.1;

      setFinanceData((prev) =>
        prev.map((asset) =>
          asset.id === selectedAsset.id
            ? {
                ...asset,
                status: 'disposed',
                disposal_reason: values.disposal_reason,
                disposal_date: values.disposal_date,
                disposal_value: values.disposal_value,
                loss_amount: lossAmount,
                tax_impact: taxImpact,
                net_loss: lossAmount + taxImpact,
              }
            : asset
        )
      );

      message.success('Asset disposal berhasil diproses');
      setDisposalModalVisible(false);
      setSelectedAsset(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal memproses disposal');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (asset) => {
    setSelectedAsset(asset);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setFinanceData(mockFinanceData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'disposed':
        return 'red';
      case 'pending_disposal':
        return 'orange';
      default:
        return 'default';
    }
  };

  const activeAssets = filteredData.filter((asset) => asset.status === 'active').length;
  const disposedAssets = filteredData.filter((asset) => asset.status === 'disposed').length;
  const totalValue = filteredData.reduce((sum, asset) => sum + asset.book_value, 0);
  const totalLoss = filteredData.reduce((sum, asset) => sum + asset.net_loss, 0);

  const columns = [
    {
      title: 'Asset Code',
      dataIndex: 'asset_code',
      key: 'asset_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Book Value',
      dataIndex: 'book_value',
      key: 'book_value',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.book_value - b.book_value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.replace('_', ' ').toUpperCase()}</Tag>
      ),
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
          {record.status === 'active' && (
            <Button type='primary' danger size='small' onClick={() => handleDisposal(record)}>
              Dispose
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='finance-disposal'>
      <div className='page-header'>
        <h1>Finance Disposal Management</h1>
        <p>Management asset disposal dan perhitungan kerugian</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon'>💼</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Active Assets</div>
                <div className='statistic-value'>{activeAssets}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card disposed'>
              <div className='statistic-icon'>🗑️</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Disposed Assets</div>
                <div className='statistic-value'>{disposedAssets}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon'>💰</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Book Value</div>
                <div className='statistic-value'>Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card loss'>
              <div className='statistic-icon'>📉</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Loss</div>
                <div className='statistic-value'>Rp {totalLoss.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title='Daftar Asset Disposal'>
            <div className='table-controls'>
              <Space>
                <Search
                  placeholder='Cari asset...'
                  allowClear
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: 200 }}>
                  {statuses.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
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
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} assets`,
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title='Asset Disposal'
        open={disposalModalVisible}
        onCancel={() => {
          setDisposalModalVisible(false);
          setSelectedAsset(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAsset && (
          <Form form={form} layout='vertical' onFinish={handleDisposalSubmit}>
            <Form.Item name='asset_code' label='Asset Code'>
              <Input disabled />
            </Form.Item>
            <Form.Item name='asset_name' label='Asset Name'>
              <Input disabled />
            </Form.Item>
            <Form.Item
              name='disposal_reason'
              label='Disposal Reason'
              rules={[{ required: true, message: 'Disposal reason harus diisi!' }]}
            >
              <Input.TextArea rows={3} placeholder='Alasan disposal asset...' />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name='disposal_value'
                  label='Disposal Value (Rp)'
                  rules={[{ required: true, message: 'Disposal value harus diisi!' }]}
                >
                  <Input type='number' placeholder='0' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='disposal_date'
                  label='Disposal Date'
                  rules={[{ required: true, message: 'Disposal date harus diisi!' }]}
                >
                  <Input placeholder='YYYY-MM-DD' />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Process Disposal
                </Button>
                <Button onClick={() => setDisposalModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title='Asset Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedAsset(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedAsset && (
          <div className='asset-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Asset Information</h4>
                  <p>
                    <strong>Asset Code:</strong> {selectedAsset.asset_code}
                  </p>
                  <p>
                    <strong>Asset Name:</strong> {selectedAsset.asset_name}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedAsset.category}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag color={getStatusColor(selectedAsset.status)}>
                      {selectedAsset.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </p>
                </div>
              </Col>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Financial Information</h4>
                  <p>
                    <strong>Purchase Value:</strong> Rp{' '}
                    {selectedAsset.purchase_value.toLocaleString('id-ID')}
                  </p>
                  <p>
                    <strong>Current Value:</strong> Rp{' '}
                    {selectedAsset.current_value.toLocaleString('id-ID')}
                  </p>
                  <p>
                    <strong>Book Value:</strong> Rp{' '}
                    {selectedAsset.book_value.toLocaleString('id-ID')}
                  </p>
                  <p>
                    <strong>Purchase Date:</strong> {selectedAsset.purchase_date}
                  </p>
                </div>
              </Col>
            </Row>
            {selectedAsset.status === 'disposed' && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className='detail-section'>
                    <h4>Disposal Information</h4>
                    <p>
                      <strong>Disposal Reason:</strong> {selectedAsset.disposal_reason}
                    </p>
                    <p>
                      <strong>Disposal Date:</strong> {selectedAsset.disposal_date}
                    </p>
                    <p>
                      <strong>Disposal Value:</strong> Rp{' '}
                      {selectedAsset.disposal_value.toLocaleString('id-ID')}
                    </p>
                    <p>
                      <strong>Loss Amount:</strong> Rp{' '}
                      {selectedAsset.loss_amount.toLocaleString('id-ID')}
                    </p>
                    <p>
                      <strong>Tax Impact:</strong> Rp{' '}
                      {selectedAsset.tax_impact.toLocaleString('id-ID')}
                    </p>
                    <p>
                      <strong>Net Loss:</strong> Rp {selectedAsset.net_loss.toLocaleString('id-ID')}
                    </p>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
