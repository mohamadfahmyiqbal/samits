import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Modal, Input, Select, Tag, Space, message } from 'antd';
import { SearchOutlined, 
  DollarOutlined, 
  FileTextOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './Finance.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Finance() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  const mockFinanceData = [
    {
      id: 1,
      invoice_number: 'INV-2024-001',
      vendor_name: 'PT. Teknologi Maju',
      description: 'Purchase 10 Laptop Dell XPS 15',
      amount: 150000000,
      date: '2024-03-25',
      status: 'paid',
      category: 'Asset Purchase',
      approved_by: 'Finance Manager',
      approved_date: '2024-03-26'
    },
    {
      id: 2,
      invoice_number: 'INV-2024-002',
      vendor_name: 'PT. Sukses Jaya',
      description: 'Maintenance Contract Q1 2024',
      amount: 45000000,
      date: '2024-03-20',
      status: 'pending',
      category: 'Maintenance',
      approved_by: null,
      approved_date: null
    },
    {
      id: 3,
      invoice_number: 'INV-2024-003',
      vendor_name: 'PT. Parts Indonesia',
      description: 'Spare Parts for Server Maintenance',
      amount: 12500000,
      date: '2024-03-22',
      status: 'approved',
      category: 'Parts',
      approved_by: 'Finance Manager',
      approved_date: '2024-03-23'
    }
  ];

  useEffect(() => {
    setFinanceData(mockFinanceData);
    setFilteredData(mockFinanceData);
  }, []);

  useEffect(() => {
    let filtered = financeData.filter(record => 
      record.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
      record.vendor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.description.toLowerCase().includes(searchText.toLowerCase())
    );

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange[0].toDate() && recordDate <= dateRange[1].toDate();
      });
    }

    setFilteredData(filtered);
  }, [searchText, dateRange, financeData]);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve invoice

      setFinanceData(prev => prev.map(record => 
        record.id === id 
          ? { ...record, status: 'approved', approved_by: 'Finance Manager', approved_date: new Date().toISOString().split('T')[0] }
          : record
      ));
      
      message.success('Invoice berhasil di-approve');
    } catch (error) {
      message.error('Gagal meng-approve invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setFinanceData(mockFinanceData);
      setLoading(false);
      message.success('Data berhasil di-refresh');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'approved': return 'blue';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const totalAmount = filteredData.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = filteredData.filter(record => record.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = filteredData.filter(record => record.status === 'pending').reduce((sum, record) => sum + record.amount, 0);

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.amount - b.amount },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag> },
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
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.id)}
              loading={loading}
            >
              Approve
            </Button>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="finance">
      <div className="page-header">
        <h1>Finance Dashboard</h1>
        <p>Kelola invoice dan transaksi keuangan</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={paidAmount}
              prefix={<CheckCircleOutlined />}
              formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={pendingAmount}
              prefix={<ClockCircleOutlined />}
              formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div className="table-header">
              <Space>
                <Input
                  placeholder="Cari invoice..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <RangePicker
                  placeholder={['Start Date', 'End Date']}
                  onChange={setDateRange}
                  style={{ width: 250 }}
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
                  `${range[0]}-${range[1]} dari ${total} transaksi` }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Invoice Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedRecord?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(selectedRecord.id)}
              loading={loading}
            >
              Approve
            </Button>
          )
        ]}
        width={700}
      >
        {selectedRecord && (
          <div className="invoice-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>Invoice Number:</strong> {selectedRecord.invoice_number}</p>
                <p><strong>Vendor Name:</strong> {selectedRecord.vendor_name}</p>
                <p><strong>Date:</strong> {selectedRecord.date}</p>
                <p><strong>Category:</strong> {selectedRecord.category}</p>
              </Col>
              <Col span={12}>
                <p><strong>Amount:</strong> Rp {selectedRecord.amount.toLocaleString('id-ID')}</p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.status.toUpperCase()}</Tag></p>
                <p><strong>Approved By:</strong> {selectedRecord.approved_by || '-'}</p>
                <p><strong>Approved Date:</strong> {selectedRecord.approved_date || '-'}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p><strong>Description:</strong></p>
                <p>{selectedRecord.description}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
