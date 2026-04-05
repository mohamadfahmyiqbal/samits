import React from 'react';
import { Space, Button } from 'antd';
import { EditOutlined, PrinterOutlined, DeleteOutlined } from '@ant-design/icons';

const ScheduleActions = ({ record, onEdit, onPrint, onDelete }) => {
  return (
    <Space>
      <Button
        type='primary'
        size='small'
        icon={<EditOutlined />}
        onClick={() => onEdit(record)}
      >
        Edit
      </Button>
      <Button
        type='primary'
        size='small'
        icon={<PrinterOutlined />}
        onClick={() => onPrint(record)}
      >
        Print
      </Button>
      <Button
        type='primary'
        danger
        size='small'
        icon={<DeleteOutlined />}
        onClick={() => onDelete(record.id)}
      >
        Delete
      </Button>
    </Space>
  );
};

export default ScheduleActions;
