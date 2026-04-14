import React from 'react';
import { Card, Table, Space, Button, Select, DatePicker, Input, Tag, Badge } from 'antd';
import { ReloadOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const { Option } = Select;
const { RangePicker } = DatePicker;

const StockMovementTable = ({
  columns,
  data,
  loading,
  pagination,
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  total,
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card
      title={
        <Space>
          <strong>Daftar Pergerakan Stok</strong>
          <Badge count={total} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      extra={
        <Space>
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            Ekspor CSV
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Muat Ulang
          </Button>
        </Space>
      }
    >
      <div className="table-filters" style={{ marginBottom: 16, padding: '12px 0' }}>
        <Space size="middle" wrap>
          <Select
            placeholder="Tipe Transaksi"
            value={filters.type || undefined}
            onChange={(value) => handleFilterChange('type', value)}
            style={{ width: 180 }}
            allowClear
          >
            <Option value="in">Stok Masuk</Option>
            <Option value="out">Stok Keluar</Option>
            <Option value="adjustment">Penyesuaian</Option>
          </Select>
          <RangePicker
            value={filters.dateRange || []}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            format="dd/MM/yyyy"
            style={{ width: 260 }}
            placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
          />
          <Input.Search
            placeholder="Cari kode part / nama part"
            value={filters.search || ''}
            onSearch={(value) => handleFilterChange('search', value)}
            style={{ width: 280 }}
            allowClear
          />
          <Button icon={<FilterOutlined />}>Terapkan</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} transaksi`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </Card>
  );
};

export default StockMovementTable;

