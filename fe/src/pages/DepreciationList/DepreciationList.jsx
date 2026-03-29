import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Table,
  Button,
  Row,
  Col,
  Select,
  Input,
  message,
  Modal,
  Alert,
  Tag,
  Progress,
  Statistic,
  Tooltip,
} from 'antd';
import {
  CalculatorOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './DepreciationList.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function DepreciationList() {
  const [form] = Form.useForm();
  const [depreciationData, setDepreciationData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');

  const mockDepreciationData = [
    {
      id: 1,
      assetCode: 'AST-001',
      assetName: 'Laptop Dell Latitude 5420',
      assetCategory: 'Hardware',
      purchaseDate: '2022-01-15',
      purchaseValue: 15000000,
      depreciationYears: 3,
      currentYear: 2024,
      depreciationMethod: 'Straight Line',
      annualDepreciation: 5000000,
      accumulatedDepreciation: 10000000,
      bookValue: 5000000,
      depreciationRate: 33.33,
      status: 'active',
      remainingLife: 1,
      disposalDate: null,
      disposalValue: 0,
      lastUpdated: '2024-03-30',
      notes: 'Standard laptop for development team',
    },
    {
      id: 2,
      assetCode: 'AST-002',
      assetName: 'Server HP ProLiant DL380',
      assetCategory: 'Hardware',
      purchaseDate: '2021-06-20',
      purchaseValue: 50000000,
      depreciationYears: 5,
      currentYear: 2024,
      depreciationMethod: 'Straight Line',
      annualDepreciation: 10000000,
      accumulatedDepreciation: 30000000,
      bookValue: 20000000,
      depreciationRate: 20.0,
      status: 'active',
      remainingLife: 2,
      disposalDate: null,
      disposalValue: 0,
      lastUpdated: '2024-03-30',
      notes: 'Main production server',
    },
    {
      id: 3,
      assetCode: 'AST-003',
      assetName: 'Monitor LG 27 inch',
      assetCategory: 'Hardware',
      purchaseDate: '2022-03-10',
      purchaseValue: 8000000,
      depreciationYears: 3,
      currentYear: 2024,
      depreciationMethod: 'Straight Line',
      annualDepreciation: 2666667,
      accumulatedDepreciation: 5333334,
      bookValue: 2666666,
      depreciationRate: 33.33,
      status: 'disposed',
      remainingLife: 0,
      disposalDate: '2024-03-25',
      disposalValue: 500000,
      lastUpdated: '2024-03-25',
      notes: 'Screen damage, disposed early',
    },
    {
      id: 4,
      assetCode: 'AST-004',
      assetName: 'Microsoft Office License',
      assetCategory: 'Software',
      purchaseDate: '2022-01-01',
      purchaseValue: 12000000,
      depreciationYears: 3,
      currentYear: 2024,
      depreciationMethod: 'Straight Line',
      annualDepreciation: 4000000,
      accumulatedDepreciation: 8000000,
      bookValue: 4000000,
      depreciationRate: 33.33,
      status: 'active',
      remainingLife: 1,
      disposalDate: null,
      disposalValue: 0,
      lastUpdated: '2024-03-30',
      notes: 'Office software license',
    },
  ];

  const years = ['all', '2021', '2022', '2023', '2024', '2025'];

  useEffect(() => {
    setDepreciationData(mockDepreciationData);
    setFilteredData(mockDepreciationData);
  }, []);

  useEffect(() => {
    let filtered = depreciationData.filter((asset) => {
      const matchesSearch =
        asset.assetName.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.assetCategory.toLowerCase().includes(searchText.toLowerCase());
      const matchesYear = selectedYear === 'all' || asset.currentYear.toString() === selectedYear;
      return matchesSearch && matchesYear;
    });
    setFilteredData(filtered);
  }, [searchText, selectedYear, depreciationData]);

  const handleViewDetail = (asset) => {
    setSelectedAsset(asset);
    setDetailModalVisible(true);
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    form.setFieldsValue({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      depreciationYears: asset.depreciationYears,
      depreciationMethod: asset.depreciationMethod,
      notes: asset.notes,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedAsset = {
        ...selectedAsset,
        ...values,
        annualDepreciation: values.purchaseValue / values.depreciationYears,
        depreciationRate: (100 / values.depreciationYears).toFixed(2),
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      setDepreciationData((prev) =>
        prev.map((asset) => (asset.id === selectedAsset.id ? updatedAsset : asset))
      );

      message.success('Depreciation data updated successfully');
      setEditModalVisible(false);
      setSelectedAsset(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update depreciation data');
    } finally {
      setLoading(false);
    }
  };

  const handleDispose = async (asset) => {
    setLoading(true);
    try {
      setDepreciationData((prev) =>
        prev.map((item) =>
          item.id === asset.id
            ? {
                ...item,
                status: 'disposed',
                disposalDate: new Date().toISOString().split('T')[0],
                bookValue: 0,
                remainingLife: 0,
              }
            : item
        )
      );

      message.success('Asset disposed successfully');
    } catch (error) {
      message.error('Failed to dispose asset');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'disposed':
        return 'red';
      case 'fully_depreciated':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getDepreciationProgress = (asset) => {
    const progress = (asset.accumulatedDepreciation / asset.purchaseValue) * 100;
    return Math.min(progress, 100);
  };

  const totalPurchaseValue = filteredData.reduce((sum, asset) => sum + asset.purchaseValue, 0);
  const totalBookValue = filteredData.reduce((sum, asset) => sum + asset.bookValue, 0);
  const totalDepreciation = filteredData.reduce(
    (sum, asset) => sum + asset.accumulatedDepreciation,
    0
  );
  const activeAssets = filteredData.filter((asset) => asset.status === 'active').length;

  const columns = [
    {
      title: 'Asset Code',
      dataIndex: 'assetCode',
      key: 'assetCode',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Asset Name',
      dataIndex: 'assetName',
      key: 'assetName',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'assetCategory',
      key: 'assetCategory',
    },
    {
      title: 'Purchase Value',
      dataIndex: 'purchaseValue',
      key: 'purchaseValue',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.purchaseValue - b.purchaseValue,
    },
    {
      title: 'Book Value',
      dataIndex: 'bookValue',
      key: 'bookValue',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.bookValue - b.bookValue,
    },
    {
      title: 'Depreciation',
      key: 'depreciation',
      render: (_, record) => (
        <div>
          <div>Rate: {record.depreciationRate}%</div>
          <div>Annual: Rp {record.annualDepreciation.toLocaleString('id-ID')}</div>
          <Progress
            percent={getDepreciationProgress(record)}
            size='small'
            style={{ marginTop: 4 }}
          />
        </div>
      ),
    },
    {
      title: 'Remaining Life',
      key: 'remainingLife',
      render: (_, record) => (
        <div>
          <div>{record.remainingLife} years</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.depreciationMethod}</div>
        </div>
      ),
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
      title: 'Actions',
      key: 'actions',
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
          <Button
            type='primary'
            size='small'
            icon={<CalculatorOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'disposed'}
          >
            Edit
          </Button>
          {record.status === 'active' && (
            <Button
              type='primary'
              danger
              size='small'
              icon={<DeleteOutlined />}
              onClick={() => handleDispose(record)}
              loading={loading}
            >
              Dispose
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='depreciation-list'>
      <div className='page-header'>
        <h1>Depreciation List</h1>
        <p>Management asset depreciation and book value tracking</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title='Total Assets'
              value={filteredData.length}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Active Assets'
              value={activeAssets}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Total Book Value'
              value={totalBookValue}
              prefix='Rp '
              formatter={(value) => `${value.toLocaleString('id-ID')}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Total Depreciation'
              value={totalDepreciation}
              prefix='Rp '
              formatter={(value) => `${value.toLocaleString('id-ID')}`}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title='Depreciation List'>
        <div className='table-controls'>
          <Space>
            <Search
              placeholder='Search assets...'
              allowClear
              style={{ width: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 150 }}
              placeholder='Select Year'
            >
              {years.map((year) => (
                <Option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </Option>
              ))}
            </Select>
            <Button icon={<FilterOutlined />}>More Filters</Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
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
          rowClassName={(record) => {
            if (record.status === 'disposed') return 'row-disposed';
            if (record.remainingLife <= 1) return 'row-warning';
            return '';
          }}
        />
      </Card>

      <Modal
        title='Asset Depreciation Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedAsset(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key='download' icon={<DownloadOutlined />}>
            Download Report
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
                    <strong>Asset Code:</strong> {selectedAsset.assetCode}
                  </p>
                  <p>
                    <strong>Asset Name:</strong> {selectedAsset.assetName}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedAsset.assetCategory}
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
                  <h4>Depreciation Details</h4>
                  <p>
                    <strong>Method:</strong> {selectedAsset.depreciationMethod}
                  </p>
                  <p>
                    <strong>Years:</strong> {selectedAsset.depreciationYears}
                  </p>
                  <p>
                    <strong>Rate:</strong> {selectedAsset.depreciationRate}%
                  </p>
                  <p>
                    <strong>Annual:</strong> Rp{' '}
                    {selectedAsset.annualDepreciation.toLocaleString('id-ID')}
                  </p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Financial Summary</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size='small'>
                        <Statistic
                          title='Purchase Value'
                          value={selectedAsset.purchaseValue}
                          prefix='Rp '
                          formatter={(value) => `${value.toLocaleString('id-ID')}`}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size='small'>
                        <Statistic
                          title='Book Value'
                          value={selectedAsset.bookValue}
                          prefix='Rp '
                          formatter={(value) => `${value.toLocaleString('id-ID')}`}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size='small'>
                        <Statistic
                          title='Accumulated'
                          value={selectedAsset.accumulatedDepreciation}
                          prefix='Rp '
                          formatter={(value) => `${value.toLocaleString('id-ID')}`}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Depreciation Progress</h4>
                  <Progress
                    percent={getDepreciationProgress(selectedAsset)}
                    status={getDepreciationProgress(selectedAsset) >= 100 ? 'success' : 'active'}
                    strokeColor={{
                      from: '#108ee9',
                      to: '#87d068',
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <span>Depreciated: {getDepreciationProgress(selectedAsset).toFixed(2)}%</span>
                    <span style={{ marginLeft: 16 }}>
                      Remaining: {selectedAsset.remainingLife} years
                    </span>
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Timeline</h4>
                  <p>
                    <strong>Purchase Date:</strong> {selectedAsset.purchaseDate}
                  </p>
                  <p>
                    <strong>Current Year:</strong> {selectedAsset.currentYear}
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {selectedAsset.lastUpdated}
                  </p>
                  {selectedAsset.disposalDate && (
                    <p>
                      <strong>Disposal Date:</strong> {selectedAsset.disposalDate}
                    </p>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Notes</h4>
                  <p>{selectedAsset.notes}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title='Edit Depreciation'
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedAsset(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={handleUpdate}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='assetCode'
                label='Asset Code'
                rules={[{ required: true, message: 'Asset code is required!' }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='assetName'
                label='Asset Name'
                rules={[{ required: true, message: 'Asset name is required!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='depreciationYears'
                label='Depreciation Years'
                rules={[{ required: true, message: 'Depreciation years is required!' }]}
              >
                <Input type='number' min={1} max={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='depreciationMethod'
                label='Depreciation Method'
                rules={[{ required: true, message: 'Method is required!' }]}
              >
                <Select>
                  <Option value='Straight Line'>Straight Line</Option>
                  <Option value='Double Declining'>Double Declining</Option>
                  <Option value='Sum of Years'>Sum of Years</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='notes' label='Notes'>
            <TextArea rows={3} placeholder='Add notes about this asset...' />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                Update
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
