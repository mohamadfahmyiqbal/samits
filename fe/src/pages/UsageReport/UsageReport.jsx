import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Table, DatePicker, Select, Button, Spin, Statistic, message, Space, Typography, Tag, Divider } from 'antd';
import { ReloadOutlined, DownloadOutlined, FilterOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import inventoryService from '../../services/InventoryService';
import api from '../../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend
);

const { Title: TypoTitle, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UsageReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: null,
    category: 'all',
    type: 'all',
  });
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    totalValue: 0,
    topParts: [],
  });

  useEffect(() => {
    fetchUsageData();
  }, [filters]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: 1,
        limit: 100,
      };

      if (filters.dateRange) {
        params.date_range = filters.dateRange.map(d => d.format('YYYY-MM-DD'));
      }

      const response = await inventoryService.listTransactions(params);
      setData(response.items || []);

      // Calculate stats
      const aggStats = response.stats || { totalIn: 0, totalOut: 0, totalValue: 0 };
      setStats({
        totalIn: aggStats.totalIn,
        totalOut: aggStats.totalOut,
        totalValue: aggStats.totalValue,
        topParts: calculateTopParts(response.items || []),
      });
    } catch (error) {
      message.error('Gagal load usage report: ' + (error.message || 'API unavailable'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTopParts = (transactions) => {
    const partUsage = transactions.reduce((acc, trans) => {
      const partCode = trans.part_code || 'Unknown';
      acc[partCode] = (acc[partCode] || 0) + Math.abs(trans.quantity);
      return acc;
    }, {});
    
    return Object.entries(partUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([part, usage], idx) => ({ part, usage, rank: idx + 1 }));
  };

  const exportToCSV = () => {
    const csv = [
      ['Part Code', 'Part Name', 'Type', 'Quantity', 'Unit', 'Status', 'Date', 'Notes'],
      ...data.map(row => [
        row.part_code || '',
        row.part_name || '',
        row.type?.toUpperCase() || '',
        row.quantity || 0,
        row.unit || '',
        row.status || '',
        new Date(row.created_at).toLocaleDateString('id-ID'),
        `"${row.notes || ''}"`
      ].map(cell => `"${String(cell).replace(/"/g, '""')}"`))
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usage-report-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    message.success('Usage report diexport sebagai CSV');
  };

  const columns = [
    {
      title: 'Part Code',
      dataIndex: 'part_code',
      key: 'part_code',
      render: code => <Tag color="blue">{code || 'N/A'}</Tag>,
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={type === 'out' ? 'red' : 'green'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: qty => <strong>{qty} {data[0]?.unit || 'unit'}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  const pieData = useMemo(() => ({
    labels: stats.topParts.map(p => p.part),
    datasets: [{
      label: 'Usage',
      data: stats.topParts.map(p => p.usage),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  }), [stats.topParts]);

  const lineData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Usage',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#1890ff',
      backgroundColor: 'rgba(24, 144, 255, 0.1)',
    }],
  }), []);

  const onFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      <Space className="page-header mb-4" style={{ width: '100%', justifyContent: 'space-between' }}>
        <TypoTitle level={2}>Usage Report</TypoTitle>
        <Paragraph>Inventory usage analytics per part dan periode</Paragraph>
      </Space>

      <Card size="small">
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <RangePicker
              value={filters.dateRange}
              onChange={dates => onFiltersChange({ dateRange: dates })}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col>
            <Select
              value={filters.category}
              onChange={val => onFiltersChange({ category: val })}
              placeholder="All Categories"
              allowClear
              style={{ width: 150 }}
            >
              <Option value="all">All Categories</Option>
              <Option value="tools">Tools</Option>
              <Option value="spareparts">Spare Parts</Option>
            </Select>
          </Col>
          <Col>
            <Select
              value={filters.type}
              onChange={val => onFiltersChange({ type: val })}
              placeholder="All Types"
              allowClear
              style={{ width: 120 }}
            >
              <Option value="all">All</Option>
              <Option value="in">In</Option>
              <Option value="out">Out</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchUsageData} loading={loading}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV} type="primary">
                Export CSV
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total In"
              value={stats.totalIn}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Out (Usage)"
              value={stats.totalOut}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Value"
              value={stats.totalValue / 1000000}
              prefix="Rp"
              suffix="M"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top 5 Parts Usage">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Monthly Usage Trend">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
          </Card>
        </Col>
      </Row>

      <Card title="Transaction Details" extra={<Button icon={<FilterOutlined />}>Filter</Button>}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </>
  );
};

export default UsageReport;

