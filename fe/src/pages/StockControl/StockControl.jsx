import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Tag, Button, Statistic, Alert, Spin } from 'antd';
import { BarChartOutlined, ToolOutlined, BoxPlotOutlined, WarningOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../services';
import '../../App.css';

const StockControl = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalParts: 0,
    totalTools: 0,
    lowStockParts: 0,
    criticalStock: 0,
    totalValue: 0,
    alerts: []
  });
  const [partsData, setPartsData] = useState([]);
  const [toolsData, setToolsData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [partsRes, toolsRes] = await Promise.all([
        inventoryService.listParts({ limit: 10 }),
        inventoryService.listTools({ limit: 10 })
      ]);

      const parts = partsRes.data?.data || [];
      const tools = toolsRes.data?.data || [];

      // Calculate summary (client-side aggregation)
      const totalParts = parts.length;
      const lowStockParts = parts.filter(p => p.current_stock <= p.minimum_stock).length;
      const criticalStock = parts.filter(p => p.current_stock < p.minimum_stock * 0.5).length;
      const totalValue = parts.reduce((sum, p) => sum + (p.current_stock * (p.price || 0)), 0);

      setPartsData(parts);
      setToolsData(tools);
      setSummary({
        totalParts,
        totalTools: tools.length,
        lowStockParts,
        criticalStock,
        totalValue,
        alerts: parts.filter(p => p.current_stock <= p.minimum_stock)
      });
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="stock-control-loading" style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <p>Loading stock dashboard...</p>
      </div>
    );
  }

  return (
    <div className="stock-control-page">
      <div className="page-header">
        <h1><BarChartOutlined /> Stock Control Dashboard</h1>
        <p>Central dashboard untuk monitoring & management seluruh inventory (Parts & Tools)</p>
      </div>

      {/* Metrics Cards */}
      <Row gutter={[16, 16]} className="metrics-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Parts"
              value={summary.totalParts}
              prefix={<BoxPlotOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tools"
              value={summary.totalTools}
              prefix={<ToolOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock"
              value={summary.lowStockParts}
suffix={` / ${summary.totalParts}`}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critical"
              value={summary.criticalStock}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert
              message={
                <div>
                  <WarningOutlined /> {summary.lowStockParts} items low stock detected:
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    {summary.alerts.slice(0, 5).map((alert, idx) => (
                      <li key={idx}>{alert.part_name} ({alert.current_stock}/{alert.minimum_stock})</li>
                    ))}
                    {summary.alerts.length > 5 && <li>... dan {summary.alerts.length - 5} lainnya</li>}
                  </ul>
                </div>
              }
              type="warning"
              showIcon
              action={
                <Link to="/minimum-stock">
                  <Button type="link">View All</Button>
                </Link>
              }
            />
          </Col>
        </Row>
      )}

      {/* Main Tabs */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Inventory Overview" extra={<Button onClick={refreshData}>Refresh</Button>}>
            <Tabs
              defaultActiveKey="parts"
              items={[
                {
                  key: 'parts',
                  label: `Parts (${summary.totalParts})`,
                  children: (
                    <>
                      <div>Quick view parts stock table akan fetch real data</div>
                      <p>
                        <Link to="/stock-list">→ Manage Parts Stock</Link>
                      </p>
                    </>
                  ),
                },
                {
                  key: 'tools',
                  label: `Tools (${summary.totalTools})`,
                  children: <div>Tools inventory overview</div>,
                },
                {
                  key: 'categories',
                  label: 'Categories',
                  children: (
                    <p>
                      <Link to="/part-category">→ Category Management</Link>
                    </p>
                  ),
                },
                {
                  key: 'minimum',
                  label: 'Minimum Stock',
                  children: (
                    <p>
                      <Link to="/minimum-stock">→ Low Stock Alerts</Link>
                    </p>
                  ),
                },
                {
                  key: 'transactions',
                  label: 'Transactions',
                  children: <div>Recent stock movements history</div>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Button type="primary" block size="large">

            <Link to="/stock-list" style={{ color: 'white', textDecoration: 'none' }}>
              ➕ View Stock List
            </Link>

          </Button>
        </Col>
        <Col span={12}>
          <Button block size="large" danger>
            ⚠️ Handle Low Stock
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default StockControl;

