import React from 'react';
import { Card, Table, Space, Button, Select, Input } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const StockTable = ({
  columns,
  data,
  loading,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  onRefresh,
  onAdd,
}) => (
  <Card
    title='Daftar Stock Parts'
    extra={
      <Space>
        <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}>
          Tambah Parts
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          Refresh
        </Button>
      </Space>
    }
  >
    <div className='table-controls' style={{ marginBottom: 16 }}>
      <Space>
        <Select value={selectedCategory} onChange={onCategoryChange} style={{ width: 220 }}>
          {categoryOptions.map((cat) => (
            <Option key={cat.value} value={cat.value}>
              {cat.label}
            </Option>
          ))}
        </Select>
        <Input.Search
          placeholder='Cari parts...'
          allowClear
          style={{ width: 300 }}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </Space>
    </div>

    <Table
      columns={columns}
      dataSource={data}
      rowKey='id'
      loading={loading}
      pagination={{
        total: data.length,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} items`,
      }}
    />
  </Card>
);

export default StockTable;
