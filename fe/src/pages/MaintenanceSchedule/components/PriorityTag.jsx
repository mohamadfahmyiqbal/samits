import React from 'react';
import { Tag } from 'antd';

const PriorityTag = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <Tag color={getPriorityColor(priority)}>
      {priority.toUpperCase()}
    </Tag>
  );
};

export default PriorityTag;
