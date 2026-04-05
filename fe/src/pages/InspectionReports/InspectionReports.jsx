import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Input, Select, message, Badge } from 'antd';
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function InspectionReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [reportData, setReportData] = useState([]);

  const mockReportData = [
    {
      id: 1,
      report_code: 'INS-2024-001',
      report_type: 'Routine Inspection',
      equipment: 'Server HP ProLiant',
      location: 'Data Center',
      inspector: 'Tech John',
      inspection_date: '2024-03-28',
      status: 'passed',
      findings: 'All systems normal',
      recommendations: 'Continue regular monitoring',
      next_inspection: '2024-06-28',
      attachments: ['inspection_photo_1.jpg', 'report.pdf'],
    },
    {
      id: 2,
      report_code: 'INS-2024-002',
      report_type: 'Safety Inspection',
      equipment: 'Fire Suppression System',
      location: 'Server Room',
      inspector: 'Safety Officer',
      inspection_date: '2024-03-25',
      status: 'minor_issues',
      findings: 'One sensor needs calibration',
      recommendations: 'Schedule calibration within 2 weeks',
      next_inspection: '2024-04-25',
      attachments: ['inspection_report.pdf'],
    },
    {
      id: 3,
      report_code: 'INS-2024-003',
      report_type: 'Compliance Audit',
      equipment: 'UPS Systems',
      location: 'Data Center',
      inspector: 'External Auditor',
      inspection_date: '2024-03-20',
      status: 'failed',
      findings: 'Battery backup below 80% capacity',
      recommendations: 'Replace battery units immediately',
      next_inspection: '2024-04-20',
      attachments: ['audit_report.pdf', 'battery_test.xlsx'],
    },
  ];

  useEffect(() => {
    setReportData(mockReportData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'green';
      case 'minor_issues':
        return 'orange';
      case 'failed':
        return 'red';
      case 'pending':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed':
        return 'PASSED';
      case 'minor_issues':
        return 'MINOR ISSUES';
      case 'failed':
        return 'FAILED';
      case 'pending':
        return 'PENDING';
      default:
        return status.toUpperCase();
    }
  };

  const filteredReports = reportData.filter(
    (report) =>
      report.report_code.toLowerCase().includes(searchText.toLowerCase()) ||
      report.equipment.toLowerCase().includes(searchText.toLowerCase()) ||
      report.inspector.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Kode Report',
      dataIndex: 'report_code',
      key: 'report_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tipe',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Inspector',
      dataIndex: 'inspector',
      key: 'inspector',
    },
    {
      title: 'Tanggal',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={
            status === 'passed'
              ? 'success'
              : status === 'minor_issues'
                ? 'warning'
                : status === 'failed'
                  ? 'error'
                  : 'default'
          }
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Next Inspection',
      dataIndex: 'next_inspection',
      key: 'next_inspection',
      render: (date) => <Tag color='purple'>{date}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='primary' size='small' icon={<EyeOutlined />}>
            View
          </Button>
          <Button size='small' icon={<DownloadOutlined />}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='inspection-reports'>
      <div className='page-header'>
        <h1>Inspection Reports</h1>
        <p>Laporan inspeksi dan audit equipment</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#52c41a' }}>
                {reportData.filter((r) => r.status === 'passed').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Passed</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#faad14' }}>
                {reportData.filter((r) => r.status === 'minor_issues').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Minor Issues</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#ff4d4f' }}>
                {reportData.filter((r) => r.status === 'failed').length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Failed</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileSearchOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                {reportData.length}
              </h3>
              <p style={{ color: '#8c8c8c', margin: 0 }}>Total Reports</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder='Cari report (kode, equipment, inspector...)'
              prefix={<FileSearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} placeholder='Filter Status' defaultValue='all'>
              <Option value='all'>Semua Status</Option>
              <Option value='passed'>Passed</Option>
              <Option value='minor_issues'>Minor Issues</Option>
              <Option value='failed'>Failed</Option>
            </Select>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type='primary' icon={<PlusOutlined />}>
              New Inspection
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredReports}
          rowKey='id'
          loading={loading}
          pagination={{
            total: filteredReports.length,
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
}
