import React from 'react';
import { Tag } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const StatusTag = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CalendarOutlined />;
      case 'in_progress':
        return <ClockCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <ExclamationCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  return (
    <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
      {status.replace('_', ' ').toUpperCase()}
    </Tag>
  );
};

export default StatusTag;
