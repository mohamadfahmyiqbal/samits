import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

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
  rowClassName 
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(dataSource);

  useEffect(() => {
    let filtered = dataSource.filter(item => {
      const matchesSearch = searchText === '' || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchText.toLowerCase())
        );
      return matchesSearch;
    });
    setFilteredData(filtered);
  }, [searchText, dataSource]);

  const tableControls = (
    <div className="table-controls">
      <Space>
        <Search
          placeholder={searchPlaceholder}
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {filters.map(filter => (
          <Select
            key={filter.key}
            value={filter.value}
            onChange={filter.onChange}
            style={{ width: 200 }}
            placeholder={filter.placeholder}
          >
            {filter.options.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        ))}
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>
    </div>
  );

  return (
    <div className="data-table">
      {tableControls}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={pagination}
        rowClassName={rowClassName}
      />
    </div>
  );
};

export default DataTable;
