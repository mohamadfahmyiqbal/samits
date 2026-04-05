import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Spin, Statistic, message, Space, Typography, Alert, Progress, Divider } from 'antd';
import { ReloadOutlined, DownloadOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';
import inventoryService from '../services/inventory.service';
import api from '../services/api';

const { Title } = Typography;

const SummaryStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState(20);
  const [totalValue, setTotalValue] = useState(0);
  const [reorderCount, setReorderCount] = useState(0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchStockSummary();
    fetchAlerts();
  }, []);

  const fetchStockSummary = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getSummary();
      const summary = response.data || [];
      setData(summary);

      // Calculate aggregates
      const totalVal = summary.reduce((sum, item) => {
        const val = parseFloat(item.value.replace(/[^0-9]/g, '')) || 0;
        return sum + val;
      }, 0);
      setTotalValue(totalVal);

      const reorder = summary.filter(item => item.reorder > 0).length;
      setReorderCount(reorder);
    } catch (error) {
      message.error('Gagal load stock summary: ' + (error.message || 'Service unavailable'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await inventoryService.getAlerts({ critical: true });
      setAlerts(response.data || []);
    } catch {
      setAlerts([]);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Kategori', 'Total', 'Tersedia', 'Min Stock', 'Reorder', 'Value', 'Status'],
      ...data.map(row => [
        row.category,
        row.total,
        row.available,
        row.minStock,
        row.reorder,
        row.value,
        getStockStatus(row.available, row.minStock, row.total).status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock-summary-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    message.success('Stock summary diexport sebagai CSV');
  };

  const getStockStatus = (available, minStock, total) => {
    const percentage = total > 0 ? ((available / total) * 100) : 0;
    if (percentage < criticalThreshold) return { status: 'CRITICAL', color: 'red' };
    if (available < minStock) return { status: 'LOW', color: 'orange' };
    return { status: 'OK', color: 'green' };
  };

  const columns = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: cat => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Tersedia',
      dataIndex: 'available',
      key: 'available',
      render: avail => <Tag color="cyan">{avail}</Tag>,
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStock',
      key: 'minStock',
      render: min => <Tag color="gold">{min}</Tag>,
    },
    {
      title: 'Reorder',
      dataIndex: 'reorder',
      key: 'reorder',
      render: reorder => reorder > 0 ? <Tag color="red">{reorder}</Tag> : reorder,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: value => <strong>{value}</strong>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => {
        const status = getStockStatus(row.available, row.minStock, row.total);
        return (
          <Space direction="vertical" size="small">
            <Tag color={status.color}>{status.status}</Tag>
            <Progress 
              percent={row.total > 0 ? (row.available / row.total * 100) : 0} 
              status="active"
              strokeColor={status.color}
              size="small"
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Title level={2} className="mb-2">Summary Stock & Inventory</Title>
      <p>ITSM Inventory control dengan real-time alerts</p>

      {alerts.length > 0 && (
        <Alert
          message={
            <Space>
              <BellOutlined />
              {alerts.length} critical stock items perlu reorder
            </Space>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={totalValue / 1000000}
              prefix="Rp"
              suffix="M"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Items Need Reorder"
              value={reorderCount}
              valueStyle={{ color: reorderCount > 5 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Avg Fill Rate"
              value={data.length > 0 ? data.reduce((sum, d) => sum + (d.available/d.total || 0), 0) / data.length * 100 : 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Stock Levels Detail" 
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchStockSummary} loading={loading}>
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />} onClick={exportToCSV} type="primary">
              Export CSV
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="category"
          loading={loading}
          pagination={{ pageSize: 10, showQuickJumper: true }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </>
  );
};

export default SummaryStock;
