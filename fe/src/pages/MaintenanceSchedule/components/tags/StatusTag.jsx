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
   case 'draft':
    return 'default';
   case 'scheduled':
    return 'blue';
   case 'assigned':
    return 'cyan';
   case 'in_progress':
    return 'orange';
   case 'on_hold':
    return 'gold';
   case 'waiting_part':
    return 'volcano';
   case 'completed':
    return 'green';
   case 'verified':
    return 'lime';
   case 'cancelled':
    return 'red';
   case 'overdue':
    return 'magenta';
   default:
    return 'default';
  }
 };

 const getStatusIcon = (status) => {
  switch (status) {
   case 'draft':
    return <CalendarOutlined />;
   case 'scheduled':
    return <CalendarOutlined />;
   case 'assigned':
    return <ClockCircleOutlined />;
   case 'in_progress':
    return <ClockCircleOutlined />;
   case 'on_hold':
    return <ExclamationCircleOutlined />;
   case 'waiting_part':
    return <ExclamationCircleOutlined />;
   case 'completed':
    return <CheckCircleOutlined />;
   case 'verified':
    return <CheckCircleOutlined />;
   case 'cancelled':
    return <ExclamationCircleOutlined />;
   case 'overdue':
    return <ExclamationCircleOutlined />;
   default:
    return <CalendarOutlined />;
  }
 };

 return (
  <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
   {String(status || 'draft')
    .replace(/_/g, ' ')
    .toUpperCase()}  </Tag>
 );
};

export default StatusTag;
