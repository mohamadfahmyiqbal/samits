import React, { useMemo, useState } from 'react';
import { Table, Input, Select, Button, Space, Empty, Typography, Badge } from 'antd';
import { ReloadOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const DataTable = ({ 
  columns, 
  dataSource, 
  loading, 
  pagination,
  searchPlaceholder = "Search...",
  filters = [],
  onRefresh,
  rowClassName,
  searchFields = [],
}) => {
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!normalizedSearch) return dataSource;

    const fieldsToSearch =
      Array.isArray(searchFields) && searchFields.length > 0
        ? searchFields
        : null;

    return dataSource.filter((item) => {
      const values = fieldsToSearch
        ? fieldsToSearch.map((field) => item?.[field])
        : Object.values(item);

      return values.some((value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') return false;
        return String(value).toLowerCase().includes(normalizedSearch);
      });
    });
  }, [dataSource, normalizedSearch, searchFields]);

  const hasActiveFilters =
    Boolean(normalizedSearch) || filters.some((filter) => filter.value !== undefined && filter.value !== null && filter.value !== '' && filter.value !== 'all');

  const resetFilters = () => {
    setSearchText('');
    filters.forEach((filter) => {
      if (typeof filter.onReset === 'function') {
        filter.onReset();
      }
    });
  };

  const tableControls = (
    <div className="data-table__toolbar">
      <div className="data-table__search">
        <Search
          placeholder={searchPlaceholder}
          allowClear
          prefix={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
        />
      </div>

      <div className="data-table__actions">
        <div className="data-table__filters">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onChange={filter.onChange}
              className="data-table__filter"
              placeholder={filter.placeholder}
              allowClear={filter.allowClear ?? false}
              suffixIcon={<FilterOutlined />}
            >
              {(filter.options || []).map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          ))}
        </div>

        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
          <Button onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <div className="data-table">
      {tableControls}
      <div className="data-table__summary">
        <Typography.Text type="secondary">
          Menampilkan <strong>{filteredData.length}</strong> dari <strong>{dataSource.length}</strong>{' '}
          data
        </Typography.Text>
        {hasActiveFilters && (
          <Badge status="processing" text="Filter aktif" />
        )}
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={pagination}
        rowClassName={rowClassName}
        locale={{
          emptyText: (
            <Empty
              description={
                normalizedSearch || filters.length > 0
                  ? 'Tidak ada data yang cocok dengan pencarian atau filter.'
                  : 'Belum ada data untuk ditampilkan.'
              }
            />
          ),
        }}
      />
    </div>
  );
};

export default DataTable;
