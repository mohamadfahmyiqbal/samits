import React from 'react';
import { Card, Table, Space, Button, Select, Input, Tag, Badge, Progress, InputNumber, Modal } from 'antd';
import { ReloadOutlined, BarcodeOutlined, SaveOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;

const StockOpnameTable = ({
  data,
  loading,
  onScan,
  onSaveAdjustment,
  onStartOpname,
  onCompleteOpname,
  filters,
  onFiltersChange,
  opnameStatus,
  totalDiscrepancies,
}) => {
  const columns = [
    {
      title: 'Part Code',
      dataIndex: 'part_code',
      key: 'part_code',
      width: 120,
      render: (code) => <strong><Badge dot>{code || '#'}</Badge></strong>,
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'System Stock',
      dataIndex: 'system_stock',
      key: 'system_stock',
      width: 120,
      align: 'right',
      render: (stock) => <Tag color="blue">{stock || 0}</Tag>,
    },
    {
      title: 'Physical Count',
      key: 'physical_count',
      width: 140,
      render: (_, record) => (
        <Space>
          <InputNumber
            min={0}
            value={record.physical_count}
            onChange={(value) => onScan(record.id, value)}
            precision={0}
            style={{ width: 80 }}
            placeholder="0"
          />
          <Button 
            type="link" 
            icon={<BarcodeOutlined />} 
            size="small"
            onClick={() => onScan(record.id, 1)}
            title="Scan barcode"
          />
        </Space>
      ),
    },
    {
      title: 'Variance',
      key: 'variance',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const variance = (record.physical_count || 0) - (record.system_stock || 0);
        const color = variance === 0 ? 'green' : variance > 0 ? 'orange' : 'red';
        return (
          <Tag color={color}>
            {variance === 0 ? 'OK' : `${variance > 0 ? '+' : ''}${variance}`}
          </Tag>
        );
      },
    },
    {
      title: 'Discrepancy Value',
      key: 'discrepancy_value',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const variance = (record.physical_count || 0) - (record.system_stock || 0);
        return `Rp ${Math.abs(variance * (record.unit_price || 0)).toLocaleString('id-ID')}`;
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const physical = record.physical_count || 0;
        const system = record.system_stock || 0;
        if (physical === 0) return <Tag color="default">Pending</Tag>;
        return <Tag color={physical === system ? 'green' : 'yellow'}>Counted</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          {record.physical_count !== undefined && (
            <Button 
              size="small" 
              icon={<SaveOutlined />} 
              onClick={() => onSaveAdjustment(record)}
            >
              Save
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <strong>Stock Opname {opnameStatus}</strong>
          <Badge count={totalDiscrepancies} color="red" title="Jumlah selisih" />
          <Progress 
            percent={Math.round((data.filter(d => d.physical_count !== undefined).length / data.length) * 100)} 
            status="active" 
            size="small"
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          />
        </Space>
      }
      extra={
        <Space>
          <Button 
            type={opnameStatus === 'draft' ? 'primary' : 'default'} 
            icon={<CheckOutlined />} 
            onClick={onStartOpname}
            disabled={opnameStatus !== 'draft'}
          >
            Mulai Opname
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={onCompleteOpname}
            disabled={opnameStatus !== 'active'}
          >
            Selesai & Approve
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Cari part code/nama"
            onSearch={(value) => onFiltersChange({ search: value })}
            style={{ width: 300 }}
          />
          <Select 
            placeholder="Status Variance" 
            onChange={(value) => onFiltersChange({ varianceStatus: value })}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="match">Match</Option>
            <Option value="surplus">Surplus</Option>
            <Option value="shortage">Shortage</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        scroll={{ x: 1000 }}
        size="middle"
        sticky
      />
    </Card>
  );
};

export default StockOpnameTable;

