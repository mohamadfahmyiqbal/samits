import React from 'react';
import { Card, Row, Col } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const StatisticsCards = ({ scheduleData }) => {
  const statistics = [
    {
      title: 'Scheduled',
      count: scheduleData.filter((item) => item.status === 'scheduled').length,
      icon: <CalendarOutlined className='statistic-icon scheduled' />,
    },
    {
      title: 'In Progress',
      count: scheduleData.filter((item) => item.status === 'in_progress').length,
      icon: <ClockCircleOutlined className='statistic-icon in-progress' />,
    },
    {
      title: 'Completed',
      count: scheduleData.filter((item) => item.status === 'completed').length,
      icon: <CheckCircleOutlined className='statistic-icon completed' />,
    },
    {
      title: 'Pending',
      count: scheduleData.filter((item) => item.status === 'pending').length,
      icon: <ExclamationCircleOutlined className='statistic-icon pending' />,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statistics.map((stat, index) => (
        <Col span={6} key={index}>
          <Card>
            <div className='statistic-card'>
              {stat.icon}
              <div className='statistic-content'>
                <div className='statistic-title'>{stat.title}</div>
                <div className='statistic-value'>{stat.count}</div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;
