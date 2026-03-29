import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Timeline, Tag, Table, Badge } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  TeamOutlined,
  StarOutlined,
} from '@ant-design/icons';

export default function SLADashboard() {
  const [slaData, setSlaData] = useState({
    overallCompliance: 94,
    avgResponseTime: 2.3,
    avgResolutionTime: 8.5,
    totalTickets: 156,
    slaBreaches: 12,
    metSLA: 144,
  });

  const [priorityData] = useState([
    {
      priority: 'Critical',
      met: 18,
      total: 20,
      responseTarget: '1 jam',
      resolutionTarget: '4 jam',
    },
    { priority: 'High', met: 35, total: 40, responseTarget: '4 jam', resolutionTarget: '8 jam' },
    { priority: 'Medium', met: 68, total: 70, responseTarget: '8 jam', resolutionTarget: '24 jam' },
    { priority: 'Low', met: 23, total: 26, responseTarget: '24 jam', resolutionTarget: '48 jam' },
  ]);

  const columns = [
    { title: 'Prioritas', dataIndex: 'priority', key: 'priority' },
    {
      title: 'SLA Met',
      key: 'compliance',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.met / record.total) * 100)}
          size='small'
          status={record.met / record.total >= 0.9 ? 'success' : 'exception'}
        />
      ),
    },
    { title: 'Target Response', dataIndex: 'responseTarget', key: 'responseTarget' },
    { title: 'Target Resolution', dataIndex: 'resolutionTarget', key: 'resolutionTarget' },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Badge
          status={record.met / record.total >= 0.9 ? 'success' : 'warning'}
          text={record.met / record.total >= 0.9 ? 'GOOD' : 'AT RISK'}
        />
      ),
    },
  ];

  return (
    <div className='sla-dashboard'>
      <div className='page-header'>
        <h1>SLA Dashboard</h1>
        <p>Service Level Agreement compliance monitoring</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title='Overall SLA Compliance'
              value={slaData.overallCompliance}
              suffix='%'
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: slaData.overallCompliance >= 90 ? '#52c41a' : '#faad14' }}
            />
            <Progress percent={slaData.overallCompliance} status='active' />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Avg Response Time'
              value={slaData.avgResponseTime}
              suffix='jam'
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <small>Target: {'<'} 4 jam</small>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Avg Resolution Time'
              value={slaData.avgResolutionTime}
              suffix='jam'
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <small>Target: {'<'} 12 jam</small>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='SLA Breaches'
              value={slaData.slaBreaches}
              prefix={<WarningOutlined />}
              valueStyle={{ color: slaData.slaBreaches > 10 ? '#ff4d4f' : '#faad14' }}
            />
            <small>dari {slaData.totalTickets} tickets</small>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title='SLA Compliance by Priority'>
            <Table
              dataSource={priorityData}
              columns={columns}
              pagination={false}
              rowKey='priority'
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title='Recent SLA Breaches'>
            <Timeline>
              <Timeline.Item color='red'>
                <p>
                  <strong>Ticket #1234</strong> - Server Down
                </p>
                <p>
                  <Tag color='red'>Critical</Tag> Response time: 2.5 jam (Target: 1 jam)
                </p>
                <small>2 jam yang lalu</small>
              </Timeline.Item>
              <Timeline.Item color='orange'>
                <p>
                  <strong>Ticket #1230</strong> - Network Issue
                </p>
                <p>
                  <Tag color='orange'>High</Tag> Resolution time: 12 jam (Target: 8 jam)
                </p>
                <small>5 jam yang lalu</small>
              </Timeline.Item>
              <Timeline.Item color='orange'>
                <p>
                  <strong>Ticket #1225</strong> - Printer Offline
                </p>
                <p>
                  <Tag color='blue'>Medium</Tag> Response time: 10 jam (Target: 8 jam)
                </p>
                <small>1 hari yang lalu</small>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
