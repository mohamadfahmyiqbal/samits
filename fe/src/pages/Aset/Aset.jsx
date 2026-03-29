import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, message, Radio } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  LaptopOutlined,
  DesktopOutlined,
  PrinterOutlined,
  HddOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function Aset() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetType, setAssetType] = useState('all');
  const [assetData, setAssetData] = useState([]);

  const mockAssetData = [
    {
      id: 1,
      asset_code: 'AST-001',
      asset_name: 'Laptop Dell XPS 15',
      asset_type: 'hardware',
      category: 'Laptop',
      brand: 'Dell',
      model: 'XPS 15 9520',
      serial_number: 'SN123456789',
      location: 'IT Office - Lantai 2',
      status: 'available',
      condition: 'good',
      last_maintenance: '2024-02-15',
      assigned_to: null,
    },
    {
      id: 2,
      asset_code: 'AST-002',
      asset_name: 'Monitor LG 27 inch',
      asset_type: 'hardware',
      category: 'Monitor',
      brand: 'LG',
      model: '27UP850',
      serial_number: 'SN987654321',
      location: 'IT Office - Lantai 2',
      status: 'in_use',
      condition: 'good',
      last_maintenance: '2024-01-20',
      assigned_to: 'John Doe',
    },
    {
      id: 3,
      asset_code: 'AST-003',
      asset_name: 'Server HP ProLiant',
      asset_type: 'hardware',
      category: 'Server',
      brand: 'HP',
      model: 'DL360 Gen10',
      serial_number: 'SN456789123',
      location: 'Data Center',
      status: 'in_use',
      condition: 'excellent',
      last_maintenance: '2024-03-10',
      assigned_to: 'IT Department',
    },
    {
      id: 4,
      asset_code: 'AST-004',
      asset_name: 'Printer Canon LBP',
      asset_type: 'hardware',
      category: 'Printer',
      brand: 'Canon',
      model: 'LBP6230dw',
      serial_number: 'SN789123456',
      location: 'HR Office - Lantai 1',
      status: 'maintenance',
      condition: 'fair',
      last_maintenance: '2024-03-25',
      assigned_to: 'HR Department',
    },
    {
      id: 5,
      asset_code: 'AST-005',
      asset_name: 'Microsoft Office 365',
      asset_type: 'software',
      category: 'Software',
      brand: 'Microsoft',
      model: 'Office 365 Business',
      serial_number: 'LICENSE-001',
      location: 'Cloud',
      status: 'active',
      condition: 'excellent',
      last_maintenance: '2024-03-01',
      assigned_to: 'All Employees',
    },
  ];

  useEffect(() => {
    setAssetData(mockAssetData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'in_use':
        return 'blue';
      case 'maintenance':
        return 'orange';
      case 'disposed':
        return 'red';
      case 'active':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'TERSEDIA';
      case 'in_use':
        return 'DIGUNAKAN';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'disposed':
        return 'DISPOSE';
      case 'active':
        return 'AKTIF';
      default:
        return status.toUpperCase();
    }
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'hardware':
        return <LaptopOutlined />;
      case 'software':
        return <DesktopOutlined />;
      case 'printer':
        return <PrinterOutlined />;
      case 'storage':
        return <HddOutlined />;
      default:
        return <ToolOutlined />;
    }
  };

  const filteredAssets = assetData.filter((asset) => {
    const matchesSearch =
      asset.asset_name.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = assetType === 'all' || asset.asset_type === assetType;

    return matchesSearch && matchesType;
  });

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleContinue = () => {
    if (!selectedAsset) {
      message.warning('Pilih aset terlebih dahulu!');
      return;
    }

    // Navigate based on selected action
    navigate('/asset-baru', {
      state: {
        selectedAsset: selectedAsset,
        action: 'existing',
      },
    });
  };

  const handleNewAsset = () => {
    navigate('/asset-baru', {
      state: {
        action: 'new',
      },
    });
  };

  const columns = [
    {
      title: 'Pilih',
      key: 'select',
      render: (_, record) => (
        <Radio
          checked={selectedAsset?.id === record.id}
          onChange={() => handleSelectAsset(record)}
        />
      ),
      width: 60,
    },
    {
      title: 'Kode Aset',
      dataIndex: 'asset_code',
      key: 'asset_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Nama Aset',
      dataIndex: 'asset_name',
      key: 'asset_name',
      render: (text, record) => (
        <div className='asset-name-cell'>
          {getAssetIcon(record.asset_type)}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Brand/Model',
      key: 'brand',
      render: (_, record) => (
        <div>
          <div>{record.brand}</div>
          <small style={{ color: '#888' }}>{record.model}</small>
        </div>
      ),
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Kondisi',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition) => (
        <Tag
          color={
            condition === 'excellent'
              ? 'green'
              : condition === 'good'
                ? 'blue'
                : condition === 'fair'
                  ? 'orange'
                  : 'red'
          }
        >
          {condition.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className='aset'>
      <div className='page-header'>
        <h1>Pilih Aset</h1>
        <p>Pilih aset yang akan diajukan atau buat aset baru</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align='middle'>
          <Col span={12}>
            <Input
              placeholder='Cari aset (nama, kode, brand...)'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Radio.Group
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              buttonStyle='solid'
            >
              <Radio.Button value='all'>Semua</Radio.Button>
              <Radio.Button value='hardware'>Hardware</Radio.Button>
              <Radio.Button value='software'>Software</Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type='primary' icon={<PlusOutlined />} onClick={handleNewAsset}>
              Aset Baru
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredAssets.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {selectedAsset && (
        <Card style={{ marginTop: 16, background: '#f6ffed' }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <h4 style={{ margin: 0 }}>Aset Terpilih:</h4>
              <p style={{ margin: '8px 0 0 0' }}>
                <strong>{selectedAsset.asset_code}</strong> - {selectedAsset.asset_name}
                <Tag color='blue' style={{ marginLeft: 8 }}>
                  {selectedAsset.category}
                </Tag>
              </p>
            </Col>
            <Col>
              <Button
                type='primary'
                size='large'
                icon={<ArrowRightOutlined />}
                onClick={handleContinue}
              >
                Lanjutkan ke Form Pengajuan
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
