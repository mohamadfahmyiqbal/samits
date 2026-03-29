import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Alert,
  Tag,
  Progress,
  Steps,
} from 'antd';
import { TruckOutlined, EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import './DeliveryDistribution.css';

const { Option } = Select;
const { Step } = Steps;

export default function DeliveryDistribution() {
  const [form] = Form.useForm();
  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const mockDeliveryData = [
    {
      id: 1,
      deliveryNumber: 'DLV-2024-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'PT. Teknologi Maju',
      customerContact: 'John Doe',
      customerPhone: '+62 21 1234 5678',
      customerAddress: 'Jl. Sudirman No. 123, Jakarta Selatan',
      deliveryDate: '2024-03-30',
      estimatedTime: '14:00',
      actualTime: null,
      status: 'in_progress',
      priority: 'high',
      items: [
        {
          name: 'Laptop Dell XPS 15',
          quantity: 5,
          unitPrice: 18000000,
          totalPrice: 90000000,
        },
        {
          name: 'Monitor LG 27 inch',
          quantity: 5,
          unitPrice: 3000000,
          totalPrice: 15000000,
        },
      ],
      totalItems: 10,
      totalValue: 105000000,
      deliveryFee: 500000,
      driver: 'Budi Santoso',
      vehicle: 'Truck-001',
      trackingNumber: 'TRK-2024-001',
      notes: 'Handle with care, electronic equipment',
      workflow: [
        {
          step: 'order_confirmed',
          status: 'completed',
          assignee: 'Sales Team',
          completed_date: '2024-03-29',
        },
        {
          step: 'preparing',
          status: 'completed',
          assignee: 'Warehouse Team',
          completed_date: '2024-03-30',
        },
        { step: 'in_transit', status: 'in_progress', assignee: 'Driver', completed_date: null },
        { step: 'delivered', status: 'pending', assignee: 'Customer', completed_date: null },
      ],
      createdDate: '2024-03-29',
      lastUpdated: '2024-03-30',
    },
    {
      id: 2,
      deliveryNumber: 'DLV-2024-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'CV. Digital Solution',
      customerContact: 'Sarah Johnson',
      customerPhone: '+62 21 8765 4321',
      customerAddress: 'Jl. Gatot Subroto No. 45, Jakarta Pusat',
      deliveryDate: '2024-03-31',
      estimatedTime: '10:00',
      actualTime: null,
      status: 'pending',
      priority: 'medium',
      items: [
        {
          name: 'Server HP ProLiant',
          quantity: 2,
          unitPrice: 60000000,
          totalPrice: 120000000,
        },
      ],
      totalItems: 2,
      totalValue: 120000000,
      deliveryFee: 750000,
      driver: 'Ahmad Wijaya',
      vehicle: 'Van-002',
      trackingNumber: 'TRK-2024-002',
      notes: 'Heavy equipment, need special handling',
      workflow: [
        {
          step: 'order_confirmed',
          status: 'completed',
          assignee: 'Sales Team',
          completed_date: '2024-03-30',
        },
        { step: 'preparing', status: 'pending', assignee: 'Warehouse Team', completed_date: null },
        { step: 'in_transit', status: 'pending', assignee: 'Driver', completed_date: null },
        { step: 'delivered', status: 'pending', assignee: 'Customer', completed_date: null },
      ],
      createdDate: '2024-03-30',
      lastUpdated: '2024-03-30',
    },
    {
      id: 3,
      deliveryNumber: 'DLV-2024-003',
      orderNumber: 'ORD-2024-003',
      customerName: 'PT. Inovasi Teknologi',
      customerContact: 'Michael Brown',
      customerPhone: '+62 21 9876 5432',
      customerAddress: 'Jl. Thamrin No. 78, Jakarta Pusat',
      deliveryDate: '2024-03-28',
      estimatedTime: '15:00',
      actualTime: '15:30',
      status: 'completed',
      priority: 'low',
      items: [
        {
          name: 'iPhone 13',
          quantity: 10,
          unitPrice: 15000000,
          totalPrice: 150000000,
        },
      ],
      totalItems: 10,
      totalValue: 150000000,
      deliveryFee: 300000,
      driver: 'Rudi Hermawan',
      vehicle: 'Motorcycle-003',
      trackingNumber: 'TRK-2024-003',
      notes: 'Delivered successfully',
      workflow: [
        {
          step: 'order_confirmed',
          status: 'completed',
          assignee: 'Sales Team',
          completed_date: '2024-03-27',
        },
        {
          step: 'preparing',
          status: 'completed',
          assignee: 'Warehouse Team',
          completed_date: '2024-03-28',
        },
        {
          step: 'in_transit',
          status: 'completed',
          assignee: 'Driver',
          completed_date: '2024-03-28',
        },
        {
          step: 'delivered',
          status: 'completed',
          assignee: 'Customer',
          completed_date: '2024-03-28',
        },
      ],
      createdDate: '2024-03-27',
      lastUpdated: '2024-03-28',
    },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
  ];

  useEffect(() => {
    setDeliveryData(mockDeliveryData);
    setFilteredData(mockDeliveryData);
  }, []);

  useEffect(() => {
    let filtered = deliveryData.filter((delivery) => {
      const matchesSearch =
        delivery.deliveryNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.orderNumber.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchText, selectedStatus, deliveryData]);

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setDetailModalVisible(true);
  };

  const handleEdit = (delivery) => {
    setSelectedDelivery(delivery);
    form.setFieldsValue({
      deliveryDate: delivery.deliveryDate,
      estimatedTime: delivery.estimatedTime,
      driver: delivery.driver,
      vehicle: delivery.vehicle,
      notes: delivery.notes,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedDelivery = {
        ...selectedDelivery,
        ...values,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      setDeliveryData((prev) =>
        prev.map((delivery) => (delivery.id === selectedDelivery.id ? updatedDelivery : delivery))
      );

      message.success('Delivery updated successfully');
      setEditModalVisible(false);
      setSelectedDelivery(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setLoading(true);
    try {
      setDeliveryData((prev) =>
        prev.map((delivery) => {
          if (delivery.id === id) {
            const currentStepIndex = delivery.workflow.findIndex(
              (step) => step.status === 'in_progress'
            );
            const nextStep = delivery.workflow[currentStepIndex + 1];

            if (newStatus === 'completed') {
              return {
                ...delivery,
                status: 'completed',
                actualTime: new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                workflow: delivery.workflow.map((step, index) =>
                  index === currentStepIndex
                    ? {
                        ...step,
                        status: 'completed',
                        completed_date: new Date().toISOString().split('T')[0],
                      }
                    : index === currentStepIndex + 1
                      ? {
                          ...step,
                          status: 'completed',
                          completed_date: new Date().toISOString().split('T')[0],
                        }
                      : step
                ),
              };
            } else {
              return {
                ...delivery,
                status: newStatus,
                workflow: delivery.workflow.map((step, index) =>
                  step.step === 'in_transit' && newStatus === 'in_progress'
                    ? { ...step, status: 'in_progress', completed_date: null }
                    : step
                ),
              };
            }
          }
          return delivery;
        })
      );

      message.success('Delivery status updated successfully');
    } catch (error) {
      message.error('Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    const found = priorities.find((p) => p.value === priority);
    return found ? found.color : 'default';
  };

  const getCurrentStep = (workflow) => {
    const inProgressStep = workflow.find((step) => step.status === 'in_progress');
    return inProgressStep
      ? workflow.findIndex((step) => step.step === inProgressStep.step)
      : workflow.length - 1;
  };

  const pendingDeliveries = filteredData.filter((delivery) => delivery.status === 'pending').length;
  const inProgressDeliveries = filteredData.filter(
    (delivery) => delivery.status === 'in_progress'
  ).length;
  const completedDeliveries = filteredData.filter(
    (delivery) => delivery.status === 'completed'
  ).length;
  const totalValue = filteredData.reduce((sum, delivery) => sum + delivery.totalValue, 0);

  const columns = [
    {
      title: 'Delivery Number',
      dataIndex: 'deliveryNumber',
      key: 'deliveryNumber',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.customerName}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.customerContact}</div>
        </div>
      ),
    },
    {
      title: 'Delivery Date & Time',
      key: 'dateTime',
      render: (_, record) => (
        <div>
          <div>{record.deliveryDate}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Est: {record.estimatedTime}
            {record.actualTime && <span> | Actual: {record.actualTime}</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Items & Value',
      key: 'itemsValue',
      render: (_, record) => (
        <div>
          <div>{record.totalItems} items</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Rp {record.totalValue.toLocaleString('id-ID')}
          </div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Button
            type='primary'
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'completed'}
          >
            Edit
          </Button>
          {record.status === 'in_progress' && (
            <Button
              type='primary'
              size='small'
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'completed')}
              loading={loading}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='delivery-distribution'>
      <div className='page-header'>
        <h1>Delivery Distribution</h1>
        <p>Management delivery orders and distribution tracking</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='statistic-card pending'>
              <div className='statistic-icon'>⏳</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Pending</div>
                <div className='statistic-value'>{pendingDeliveries}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card in-progress'>
              <div className='statistic-icon'>🚚</div>
              <div className='statistic-content'>
                <div className='statistic-title'>In Transit</div>
                <div className='statistic-value'>{inProgressDeliveries}</div>
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
                <div className='statistic-value'>{completedDeliveries}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='statistic-card total'>
              <div className='statistic-icon'>💰</div>
              <div className='statistic-content'>
                <div className='statistic-title'>Total Value</div>
                <div className='statistic-value'>Rp {totalValue.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title='Delivery Orders'>
        <div className='table-controls'>
          <Space>
            <Search
              placeholder='Search deliveries...'
              allowClear
              style={{ width: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: 200 }}>
              {statuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
            <Button icon={<FilterOutlined />}>More Filters</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} deliveries`,
          }}
          rowClassName={(record) => {
            if (record.status === 'pending') return 'row-pending';
            if (record.status === 'in_progress') return 'row-in-progress';
            if (record.status === 'completed') return 'row-completed';
            if (record.status === 'cancelled') return 'row-cancelled';
            return '';
          }}
        />
      </Card>

      <Modal
        title='Delivery Detail'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDelivery(null);
        }}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key='print' type='primary' icon={<TruckOutlined />}>
            Print Receipt
          </Button>,
        ]}
        width={1000}
      >
        {selectedDelivery && (
          <div className='delivery-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Delivery Information</h4>
                  <p>
                    <strong>Delivery Number:</strong> {selectedDelivery.deliveryNumber}
                  </p>
                  <p>
                    <strong>Order Number:</strong> {selectedDelivery.orderNumber}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag color={getStatusColor(selectedDelivery.status)}>
                      {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Priority:</strong>{' '}
                    <Tag color={getPriorityColor(selectedDelivery.priority)}>
                      {selectedDelivery.priority.toUpperCase()}
                    </Tag>
                  </p>
                  <p>
                    <strong>Tracking Number:</strong> {selectedDelivery.trackingNumber}
                  </p>
                </div>
              </Col>
              <Col span={12}>
                <div className='detail-section'>
                  <h4>Schedule</h4>
                  <p>
                    <strong>Delivery Date:</strong> {selectedDelivery.deliveryDate}
                  </p>
                  <p>
                    <strong>Estimated Time:</strong> {selectedDelivery.estimatedTime}
                  </p>
                  {selectedDelivery.actualTime && (
                    <p>
                      <strong>Actual Time:</strong> {selectedDelivery.actualTime}
                    </p>
                  )}
                  <p>
                    <strong>Driver:</strong> {selectedDelivery.driver}
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {selectedDelivery.vehicle}
                  </p>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Customer Information</h4>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <p>
                        <strong>Name:</strong> {selectedDelivery.customerName}
                      </p>
                      <p>
                        <strong>Contact:</strong> {selectedDelivery.customerContact}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedDelivery.customerPhone}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>Address:</strong> {selectedDelivery.customerAddress}
                      </p>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Items Summary</h4>
                  <table className='items-table'>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDelivery.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                          <td>Rp {item.totalPrice.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan='2' style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          Total:
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{selectedDelivery.totalItems} items</td>
                        <td style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          Rp {selectedDelivery.totalValue.toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan='3' style={{ textAlign: 'right' }}>
                          Delivery Fee:
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          Rp {selectedDelivery.deliveryFee.toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan='3'
                          style={{ textAlign: 'right', borderTop: '2px solid #f0f0f0' }}
                        >
                          Grand Total:
                        </td>
                        <td
                          style={{
                            fontWeight: 'bold',
                            color: '#1890ff',
                            borderTop: '2px solid #f0f0f0',
                          }}
                        >
                          Rp{' '}
                          {(
                            selectedDelivery.totalValue + selectedDelivery.deliveryFee
                          ).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Workflow Progress</h4>
                  <Steps current={getCurrentStep(selectedDelivery.workflow)} size='small'>
                    {selectedDelivery.workflow.map((step, index) => (
                      <Step
                        key={step.step}
                        title={step.step.replace('_', ' ').toUpperCase()}
                        description={
                          <div>
                            <div>{step.assignee}</div>
                            {step.completed_date && (
                              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                Completed: {step.completed_date}
                              </div>
                            )}
                          </div>
                        }
                        status={
                          step.status === 'completed'
                            ? 'finish'
                            : step.status === 'in_progress'
                              ? 'process'
                              : 'wait'
                        }
                      />
                    ))}
                  </Steps>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className='detail-section'>
                  <h4>Notes</h4>
                  <p>{selectedDelivery.notes}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title='Edit Delivery'
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedDelivery(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={handleUpdate}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='deliveryDate'
                label='Delivery Date'
                rules={[{ required: true, message: 'Delivery date is required!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='estimatedTime'
                label='Estimated Time'
                rules={[{ required: true, message: 'Estimated time is required!' }]}
              >
                <Input placeholder='14:00' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name='driver'
                label='Driver'
                rules={[{ required: true, message: 'Driver is required!' }]}
              >
                <Select placeholder='Select driver'>
                  <Option value='Budi Santoso'>Budi Santoso</Option>
                  <Option value='Ahmad Wijaya'>Ahmad Wijaya</Option>
                  <Option value='Rudi Hermawan'>Rudi Hermawan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='vehicle'
                label='Vehicle'
                rules={[{ required: true, message: 'Vehicle is required!' }]}
              >
                <Select placeholder='Select vehicle'>
                  <Option value='Truck-001'>Truck-001</Option>
                  <Option value='Van-002'>Van-002</Option>
                  <Option value='Motorcycle-003'>Motorcycle-003</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='notes' label='Notes'>
            <Input.TextArea rows={3} placeholder='Add delivery notes...' />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                Update
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
