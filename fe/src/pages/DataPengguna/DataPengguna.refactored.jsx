import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Button, Tag, Space, message } from 'antd';
import { UserOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Shared Components
import PageLayout from '../../components/shared/PageLayout';
import DataTable from '../../components/shared/DataTable';
import ActionModal from '../../components/shared/ActionModal';

// Custom Hooks
import useTableData from '../../hooks/useTableData';
import useModal from '../../hooks/useModal';

// Constants
import { STATUSES, PRIORITIES, getStatusColor, getPriorityColor } from '../../constants/statuses';

import './DataPengguna.css';

export default function DataPengguna() {
  const navigate = useNavigate();
  const { visible, showModal, hideModal } = useModal();
  const { data, loading, setData, refreshData } = useTableData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  const mockUserData = [
    {
      id: 1,
      name: 'Ahmad Wijaya',
      email: 'ahmad.wijaya@company.com',
      department: 'IT',
      position: 'Software Engineer',
      status: 'active',
      joinDate: '2022-01-15',
      lastActive: '2024-03-30',
    },
    // ... more mock data
  ];

  useEffect(() => {
    setData(mockUserData);
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    showModal(user);
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedUser) {
        // Update existing user
        setData((prev) =>
          prev.map((user) => (user.id === selectedUser.id ? { ...user, ...values } : user))
        );
        message.success('User berhasil diupdate');
      } else {
        // Add new user
        const newUser = { id: Date.now(), ...values };
        setData((prev) => [...prev, newUser]);
        message.success('User berhasil ditambahkan');
      }
      hideModal();
      form.resetFields();
    } catch (error) {
      message.error('Gagal menyimpan user');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      value: 'all',
      onChange: (value) => console.log('Filter by status:', value),
      placeholder: 'Filter by Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.values(STATUSES).map((status) => ({
          value: status.value,
          label: status.label,
        })),
      ],
    },
  ];

  return (
    <PageLayout
      title='Data Pengguna'
      subtitle='Management data pengguna sistem'
      extra={
        <Button type='primary' icon={<UserOutlined />} onClick={() => showModal()}>
          Add User
        </Button>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card'>
              <div className='statistic-icon'>👥</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Users</div>
                <div className='statistic-value'>{data.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card pending'>
              <div className='statistic-icon'>⏳</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Pending</div>
                <div className='statistic-value'>
                  {data.filter((u) => u.status === 'pending').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card in-progress'>
              <div className='statistic-icon'>🔄</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Active</div>
                <div className='statistic-value'>
                  {data.filter((u) => u.status === 'active').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card completed'>
              <div className='statistic-icon'>✅</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Completed</div>
                <div className='statistic-value'>
                  {data.filter((u) => u.status === 'completed').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <DataTable
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} users`,
        }}
        searchPlaceholder='Cari user...'
        filters={filters}
        onRefresh={refreshData}
        rowClassName={(record) => {
          if (record.status === 'pending') return 'row-pending';
          if (record.status === 'in_progress') return 'row-in-progress';
          if (record.status === 'completed') return 'row-completed';
          return '';
        }}
      />

      <ActionModal
        title={selectedUser ? 'Edit User' : 'Add User'}
        visible={visible}
        onCancel={hideModal}
        onSubmit={() => form.submit()}
        loading={loading}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            name='name'
            label='Full Name'
            rules={[{ required: true, message: 'Name harus diisi!' }]}
          >
            <Input placeholder='Masukkan nama lengkap' />
          </Form.Item>

          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Email harus diisi!' },
              { type: 'email', message: 'Format email tidak valid!' },
            ]}
          >
            <Input placeholder='email@company.com' />
          </Form.Item>

          <Form.Item
            name='department'
            label='Department'
            rules={[{ required: true, message: 'Department harus diisi!' }]}
          >
            <Select placeholder='Pilih department'>
              <Option value='IT'>IT</Option>
              <Option value='Finance'>Finance</Option>
              <Option value='HR'>HR</Option>
              <Option value='Operations'>Operations</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name='position'
            label='Position'
            rules={[{ required: true, message: 'Position harus diisi!' }]}
          >
            <Input placeholder='Masukkan posisi/jabatan' />
          </Form.Item>

          <Form.Item
            name='status'
            label='Status'
            rules={[{ required: true, message: 'Status harus diisi!' }]}
          >
            <Select placeholder='Pilih status'>
              {Object.values(STATUSES).map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </ActionModal>
    </PageLayout>
  );
}
