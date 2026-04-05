import React from 'react';
import { Table, Tag, Row, Col } from 'antd';
import StatusTag from './StatusTag';
import PriorityTag from './PriorityTag';
import CriticalityTag from './CriticalityTag';
import ScheduleActions from './ScheduleActions';

const ScheduleTable = ({ 
  scheduleData, 
  loading, 
  onEdit, 
  onPrint, 
  onDelete 
}) => {
  const columns = [
    {
      title: 'Schedule Code',
      dataIndex: 'schedule_code',
      key: 'schedule_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color='blue'>{category}</Tag>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      render: (team) => <Tag color='green'>{team}</Tag>,
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <small>
            {record.start_time} - {record.end_time}
          </small>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <PriorityTag priority={priority} />,
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      key: 'criticality',
      render: (criticality) => <CriticalityTag criticality={criticality} />,
    },
    {
      title: 'Duration',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration',
      render: (duration) => `${duration}h`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <ScheduleActions
          record={record}
          onEdit={onEdit}
          onPrint={onPrint}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={scheduleData}
      rowKey='id'
      loading={loading}
      pagination={{
        total: scheduleData.length,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} jadwal`,
      }}
      expandable={{
        expandedRowRender: (record) => (
          <div className='expanded-content'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Detail Schedule</h4>
                <p>
                  <strong>Subcategory:</strong> {record.subcategory}
                </p>
                <p>
                  <strong>Priority:</strong>{' '}
                  <PriorityTag priority={record.priority} />
                </p>
                <p>
                  <strong>Created Date:</strong> {record.created_date}
                </p>
                <p>
                  <strong>Created By:</strong> {record.created_by}
                </p>
              </Col>
              <Col span={12}>
                <h4>Catatan</h4>
                <p>{record.notes}</p>
              </Col>
            </Row>
          </div>
        ),
        rowExpandable: (record) => record.notes,
      }}
    />
  );
};

export default ScheduleTable;
