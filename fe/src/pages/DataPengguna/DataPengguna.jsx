import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Table, Button, Modal, Input, Select, Tag, Space, message } from 'antd';
import { UserOutlined, SearchOutlined, 
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './DataPengguna.css';

const { Option } = Select;

export default function DataPengguna() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const mockUserData = [
    {
      id: 1,
      nama: 'Ahmad Wijaya',
      email: 'ahmad.wijaya@company.com',
      department: 'IT',
      position: 'Software Engineer',
      asset_count: 3,
      assets: ['Laptop Dell XPS 15', 'Monitor LG 27 inch', 'Mouse Logitech'],
      join_date: '2022-01-15',
      status: 'active'
    },
    {
      id: 2,
      nama: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@company.com',
      department: 'Finance',
      position: 'Finance Analyst',
      asset_count: 2,
      assets: ['Laptop HP EliteBook', 'Docking Station'],
      join_date: '2021-06-20',
      status: 'active'
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      email: 'budi.santoso@company.com',
      department: 'Operations',
      position: 'Operations Manager',
      asset_count: 4,
      assets: ['Laptop ThinkPad', 'iPhone 13', 'Tablet iPad', 'Headset Jabra'],
      join_date: '2020-03-10',
      status: 'active'
    }
  ];

  useEffect(() => {
    setUserData(mockUserData);
    setFilteredData(mockUserData);
  }, []);

  useEffect(() => {
    const filtered = userData.filter(user => 
      user.nama.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.department.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, userData]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // API call to update user data

      setUserData(prev => prev.map(user => 
        user.id === selectedUser.id ? { ...user, ...values } : user
      ));
      
      message.success('Data pengguna berhasil diperbarui');
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      message.error('Gagal memperbarui data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setUserData(mockUserData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80 },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ) },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email' },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department' },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position' },
    {
      title: 'Jumlah Aset',
      dataIndex: 'asset_count',
      key: 'asset_count',
      render: (count) => <Tag color="blue">{count} Aset</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ) },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ) },
  ];

  return (
    <div className="data-pengguna">
      <div className="page-header">
        <h1>Data Pengguna</h1>
        <p>Kelola data pengguna dan alokasi aset</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div className="table-header">
              <Space>
                <Input
                  placeholder="Cari pengguna..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} dari ${total} pengguna` }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="expanded-content">
                    <h4>Daftar Aset:</h4>
                    <ul>
                      {record.assets.map((asset, index) => (
                        <li key={index}>{asset}</li>
                      ))}
                    </ul>
                    <p><strong>Tanggal Bergabung:</strong> {record.join_date}</p>
                  </div>
                ),
                rowExpandable: (record) => record.assets.length > 0 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Edit Data Pengguna"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Form as="form"
            layout="vertical"
            initialValues={{
              nama: selectedUser.nama,
              email: selectedUser.email,
              department: selectedUser.department,
              position: selectedUser.position,
              status: selectedUser.status }}
            onFinish={handleSave}
          >
            <Form as="form".Item
              controlId="nama"
              label="Nama Lengkap"
              rules={[{ required: true, message: 'Nama harus diisi!' }]}
            >
              <Input />
            </Form.Group>

            <Form as="form".Item
              controlId="email"
              label="Email"
              rules={[
                { required: true, message: 'Email harus diisi!' },
                { type: 'email', message: 'Format email tidak valid!' }
              ]}
            >
              <Input />
            </Form.Group>

            <Form as="form".Item
              controlId="department"
              label="Department"
              rules={[{ required: true, message: 'Department harus diisi!' }]}
            >
              <Select>
                <Option value="IT">IT</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Operations">Operations</Option>
                <Option value="HR">HR</Option>
                <Option value="Marketing">Marketing</Option>
              </Select>
            </Form.Group>

            <Form as="form".Item
              controlId="position"
              label="Position"
              rules={[{ required: true, message: 'Position harus diisi!' }]}
            >
              <Input />
            </Form.Group>

            <Form as="form".Item
              controlId="status"
              label="Status"
              rules={[{ required: true, message: 'Status harus diisi!' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Group>

            <Form as="form".Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Simpan
                </Button>
                <Button onClick={() => setEditModalVisible(false)}>
                  Batal
                </Button>
              </Space>
            </Form.Group>
          </Form>
        )}
      </Modal>
    </div>
  );
}
