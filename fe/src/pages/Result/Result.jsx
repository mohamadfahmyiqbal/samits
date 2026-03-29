import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Timeline,
  Statistic,
  Badge,
} from 'antd';
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SendOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [form] = Form.useForm();

  const { maintenance_code, equipment, completion_data } = location.state || {};

  const mockResultData = [
    {
      id: 1,
      result_code: 'RES-2024-001',
      maintenance_code: 'MT2-2024-001',
      equipment: 'Server HP ProLiant DL360',
      maintenance_type: 'Preventive Maintenance',
      technician: 'John Doe',
      completion_date: '2024-03-28',
      status: 'pending_approval',
      final_status: 'completed',
      completion_notes:
        'All maintenance tasks completed successfully. CPU temperature normalized, memory optimized, firmware updated.',
      issues_found: 'Minor dust accumulation cleaned',
      recommendations: 'Schedule next maintenance in 3 months',
      checklist_summary: {
        total: 5,
        completed: 5,
        failed: 0,
        skipped: 0,
      },
      parts_used: [
        { name: 'Cooling Fan', quantity: 1, cost: 500000 },
        { name: 'Thermal Paste', quantity: 1, cost: 150000 },
      ],
      labor_hours: 3.5,
      total_cost: 650000,
      submitted_by: 'John Doe',
      submitted_date: '2024-03-28',
    },
    {
      id: 2,
      result_code: 'RES-2024-002',
      maintenance_code: 'MT2-2024-002',
      equipment: 'Laptop Dell XPS 15',
      maintenance_type: 'Corrective Maintenance',
      technician: 'Jane Smith',
      completion_date: '2024-03-27',
      status: 'approved',
      final_status: 'completed',
      completion_notes: 'Display cable successfully replaced. All display tests passed.',
      issues_found: 'Loose display cable connector',
      recommendations: 'Handle with care, avoid sudden movements',
      checklist_summary: {
        total: 3,
        completed: 3,
        failed: 0,
        skipped: 0,
      },
      parts_used: [{ name: 'Display Cable', quantity: 1, cost: 350000 }],
      labor_hours: 2,
      total_cost: 350000,
      submitted_by: 'Jane Smith',
      submitted_date: '2024-03-27',
      approved_by: 'Manager IT',
      approved_date: '2024-03-27',
    },
  ];

  useEffect(() => {
    setResultData(mockResultData);

    // Add new result if coming from Maintenance2
    if (maintenance_code && completion_data) {
      const newResult = {
        id: Date.now(),
        result_code: `RES-2024-${String(mockResultData.length + 1).padStart(3, '0')}`,
        maintenance_code: maintenance_code,
        equipment: equipment,
        maintenance_type: 'Scheduled Maintenance',
        technician: 'Current User',
        completion_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        final_status: completion_data.final_status || 'completed',
        completion_notes: completion_data.completion_notes,
        issues_found: completion_data.issues_found || '',
        recommendations: '',
        checklist_summary: {
          total: 5,
          completed: 4,
          failed: 0,
          skipped: 1,
        },
        parts_used: [],
        labor_hours: 0,
        total_cost: 0,
        submitted_by: '',
        submitted_date: '',
      };

      setResultData((prev) => [newResult, ...prev]);
    }
  }, [maintenance_code, equipment, completion_data]);

  const handleViewDetail = (record) => {
    setSelectedResult(record);
    setDetailModalVisible(true);
  };

  const handleSubmitForApproval = (record) => {
    setSelectedResult(record);
    setSubmitModalVisible(true);
    form.resetFields();
  };

  const handleSubmitConfirm = async (values) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResultData((prev) =>
        prev.map((item) =>
          item.id === selectedResult.id
            ? {
                ...item,
                status: 'pending_approval',
                submitted_by: values.submitted_by,
                submitted_date: new Date().toISOString().split('T')[0],
                recommendations: values.recommendations,
              }
            : item
        )
      );

      message.success('Result berhasil diajukan untuk approval!');
      setSubmitModalVisible(false);

      // Navigate to Approval3 page
      navigate('/approval3', {
        state: {
          result_code: selectedResult.result_code,
          maintenance_code: selectedResult.maintenance_code,
          result_data: selectedResult,
        },
      });
    } catch (error) {
      message.error('Gagal mengajukan result');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (record) => {
    message.info('Download fitur akan segera tersedia');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending_approval':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'DRAFT';
      case 'pending_approval':
        return 'MENUNGGU APPROVAL';
      case 'approved':
        return 'DISETUJUI';
      case 'rejected':
        return 'DITOLAK';
      default:
        return status.toUpperCase();
    }
  };

  const columns = [
    {
      title: 'Kode Result',
      dataIndex: 'result_code',
      key: 'result_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Maintenance Ref',
      dataIndex: 'maintenance_code',
      key: 'maintenance_code',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Teknisi',
      dataIndex: 'technician',
      key: 'technician',
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'completion_date',
      key: 'completion_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={
            status === 'approved'
              ? 'success'
              : status === 'pending_approval'
                ? 'warning'
                : status === 'rejected'
                  ? 'error'
                  : 'default'
          }
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Final Status',
      dataIndex: 'final_status',
      key: 'final_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'partial' ? 'orange' : 'red'}>
          {status === 'completed' ? 'BERHASIL' : status === 'partial' ? 'PARTIAL' : 'GAGAL'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
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
          {record.status === 'draft' && (
            <Button
              type='primary'
              size='small'
              icon={<SendOutlined />}
              onClick={() => handleSubmitForApproval(record)}
            >
              Submit
            </Button>
          )}
          {record.status === 'approved' && (
            <>
              <Button
                size='small'
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(record)}
              >
                Download
              </Button>
              <Button
                type='default'
                size='small'
                icon={<ArrowRightOutlined />}
                onClick={() =>
                  navigate('/approval3', { state: { result_code: record.result_code } })
                }
              >
                Approval
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className='result'>
      <div className='page-header'>
        <h1>Maintenance Result</h1>
        <p>Hasil dan laporan maintenance activities</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title='Draft'
              value={resultData.filter((item) => item.status === 'draft').length}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Menunggu Approval'
              value={resultData.filter((item) => item.status === 'pending_approval').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Disetujui'
              value={resultData.filter((item) => item.status === 'approved').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Total' value={resultData.length} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card
        title='Daftar Maintenance Results'
        extra={
          <Button
            type='primary'
            icon={<FileSearchOutlined />}
            onClick={() => navigate('/maintenance2')}
          >
            Ke Maintenance2
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={resultData}
          rowKey='id'
          loading={loading}
          pagination={{
            total: resultData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title='Detail Maintenance Result'
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedResult(null);
        }}
        footer={[
          <Button key='print' icon={<PrinterOutlined />}>
            Print
          </Button>,
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={900}
      >
        {selectedResult && (
          <div className='result-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size='small' title='Informasi Result'>
                  <p>
                    <strong>Kode Result:</strong> {selectedResult.result_code}
                  </p>
                  <p>
                    <strong>Maintenance Ref:</strong> {selectedResult.maintenance_code}
                  </p>
                  <p>
                    <strong>Jenis:</strong> {selectedResult.maintenance_type}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Tag color={getStatusColor(selectedResult.status)} style={{ marginLeft: 8 }}>
                      {getStatusText(selectedResult.status)}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size='small' title='Equipment & Personel'>
                  <p>
                    <strong>Equipment:</strong> {selectedResult.equipment}
                  </p>
                  <p>
                    <strong>Teknisi:</strong> {selectedResult.technician}
                  </p>
                  <p>
                    <strong>Tanggal Selesai:</strong> {selectedResult.completion_date}
                  </p>
                  <p>
                    <strong>Final Status:</strong>
                    <Tag
                      color={selectedResult.final_status === 'completed' ? 'green' : 'orange'}
                      style={{ marginLeft: 8 }}
                    >
                      {selectedResult.final_status.toUpperCase()}
                    </Tag>
                  </p>
                </Card>
              </Col>
            </Row>

            <Card size='small' title='Ringkasan Checklist' style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic title='Total Items' value={selectedResult.checklist_summary.total} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title='Completed'
                    value={selectedResult.checklist_summary.completed}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title='Failed'
                    value={selectedResult.checklist_summary.failed}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title='Skipped'
                    value={selectedResult.checklist_summary.skipped}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>

            <Card size='small' title='Catatan Penyelesaian' style={{ marginTop: 16 }}>
              <p>{selectedResult.completion_notes}</p>
            </Card>

            {selectedResult.issues_found && (
              <Card size='small' title='Issues Ditemukan' style={{ marginTop: 16 }}>
                <p style={{ color: '#ff4d4f' }}>{selectedResult.issues_found}</p>
              </Card>
            )}

            {selectedResult.recommendations && (
              <Card size='small' title='Rekomendasi' style={{ marginTop: 16 }}>
                <p>{selectedResult.recommendations}</p>
              </Card>
            )}

            {selectedResult.parts_used.length > 0 && (
              <Card size='small' title='Parts Digunakan' style={{ marginTop: 16 }}>
                <Table
                  size='small'
                  dataSource={selectedResult.parts_used}
                  columns={[
                    { title: 'Nama Part', dataIndex: 'name' },
                    { title: 'Qty', dataIndex: 'quantity' },
                    {
                      title: 'Harga',
                      dataIndex: 'cost',
                      render: (cost) => `Rp ${cost.toLocaleString('id-ID')}`,
                    },
                    {
                      title: 'Total',
                      render: (_, record) =>
                        `Rp ${(record.cost * record.quantity).toLocaleString('id-ID')}`,
                    },
                  ]}
                  pagination={false}
                />
                <div style={{ textAlign: 'right', marginTop: 16, fontWeight: 'bold' }}>
                  Total Cost: Rp {selectedResult.total_cost.toLocaleString('id-ID')}
                </div>
              </Card>
            )}

            {selectedResult.approved_by && (
              <Card size='small' title='Approval Info' style={{ marginTop: 16 }}>
                <p>
                  <strong>Disetujui Oleh:</strong> {selectedResult.approved_by}
                </p>
                <p>
                  <strong>Tanggal Approval:</strong> {selectedResult.approved_date}
                </p>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Modal */}
      <Modal
        title='Submit Result untuk Approval'
        open={submitModalVisible}
        onCancel={() => {
          setSubmitModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedResult && (
          <Form form={form} layout='vertical' onFinish={handleSubmitConfirm}>
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <p>
                <strong>Result:</strong> {selectedResult.result_code}
              </p>
              <p>
                <strong>Equipment:</strong> {selectedResult.equipment}
              </p>
              <p>
                <strong>Teknisi:</strong> {selectedResult.technician}
              </p>
            </div>

            <Form.Item
              name='submitted_by'
              label='Diajukan Oleh'
              rules={[{ required: true, message: 'Masukkan nama pengaju!' }]}
            >
              <Input placeholder='Nama lengkap pengaju' />
            </Form.Item>

            <Form.Item name='recommendations' label='Rekomendasi'>
              <TextArea rows={3} placeholder='Rekomendasi untuk maintenance berikutnya...' />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setSubmitModalVisible(false)}>Batal</Button>
                <Button type='primary' htmlType='submit' loading={loading} icon={<SendOutlined />}>
                  Submit untuk Approval
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
