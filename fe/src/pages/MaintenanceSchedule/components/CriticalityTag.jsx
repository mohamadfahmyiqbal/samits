import React from 'react';
import { Tag } from 'antd';

const CriticalityTag = ({ criticality }) => {
  const getCriticalityColor = (criticality) => {
    switch (criticality) {
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
    <Tag color={getCriticalityColor(criticality || 'medium')}>
      {(criticality || 'medium').toUpperCase()}
    </Tag>
  );
};

export default CriticalityTag;
