import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Modal, Form, Alert } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ToolOutlined, 
  UserOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './DashboardUser.css';

export default function DashboardUser() {
  const [abnormalReports, setAbnormalReports] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [showAbnormalModal, setShowAbnormalModal] = useState(false);
  const [showSelfAnalysisModal, setShowSelfAnalysisModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockAbnormalReports = [
    {
      id: 1,
      asset_name: 'Laptop Dell XPS 15',
      issue: 'Laptop tidak bisa booting',
      severity: 'high',
      reported_date: '2024-03-25',
      status: 'pending'
    },
    {
      id: 2,
      asset_name: 'Monitor LG 27 inch',
      issue: 'Layar berkedip',
      severity: 'medium',
      reported_date: '2024-03-24',
      status: 'in_progress'
    }
  ];

  const mockJobRequests = [
    {
      id: 1,
      title: 'Perbaikan Laptop Dell XPS 15',
      asset_name: 'Laptop Dell XPS 15',
      status: 'open',
      created_date: '2024-03-25',
      priority: 'high'
    }
  ];

  useEffect(() => {
    setAbnormalReports(mockAbnormalReports);
    setJobRequests(mockJobRequests);
  }, []);

  const handleCreateAbnormalReport = () => {
    setShowAbnormalModal(true);
  };

  const handleSelfAnalysis = (report) => {
    setSelectedReport(report);
    setShowSelfAnalysisModal(true);
  };

  const handleSubmitAbnormalReport = async (values) => {
    setLoading(true);
    // API call to create abnormal report
    console.log('Creating abnormal report:', values);
    setLoading(false);
    setShowAbnormalModal(false);
  };

  const handleSubmitSelfAnalysis = async (values) => {
    setLoading(true);
    // API call to submit self analysis
    console.log('Submitting self analysis:', values);
    
    if (values.resolution === 'solved') {
      // Mark as solved
      console.log('Issue marked as solved');
    } else {
      // Create ticket
      console.log('Ticket created');
    }
    
    setLoading(false);
    setShowSelfAnalysisModal(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'open': return 'red';
      default: return 'default';
    }
  };

  return (
    <div className="dashboard-user">
      <div className="dashboard-header">
        <h1>Dashboard Pengguna</h1>
        <p>Kelola aset dan laporan ketidaknormalan Anda</p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col span={24}>
          <Card title="Aksi Cepat" className="quick-actions-card">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Button 
                  type="primary" 
                  icon={<ExclamationCircleOutlined />}
                  size="large"
                  block
                  onClick={handleCreateAbnormalReport}
                >
                  Laporkan Ketidaknormalan
                </Button>
              </Col>
              <Col span={6}>
                <Button 
                  icon={<ToolOutlined />}
                  size="large"
                  block
                >
                  Request Pemeliharaan
                </Button>
              </Col>
              <Col span={6}>
                <Button 
                  icon={<UserOutlined />}
                  size="large"
                  block
                >
                  Pengajuan Aset
                </Button>
              </Col>
              <Col span={6}>
                <Button 
                  icon={<FileSearchOutlined />}
                  size="large"
                  block
                >
                  Lihat Aset Saya
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Abnormal Reports */}
        <Col span={12}>
          <Card 
            title="Laporan Ketidaknormalan" 
            extra={
              <Button type="primary" onClick={handleCreateAbnormalReport}>
                + Tambah Laporan
              </Button>
            }
          >
            <div className="reports-list">
              {abnormalReports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-header">
                    <h4>{report.asset_name}</h4>
                    <div className="report-badges">
                      <Badge color={getSeverityColor(report.severity)} text={report.severity} />
                      <Badge color={getStatusColor(report.status)} text={report.status} />
                    </div>
                  </div>
                  <p>{report.issue}</p>
                  <div className="report-actions">
                    <Button 
                      size="small" 
                      icon={<FileSearchOutlined />}
                      onClick={() => handleSelfAnalysis(report)}
                    >
                      Self Analysis
                    </Button>
                    <Button size="small" icon={<ToolOutlined />}>
                      Request Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Job Requests */}
        <Col span={12}>
          <Card title="Permintaan Pekerjaan">
            <div className="job-requests-list">
              {jobRequests.map(request => (
                <div key={request.id} className="job-request-item">
                  <div className="job-header">
                    <h4>{request.title}</h4>
                    <div className="job-badges">
                      <Badge color={getSeverityColor(request.priority)} text={request.priority} />
                      <Badge color={getStatusColor(request.status)} text={request.status} />
                    </div>
                  </div>
                  <p>Aset: {request.asset_name}</p>
                  <p>Dibuat: {request.created_date}</p>
                  <div className="job-status">
                    {request.status === 'open' && <ClockCircleOutlined />}
                    {request.status === 'in_progress' && <ToolOutlined />}
                    {request.status === 'completed' && <CheckCircleOutlined />}
                    <span className="status-text">{request.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Abnormal Report Modal */}
      <Modal
        title="Laporan Ketidaknormalan"
        open={showAbnormalModal}
        onCancel={() => setShowAbnormalModal(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmitAbnormalReport}
        >
          <Form.Item
            name="asset_id"
            label="Aset"
            rules={[{ required: true, message: 'Pilih aset yang bermasalah!' }]}
          >
            <select className="ant-input">
              <option value="">Pilih Aset</option>
              <option value="1">Laptop Dell XPS 15</option>
              <option value="2">Monitor LG 27 inch</option>
            </select>
          </Form.Item>

          <Form.Item
            name="issue"
            label="Deskripsi Masalah"
            rules={[{ required: true, message: 'Deskripsikan masalah yang terjadi!' }]}
          >
            <textarea rows={4} placeholder="Jelaskan masalah yang terjadi pada aset..." />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Tingkat Keparahan"
            rules={[{ required: true, message: 'Pilih tingkat keparahan!' }]}
          >
            <select className="ant-input">
              <option value="">Pilih Keparahan</option>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Kirim Laporan
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Self Analysis Modal */}
      <Modal
        title="Self Analysis"
        open={showSelfAnalysisModal}
        onCancel={() => setShowSelfAnalysisModal(false)}
        footer={null}
        width={600}
      >
        {selectedReport && (
          <div>
            <Alert
              message="Analisis Mandiri"
              description={`Aset: ${selectedReport.asset_name} - ${selectedReport.issue}`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form
              layout="vertical"
              onFinish={handleSubmitSelfAnalysis}
            >
              <Form.Item
                name="analysis_steps"
                label="Langkah-langkah yang sudah dilakukan"
              >
                <textarea rows={3} placeholder="Deskripsikan langkah troubleshooting yang sudah dicoba..." />
              </Form.Item>

              <Form.Item
                name="findings"
                label="Temuan"
              >
                <textarea rows={3} placeholder="Apa yang ditemukan saat analisis..." />
              </Form.Item>

              <Form.Item
                name="resolution"
                label="Hasil Resolusi"
                rules={[{ required: true, message: 'Pilih hasil resolusi!' }]}
              >
                <select className="ant-input">
                  <option value="">Pilih Hasil</option>
                  <option value="solved">Masalah Teratasi</option>
                  <option value="not_solved">Masalah Belum Teratasi</option>
                </select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Catatan Tambahan"
              >
                <textarea rows={2} placeholder="Catatan tambahan jika diperlukan..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Submit Analysis
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
