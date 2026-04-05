import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Spin, Statistic, message, Space, Typography } from 'antd';
import { ReloadOutlined, DownloadOutlined, PieChartOutlined } from '@ant-design/icons';
import api from '../services/api';
// Charts removed for compatibility - use Statistic only


const { Title } = Typography;

const SummaryAsset = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAssets, setTotalAssets] = useState(0);
  const [activeAssets, setActiveAssets] = useState(0);

  useEffect(() => {
    fetchAssetSummary();
  }, []);

  const fetchAssetSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/asset/summary');
      const summary = response.data || [];
      setData(summary);

      // Calculate totals
      const total = summary.reduce((sum, item) => sum + item.total, 0);
      const active = summary.reduce((sum, item) => sum + item.active, 0);
      setTotalAssets(total);
      setActiveAssets(active);
    } catch (error) {
      message.error('Gagal load summary asset: ' + (error.message || 'API unavailable'));
      // Fallback empty untuk prod
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Kategori', 'Total', 'Aktif', 'Depresiasi', 'Utilization'],
      ...data.map(row => [row.category, row.total, row.active, row.depreciated, row.utilization])
    ].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-summary.csv';
    a.click();
    message.success('Summary diexport sebagai CSV');
  };

  const columns = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Statistic value={total} valueStyle={{ color: '#3f8600' }} />,
    },
    {
      title: 'Aktif',
      dataIndex: 'active',
      key: 'active',
    },
    {
      title: 'Didepresiasi',
      dataIndex: 'depreciated',
      key: 'depreciated',
      render: (dep) => <Tag color="red">{dep}</Tag>,
    },
    {
      title: 'Utilization',
      dataIndex: 'utilization',
      key: 'utilization',
      render: (util) => (
        <Tag color={util > 90 ? 'green' : util > 80 ? 'blue' : 'orange'}>
          {util}%
        </Tag>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" className="d-flex justify-content-center py-5" />;
  }

  return (
    <>
      <Space className="page-header mb-4">
        <Title level={2}>Summary Asset</Title>
        <p>Overview aset ITAM berdasarkan kategori dan status lifecycle</p>
      </Space>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Assets"
              value={totalAssets}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Assets"
              value={activeAssets}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Utilization Rate"
              value={(activeAssets / totalAssets * 100).toFixed(1)}
              suffix="%"
              valueStyle={{ color: totalAssets > 0 && activeAssets / totalAssets > 0.9 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Detail Summary" extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAssetSummary} loading={loading}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportToCSV} type="primary">
            Export CSV
          </Button>
        </Space>
      }>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="category"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </>
  );
};

export default SummaryAsset;

