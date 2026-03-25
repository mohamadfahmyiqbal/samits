import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Select, Input, DatePicker, Form, message, Modal, Alert, Tag, Progress, Statistic, Tooltip } from 'antd';
import { 
  CalculatorOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './ListDepresiasi.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ListDepresiasi() {
  const [form] = Form.useForm();
  const [depreciationData, setDepreciationData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    status: null,
    dateRange: null,
    search: ''
  });

  const depreciationColumns = [
    {
      title: 'Asset ID',
      dataIndex: 'asset_id',
      key: 'asset_id',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Nama Aset',
      dataIndex: 'asset_name',
      key: 'asset_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.asset_tag}</div>
        </div>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Tanggal Pembelian',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      render: (date) => new Date(date).toLocaleDateString('id-ID')
    },
    {
      title: 'Nilai Awal',
      dataIndex: 'initial_value',
      key: 'initial_value',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`
    },
    {
      title: 'Nilai Saat Ini',
      dataIndex: 'current_value',
      key: 'current_value',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`
    },
    {
      title: 'Depresiasi',
      dataIndex: 'depreciation_percentage',
      key: 'depreciation_percentage',
      render: (percentage) => (
        <div>
          <Progress 
            percent={percentage} 
            size="small" 
            status={percentage > 80 ? 'exception' : percentage > 60 ? 'active' : 'success'}
            format={percent => `${percent}%`}
          />
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'active': 'green',
          'depreciating': 'orange',
          'fully_depreciated': 'red',
          'disposed': 'default'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Lihat Detail">
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              Detail
            </Button>
          </Tooltip>
          {record.status !== 'disposed' && record.depreciation_percentage >= 60 && (
            <Tooltip title="Ajukan Disposal">
              <Button 
                type="primary" 
                danger
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleRequestDisposal(record)}
              >
                Disposal
              </Button>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    // Mock depreciation data
    setDepreciationData([
      {
        id: 1,
        asset_id: 'AST-001',
        asset_tag: 'LT-001',
        asset_name: 'Laptop Dell XPS 15',
        category: 'Laptop',
        purchase_date: '2020-01-15',
        initial_value: 25000000,
        current_value: 7500000,
        depreciation_percentage: 70,
        useful_life_years: 5,
        remaining_life_months: 18,
        status: 'depreciating',
        depreciation_method: 'Straight Line',
        monthly_depreciation: 291667
      },
      {
        id: 2,
        asset_id: 'AST-002',
        asset_tag: 'MN-001',
        asset_name: 'Monitor LG 27 inch',
        category: 'Monitor',
        purchase_date: '2019-06-20',
        initial_value: 5000000,
        current_value: 1000000,
        depreciation_percentage: 80,
        useful_life_years: 4,
        remaining_life_months: 6,
        status: 'depreciating',
        depreciation_method: 'Straight Line',
        monthly_depreciation: 83333
      },
      {
        id: 3,
        asset_id: 'AST-003',
        asset_tag: 'SRV-001',
        asset_name: 'Server HP ProLiant',
        category: 'Server',
        purchase_date: '2018-03-10',
        initial_value: 50000000,
        current_value: 5000000,
        depreciation_percentage: 90,
        useful_life_years: 6,
        remaining_life_months: 3,
        status: 'fully_depreciated',
        depreciation_method: 'Straight Line',
        monthly_depreciation: 625000
      },
      {
        id: 4,
        asset_id: 'AST-004',
        asset_tag: 'PRN-001',
        asset_name: 'Printer HP LaserJet',
        category: 'Printer',
        purchase_date: '2022-08-01',
        initial_value: 8000000,
        current_value: 6000000,
        depreciation_percentage: 25,
        useful_life_years: 4,
        remaining_life_months: 36,
        status: 'active',
        depreciation_method: 'Straight Line',
        monthly_depreciation: 55556
      }
    ]);
  }, []);

  const handleViewDetail = (asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleRequestDisposal = (asset) => {
    setSelectedAsset(asset);
    setShowDisposeModal(true);
  };

  const handleSubmitDisposal = async (values) => {
    try {
      setLoading(true);
      
      const disposalData = {
        asset_id: selectedAsset.asset_id,
        reason: values.reason,
        disposal_type: values.disposal_type,
        notes: values.notes,
        proposed_by: 'current_user', // Replace with actual user
        proposed_date: new Date().toISOString()
      };

      // API call to submit disposal request
      console.log('Submitting disposal request:', disposalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setDepreciationData(prev => prev.map(item => 
        item.id === selectedAsset.id 
          ? { ...item, status: 'disposed' }
          : item
      ));
      
      message.success('Pengajuan disposal berhasil dikirim!');
      setShowDisposeModal(false);
      setSelectedAsset(null);
      
    } catch (error) {
      message.error('Gagal mengirim pengajuan disposal');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (values) => {
    setFilters(values);
    // Apply filters to data
    console.log('Applying filters:', values);
  };

  const handleExport = () => {
    // Export functionality
    message.info('Export data depresiasi dalam proses...');
  };

  const calculateTotalDepreciation = () => {
    return depreciationData.reduce((total, asset) => total + (asset.initial_value - asset.current_value), 0);
  };

  const getAssetsReadyForDisposal = () => {
    return depreciationData.filter(asset => asset.depreciation_percentage >= 60 && asset.status !== 'disposed');
  };

  return (
    <div className="list-depresiasi">
      <div className="page-header">
        <h1>Daftar Depresiasi Aset</h1>
        <p>Monitor dan kelola depresiasi nilai aset perusahaan</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Aset"
              value={depreciationData.length}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Depresiasi"
              value={calculateTotalDepreciation()}
              prefix="Rp"
              formatter={(value) => `${value.toLocaleString('id-ID')}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Siap Disposal"
              value={getAssetsReadyForDisposal().length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Fully Depreciated"
              value={depreciationData.filter(a => a.status === 'fully_depreciated').length}
              valueStyle={{ color: '#d46b08' }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <div className="filter-section">
          <Form
            form={form}
            layout="inline"
            onFinish={handleFilter}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="search">
              <Input
                placeholder="Cari aset..."
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
            <Form.Item name="category">
              <Select placeholder="Kategori" allowClear style={{ width: 150 }}>
                <Option value="Laptop">Laptop</Option>
                <Option value="Monitor">Monitor</Option>
                <Option value="Server">Server</Option>
                <Option value="Printer">Printer</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status">
              <Select placeholder="Status" allowClear style={{ width: 150 }}>
                <Option value="active">Active</Option>
                <Option value="depreciating">Depreciating</Option>
                <Option value="fully_depreciated">Fully Depreciated</Option>
                <Option value="disposed">Disposed</Option>
              </Select>
            </Form.Item>
            <Form.Item name="dateRange">
              <RangePicker placeholder={['Dari', 'Sampai']} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                Filter
              </Button>
            </Form.Item>
            <Form.Item>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                Export
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Table */}
        <Table
          columns={depreciationColumns}
          dataSource={depreciationData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Detail Depresiasi Aset"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedAsset && (
          <div className="depreciation-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Aset</h4>
                <p><strong>Asset ID:</strong> {selectedAsset.asset_id}</p>
                <p><strong>Asset Tag:</strong> {selectedAsset.asset_tag}</p>
                <p><strong>Nama Aset:</strong> {selectedAsset.asset_name}</p>
                <p><strong>Kategori:</strong> {selectedAsset.category}</p>
                <p><strong>Status:</strong> <Tag color="blue">{selectedAsset.status}</Tag></p>
              </Col>
              <Col span={12}>
                <h4>Informasi Nilai</h4>
                <p><strong>Nilai Awal:</strong> Rp {selectedAsset.initial_value.toLocaleString('id-ID')}</p>
                <p><strong>Nilai Saat Ini:</strong> Rp {selectedAsset.current_value.toLocaleString('id-ID')}</p>
                <p><strong>Total Depresiasi:</strong> Rp {(selectedAsset.initial_value - selectedAsset.current_value).toLocaleString('id-ID')}</p>
                <p><strong>Persentase Depresiasi:</strong> {selectedAsset.depreciation_percentage}%</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Waktu</h4>
                <p><strong>Tanggal Pembelian:</strong> {new Date(selectedAsset.purchase_date).toLocaleDateString('id-ID')}</p>
                <p><strong>Masa Manfaat:</strong> {selectedAsset.useful_life_years} tahun</p>
                <p><strong>Sisa Masa Manfaat:</strong> {selectedAsset.remaining_life_months} bulan</p>
              </Col>
              <Col span={12}>
                <h4>Metode Depresiasi</h4>
                <p><strong>Metode:</strong> {selectedAsset.depreciation_method}</p>
                <p><strong>Depresiasi Bulanan:</strong> Rp {selectedAsset.monthly_depreciation.toLocaleString('id-ID')}</p>
                <p><strong>Depresiasi Tahunan:</strong> Rp {(selectedAsset.monthly_depreciation * 12).toLocaleString('id-ID')}</p>
              </Col>
            </Row>
            
            <div className="depreciation-progress">
              <h4>Progress Depresiasi</h4>
              <Progress 
                percent={selectedAsset.depreciation_percentage} 
                status={selectedAsset.depreciation_percentage > 80 ? 'exception' : 'active'}
                format={percent => `${percent}%`}
              />
              {selectedAsset.depreciation_percentage >= 60 && (
                <Alert
                  message="Aset siap untuk diajukan disposal"
                  description="Depresiasi已达 60% atau lebih, aset dapat diajukan untuk disposal."
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Disposal Modal */}
      <Modal
        title="Ajukan Disposal Aset"
        open={showDisposeModal}
        onCancel={() => setShowDisposeModal(false)}
        footer={null}
        width={600}
      >
        {selectedAsset && (
          <Form
            layout="vertical"
            onFinish={handleSubmitDisposal}
          >
            <Alert
              message={`Pengajuan Disposal: ${selectedAsset.asset_name}`}
              description={`Nilai saat ini: Rp ${selectedAsset.current_value.toLocaleString('id-ID')} (${selectedAsset.depreciation_percentage}% depresiasi)`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="disposal_type"
              label="Tipe Disposal"
              rules={[{ required: true, message: 'Pilih tipe disposal!' }]}
            >
              <Select placeholder="Pilih tipe disposal">
                <Option value="sell">Jual</Option>
                <Option value="donate">Donasi</Option>
                <Option value="scrap">Scrap/Rusak</Option>
                <Option value="replace">Penggantian</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Alasan Disposal"
              rules={[{ required: true, message: 'Masukkan alasan disposal!' }]}
            >
              <Input.TextArea rows={3} placeholder="Jelaskan alasan disposal aset..." />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Catatan Tambahan"
            >
              <Input.TextArea rows={2} placeholder="Catatan tambahan jika diperlukan..." />
            </Form.Item>

            <Form.Item>
              <div className="form-actions">
                <Button onClick={() => setShowDisposeModal(false)}>
                  Batal
                </Button>
                <Button 
                  type="primary" 
                  danger
                  htmlType="submit"
                  loading={loading}
                >
                  Ajukan Disposal
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
