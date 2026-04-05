import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, Input, Select, Tag, Space, message, Upload, Steps } from 'antd';
import { SearchOutlined, 
  FileTextOutlined,
  EyeOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SendOutlined
} from '@ant-design/icons';
import './Invoice.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

export default function Invoice() {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  const mockInvoiceData = [
    {
      id: 1,
      invoice_number: 'INV-2024-001',
      po_number: 'PO-2024-001',
      vendor_name: 'PT. Teknologi Maju',
      vendor_address: 'Jl. Teknologi No. 123, Jakarta',
      vendor_tax_id: '01.123.456.7-123.000',
      delivery_note: 'DN-2024-001',
      items: [
        { name: 'Laptop Dell XPS 15', quantity: 10, unit_price: 15000000, total: 150000000 },
        { name: 'Laptop Case', quantity: 10, unit_price: 500000, total: 5000000 }
      ],
      subtotal: 155000000,
      tax: 15500000,
      total_amount: 170500000,
      issue_date: '2024-03-25',
      due_date: '2024-04-25',
      status: 'paid',
      payment_date: '2024-04-20',
      payment_method: 'Bank Transfer',
      created_by: 'Procurement Team',
      approved_by: 'Finance Manager'
    },
    {
      id: 2,
      invoice_number: 'INV-2024-002',
      po_number: 'PO-2024-002',
      vendor_name: 'PT. Sukses Jaya',
      vendor_address: 'Jl. Sukses No. 456, Surabaya',
      vendor_tax_id: '01.456.789.0-456.000',
      delivery_note: 'DN-2024-002',
      items: [
        { name: 'Maintenance Contract Q1 2024', quantity: 1, unit_price: 45000000, total: 45000000 }
      ],
      subtotal: 45000000,
      tax: 4500000,
      total_amount: 49500000,
      issue_date: '2024-03-20',
      due_date: '2024-04-20',
      status: 'pending',
      payment_date: null,
      payment_method: null,
      created_by: 'Maintenance Team',
      approved_by: null
    },
    {
      id: 3,
      invoice_number: 'INV-2024-003',
      po_number: 'PO-2024-003',
      vendor_name: 'PT. Parts Indonesia',
      vendor_address: 'Jl. Parts No. 789, Bandung',
      vendor_tax_id: '01.789.012.3-789.000',
      delivery_note: 'DN-2024-003',
      items: [
        { name: 'Server RAM 32GB DDR4', quantity: 4, unit_price: 2500000, total: 10000000 },
        { name: 'SSD 1TB Enterprise', quantity: 2, unit_price: 1250000, total: 2500000 }
      ],
      subtotal: 12500000,
      tax: 1250000,
      total_amount: 13750000,
      issue_date: '2024-03-22',
      due_date: '2024-04-22',
      status: 'approved',
      payment_date: null,
      payment_method: null,
      created_by: 'IT Team',
      approved_by: 'Finance Manager'
    }
  ];

  useEffect(() => {
    setInvoiceData(mockInvoiceData);
    setFilteredData(mockInvoiceData);
  }, []);

  useEffect(() => {
    let filtered = invoiceData.filter(record => 
      record.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
      record.vendor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.po_number.toLowerCase().includes(searchText.toLowerCase())
    );

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.issue_date);
        return recordDate >= dateRange[0].toDate() && recordDate <= dateRange[1].toDate();
      });
    }

    setFilteredData(filtered);
  }, [searchText, dateRange, invoiceData]);

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalVisible(true);
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // API call to approve invoice

      setInvoiceData(prev => prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, status: 'approved', approved_by: 'Finance Manager' }
          : invoice
      ));
      
      message.success('Invoice berhasil di-approve');
    } catch (error) {
      message.error('Gagal meng-approve invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToFinance = async (id) => {
    setLoading(true);
    try {
      // API call to send invoice to finance

      setInvoiceData(prev => prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, status: 'paid', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Bank Transfer' }
          : invoice
      ));
      
      message.success('Invoice berhasil dikirim ke finance');
    } catch (error) {
      message.error('Gagal mengirim invoice ke finance');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setInvoiceData(mockInvoiceData);
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

  const getCurrentStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'approved': return 1;
      case 'paid': return 2;
      default: return 0;
    }
  };

  const totalAmount = filteredData.reduce((sum, record) => sum + record.total_amount, 0);
  const paidAmount = filteredData.filter(record => record.status === 'paid').reduce((sum, record) => sum + record.total_amount, 0);
  const pendingAmount = filteredData.filter(record => record.status === 'pending').reduce((sum, record) => sum + record.total_amount, 0);

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text) => <strong>{text}</strong> },
    {
      title: 'PO Number',
      dataIndex: 'po_number',
      key: 'po_number' },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name' },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.total_amount - b.total_amount },
    {
      title: 'Issue Date',
      dataIndex: 'issue_date',
      key: 'issue_date',
      sorter: (a, b) => new Date(a.issue_date) - new Date(b.issue_date) },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date) },
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
          {record.status === 'approved' && (
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSendToFinance(record.id)}
              loading={loading}
            >
              Send to Finance
            </Button>
          )}
        </Space>
      ) },
  ];

  return (
    <div className="invoice">
      <div className="page-header">
        <h1>Invoice Management</h1>
        <p>Kelola invoice dan pembayaran vendor</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <FileTextOutlined className="statistic-icon" />
              <div className="statistic-content">
                <div className="statistic-title">Total Amount</div>
                <div className="statistic-value">Rp {totalAmount.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <CheckCircleOutlined className="statistic-icon paid" />
              <div className="statistic-content">
                <div className="statistic-title">Paid Amount</div>
                <div className="statistic-value">Rp {paidAmount.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="statistic-card">
              <ClockCircleOutlined className="statistic-icon pending" />
              <div className="statistic-content">
                <div className="statistic-title">Pending Amount</div>
                <div className="statistic-value">Rp {pendingAmount.toLocaleString('id-ID')}</div>
              </div>
            </div>
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
                  `${range[0]}-${range[1]} dari ${total} invoice` }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Invoice Detail"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedInvoice(null);
        }}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            Print
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedInvoice?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(selectedInvoice.id)}
              loading={loading}
            >
              Approve
            </Button>
          ),
          selectedInvoice?.status === 'approved' && (
            <Button
              key="send"
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSendToFinance(selectedInvoice.id)}
              loading={loading}
            >
              Send to Finance
            </Button>
          )
        ]}
        width={1000}
      >
        {selectedInvoice && (
          <div className="invoice-detail">
            <div className="invoice-header">
              <h3>INVOICE</h3>
              <p><strong>{selectedInvoice.invoice_number}</strong></p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <div className="vendor-info">
                  <h4>Vendor Information</h4>
                  <p><strong>{selectedInvoice.vendor_name}</strong></p>
                  <p>{selectedInvoice.vendor_address}</p>
                  <p>Tax ID: {selectedInvoice.vendor_tax_id}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="invoice-info">
                  <h4>Invoice Information</h4>
                  <p><strong>PO Number:</strong> {selectedInvoice.po_number}</p>
                  <p><strong>Delivery Note:</strong> {selectedInvoice.delivery_note}</p>
                  <p><strong>Issue Date:</strong> {selectedInvoice.issue_date}</p>
                  <p><strong>Due Date:</strong> {selectedInvoice.due_date}</p>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status.toUpperCase()}</Tag></p>
                </div>
              </Col>
            </Row>

            <div className="invoice-items">
              <h4>Items</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>Rp {item.unit_price.toLocaleString('id-ID')}</td>
                      <td>Rp {item.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Subtotal</strong></td>
                    <td><strong>Rp {selectedInvoice.subtotal.toLocaleString('id-ID')}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="3"><strong>Tax (10%)</strong></td>
                    <td><strong>Rp {selectedInvoice.tax.toLocaleString('id-ID')}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="3"><strong>Total Amount</strong></td>
                    <td><strong>Rp {selectedInvoice.total_amount.toLocaleString('id-ID')}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="invoice-workflow">
              <h4>Workflow Status</h4>
              <Steps current={getCurrentStep(selectedInvoice.status)}>
                <Step title="Created" description="Invoice created" />
                <Step title="Approved" description={selectedInvoice.approved_by ? `Approved by ${selectedInvoice.approved_by}` : 'Pending approval'} />
                <Step title="Paid" description={selectedInvoice.payment_date ? `Paid on ${selectedInvoice.payment_date}` : 'Pending payment'} />
              </Steps>
            </div>

            {selectedInvoice.payment_date && (
              <div className="payment-info">
                <h4>Payment Information</h4>
                <p><strong>Payment Date:</strong> {selectedInvoice.payment_date}</p>
                <p><strong>Payment Method:</strong> {selectedInvoice.payment_method}</p>
              </div>
            )}

            <div className="document-section">
              <h4>Documents</h4>
              <Space>
                <Upload>
                  <Button icon={<UploadOutlined />}>
                    Upload Supporting Document
                  </Button>
                </Upload>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
