import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Button,
  Steps,
  Row,
  Col,
  Select,
  Input,
  Table,
  message,
  Modal,
  Alert,
  Tag,
  Divider,
  Space,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import './UserReplacement.css';

const { Step } = Steps;
const { Option } = Select;

export default function UserReplacement() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [newUser, setNewUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferData, setTransferData] = useState({});

  const steps = [
    {
      title: 'Search Asset',
      description: 'Find the asset to transfer',
      icon: <SearchOutlined />,
    },
    {
      title: 'Select User',
      description: 'Choose the new user',
      icon: <UserOutlined />,
    },
    {
      title: 'Transfer Details',
      description: 'Review and confirm transfer',
      icon: <SwapOutlined />,
    },
  ];

  const mockAssets = [
    {
      id: 1,
      assetCode: 'AST-001',
      assetName: 'Laptop Dell Latitude 5420',
      assetType: 'Laptop',
      serialNumber: 'DL5420-2022-001',
      currentUser: 'John Smith',
      userEmail: 'john.smith@company.com',
      department: 'IT',
      location: 'Office A-101',
      status: 'active',
      purchaseDate: '2022-01-15',
      lastMaintenance: '2024-03-15',
      warrantyExpiry: '2025-01-15',
    },
    {
      id: 2,
      assetCode: 'AST-002',
      assetName: 'Monitor LG 27 inch',
      assetType: 'Monitor',
      serialNumber: 'LG27-2022-002',
      currentUser: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      department: 'Marketing',
      location: 'Office B-205',
      status: 'active',
      purchaseDate: '2022-03-10',
      lastMaintenance: '2024-03-10',
      warrantyExpiry: '2025-03-10',
    },
    {
      id: 3,
      assetCode: 'AST-003',
      assetName: 'iPhone 13',
      assetType: 'Mobile Phone',
      serialNumber: 'IP13-2022-003',
      currentUser: 'Michael Brown',
      userEmail: 'michael.brown@company.com',
      department: 'Sales',
      location: 'Remote',
      status: 'active',
      purchaseDate: '2022-02-20',
      lastMaintenance: '2024-02-20',
      warrantyExpiry: '2024-02-20',
    },
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      department: 'IT',
      position: 'Senior Developer',
      currentAssets: 0,
      maxAssets: 3,
      status: 'active',
      joinDate: '2021-06-15',
    },
    {
      id: 2,
      name: 'Robert Wilson',
      email: 'robert.wilson@company.com',
      department: 'Finance',
      position: 'Financial Analyst',
      currentAssets: 1,
      maxAssets: 2,
      status: 'active',
      joinDate: '2020-09-20',
    },
    {
      id: 3,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      department: 'HR',
      position: 'HR Manager',
      currentAssets: 2,
      maxAssets: 3,
      status: 'active',
      joinDate: '2019-04-10',
    },
    {
      id: 4,
      name: 'James Taylor',
      email: 'james.taylor@company.com',
      department: 'Operations',
      position: 'Operations Manager',
      currentAssets: 1,
      maxAssets: 2,
      status: 'active',
      joinDate: '2021-01-15',
    },
  ];

  useEffect(() => {
    setSearchResults(mockAssets);
    setUserSearchResults(mockUsers);
  }, []);

  const handleAssetSearch = (value) => {
    if (!value) {
      setSearchResults(mockAssets);
      return;
    }

    const filtered = mockAssets.filter(
      (asset) =>
        asset.assetCode.toLowerCase().includes(value.toLowerCase()) ||
        asset.assetName.toLowerCase().includes(value.toLowerCase()) ||
        asset.currentUser.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleUserSearch = (value) => {
    if (!value) {
      setUserSearchResults(mockUsers);
      return;
    }

    const filtered = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.department.toLowerCase().includes(value.toLowerCase())
    );
    setUserSearchResults(filtered);
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setCurrentStep(1);
  };

  const handleUserSelect = (user) => {
    if (user.currentAssets >= user.maxAssets) {
      message.warning(
        `User ${user.name} has reached maximum asset limit (${user.maxAssets}/${user.maxAssets})`
      );
      return;
    }

    setNewUser(user);
    setCurrentStep(2);
  };

  const handleConfirmTransfer = () => {
    if (!selectedAsset || !newUser) {
      message.error('Please select both asset and user');
      return;
    }

    setTransferData({
      asset: selectedAsset,
      oldUser: {
        name: selectedAsset.currentUser,
        email: selectedAsset.userEmail,
        department: selectedAsset.department,
      },
      newUser: {
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
      },
      transferDate: new Date().toISOString().split('T')[0],
      reason: form.getFieldValue('reason') || 'User replacement request',
    });

    setShowConfirmModal(true);
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      // Simulate API call

      // Update asset assignment
      setSelectedAsset((prev) => ({
        ...prev,
        currentUser: newUser.name,
        userEmail: newUser.email,
        department: newUser.department,
        lastUpdated: new Date().toISOString().split('T')[0],
      }));

      // Update user asset count
      setNewUser((prev) => ({
        ...prev,
        currentAssets: prev.currentAssets + 1,
      }));

      message.success('Asset transferred successfully');
      setShowConfirmModal(false);
      setCurrentStep(0);
      setSelectedAsset(null);
      setNewUser(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to transfer asset');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const assetColumns = [
    {
      title: 'Asset Code',
      dataIndex: 'assetCode',
      key: 'assetCode',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Asset Name',
      dataIndex: 'assetName',
      key: 'assetName',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'assetType',
      key: 'assetType',
    },
    {
      title: 'Current User',
      key: 'currentUser',
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.currentUser}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          icon={<ArrowRightOutlined />}
          onClick={() => handleAssetSelect(record)}
          disabled={record.status !== 'active'}
        >
          Select
        </Button>
      ),
    },
  ];

  const userColumns = [
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
      title: 'Current Assets',
      key: 'currentAssets',
      render: (_, record) => (
        <div>
          <div>
            {record.currentAssets}/{record.maxAssets}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.currentAssets >= record.maxAssets ? (
              <Tag color='red'>Full</Tag>
            ) : (
              <Tag color='green'>Available</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          icon={<ArrowRightOutlined />}
          onClick={() => handleUserSelect(record)}
          disabled={record.currentAssets >= record.maxAssets}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <div className='user-replacement'>
      <div className='page-header'>
        <h1>User Replacement</h1>
        <p>Transfer assets from one user to another</p>
      </div>

      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} icon={step.icon} />
          ))}
        </Steps>

        {/* Step 1: Search Asset */}
        {currentStep === 0 && (
          <div className='step-content'>
            <div className='step-header'>
              <h3>Search Asset</h3>
              <p>Find the asset you want to transfer to a new user</p>
            </div>

            <div className='search-section'>
              <Input.Search
                placeholder='Search by asset code, name, or current user...'
                size='large'
                style={{ marginBottom: 24 }}
                onChange={(e) => handleAssetSearch(e.target.value)}
              />
            </div>

            <Table
              columns={assetColumns}
              dataSource={searchResults}
              rowKey='id'
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </div>
        )}

        {/* Step 2: Select User */}
        {currentStep === 1 && (
          <div className='step-content'>
            <div className='step-header'>
              <h3>Select New User</h3>
              <p>Choose the user who will receive the asset</p>
            </div>

            <div className='selected-asset-info'>
              <Card size='small' title='Selected Asset'>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <p>
                      <strong>Asset Code:</strong> {selectedAsset?.assetCode}
                    </p>
                    <p>
                      <strong>Asset Name:</strong> {selectedAsset?.assetName}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedAsset?.assetType}
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Current User:</strong> {selectedAsset?.currentUser}
                    </p>
                    <p>
                      <strong>Department:</strong> {selectedAsset?.department}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedAsset?.location}
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>
                      <strong>Status:</strong>
                      <Tag color={selectedAsset?.status === 'active' ? 'green' : 'red'}>
                        {selectedAsset?.status?.toUpperCase()}
                      </Tag>
                    </p>
                    <p>
                      <strong>Warranty:</strong> {selectedAsset?.warrantyExpiry}
                    </p>
                  </Col>
                </Row>
              </Card>
            </div>

            <div className='search-section'>
              <Input.Search
                placeholder='Search by name, email, or department...'
                size='large'
                style={{ marginBottom: 24 }}
                onChange={(e) => handleUserSearch(e.target.value)}
              />
            </div>

            <Table
              columns={userColumns}
              dataSource={userSearchResults}
              rowKey='id'
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </div>
        )}

        {/* Step 3: Transfer Details */}
        {currentStep === 2 && (
          <div className='step-content'>
            <div className='step-header'>
              <h3>Transfer Details</h3>
              <p>Review and confirm the asset transfer</p>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Card title='Asset Information'>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p>
                        <strong>Asset Code:</strong> {selectedAsset?.assetCode}
                      </p>
                      <p>
                        <strong>Asset Name:</strong> {selectedAsset?.assetName}
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedAsset?.assetType}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>Serial Number:</strong> {selectedAsset?.serialNumber}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedAsset?.location}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <Tag color={selectedAsset?.status === 'active' ? 'green' : 'red'}>
                          {selectedAsset?.status?.toUpperCase()}
                        </Tag>
                      </p>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={12}>
                <Card title='Transfer Information'>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p>
                        <strong>From:</strong>
                      </p>
                      <p>{selectedAsset?.currentUser}</p>
                      <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {selectedAsset?.userEmail}
                      </p>
                      <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {selectedAsset?.department}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>To:</strong>
                      </p>
                      <p>{newUser?.name}</p>
                      <p style={{ fontSize: '12px', color: '#8c8c8c' }}>{newUser?.email}</p>
                      <p style={{ fontSize: '12px', color: '#8c8c8c' }}>{newUser?.department}</p>
                    </Col>
                  </Row>
                  <Divider />
                  <Form form={form} layout='vertical'>
                    <Form.Item
                      name='reason'
                      label='Transfer Reason'
                      rules={[{ required: true, message: 'Please provide transfer reason!' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder='Explain why this transfer is necessary...'
                      />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>

            <div className='transfer-actions'>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                  Back
                </Button>
                <Button type='primary' icon={<SwapOutlined />} onClick={handleConfirmTransfer}>
                  Confirm Transfer
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className='navigation-actions'>
          <Space>
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < 2 && (
              <Button type='primary' disabled>
                Next
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title='Confirm Asset Transfer'
        open={showConfirmModal}
        onOk={handleTransfer}
        onCancel={() => setShowConfirmModal(false)}
        confirmLoading={loading}
        okText='Transfer Asset'
        cancelText='Cancel'
        width={600}
      >
        <div className='confirmation-content'>
          <Alert
            message='Please confirm the asset transfer'
            description='This action will transfer the asset from the current user to the new user. This action cannot be undone.'
            type='warning'
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div className='transfer-summary'>
            <h4>Transfer Summary:</h4>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <strong>Asset:</strong> {transferData.asset?.assetName}
                </p>
                <p>
                  <strong>Asset Code:</strong> {transferData.asset?.assetCode}
                </p>
                <p>
                  <strong>From:</strong> {transferData.oldUser?.name}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>To:</strong> {transferData.newUser?.name}
                </p>
                <p>
                  <strong>Transfer Date:</strong> {transferData.transferDate}
                </p>
                <p>
                  <strong>Reason:</strong> {transferData.reason}
                </p>
              </Col>
            </Row>
          </div>

          <p style={{ marginTop: 16 }}>
            <strong>Are you sure you want to proceed with this transfer?</strong>
          </p>
        </div>
      </Modal>
    </div>
  );
}
