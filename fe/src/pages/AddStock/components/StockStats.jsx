import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { TruckOutlined } from '@ant-design/icons';

const StockStats = ({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col span={6}>
      <Card>
        <div className='statistic-card'>
          <div className='statistic-icon total'>📦</div>
          <div className='statistic-content'>
            <div className='statistic-title'>Total Items</div>
            <div className='statistic-value'>{stats.total}</div>
          </div>
        </div>
      </Card>
    </Col>
    <Col span={6}>
      <Card>
        <div className='statistic-card'>
          <div className='statistic-icon low'>⚠️</div>
          <div className='statistic-content'>
            <div className='statistic-title'>Low Stock</div>
            <div className='statistic-value'>{stats.low}</div>
          </div>
        </div>
      </Card>
    </Col>
    <Col span={6}>
      <Card>
        <div className='statistic-card'>
          <div className='statistic-icon normal'>✅</div>
          <div className='statistic-content'>
            <div className='statistic-title'>Normal Stock</div>
            <div className='statistic-value'>{stats.normal}</div>
          </div>
        </div>
      </Card>
    </Col>
    <Col span={6}>
      <Card>
        <div className='statistic-card'>
          <div className='statistic-icon overstock'>📈</div>
          <div className='statistic-content'>
            <div className='statistic-title'>Overstock</div>
            <div className='statistic-value'>{stats.overstock}</div>
          </div>
        </div>
      </Card>
    </Col>
  </Row>
);

export default StockStats;
