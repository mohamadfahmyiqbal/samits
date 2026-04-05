import React from 'react';
import { Card, Button, Result, Timeline, Tag, Space, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  UserOutlined,
  CheckSquareOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RequestCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { request_data } = location.state || {};

  const requestInfo = {
    request_code: 'REQ-' + Date.now().toString().slice(-6),
    created_date: new Date().toLocaleDateString('id-ID'),
    status: 'pending_approval',
    asset_name: request_data?.asset_name || 'Laptop Dell XPS 15',
    request_type: 'Pengajuan Aset Baru',
    requested_by: 'Current User',
    department: request_data?.department || 'IT',
    estimated_cost: 'Rp 25,000,000',
    approvers: ['Manager IT', 'Finance Manager', 'Director'],
  };

  return (
    <div className='request-created'>
      <div className='page-header'>
        <h1>Pengajuan Berhasil Dibuat</h1>
        <p>Request pengajuan aset telah dibuat dan menunggu approval</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Result
          status='success'
          icon={<SendOutlined style={{ color: '#1890ff' }} />}
          title='Pengajuan Aset Berhasil Diajukan!'
          subTitle={`Kode Request: ${requestInfo.request_code}`}
          extra={[
            <Button
              type='primary'
              key='approval'
              icon={<ArrowRightOutlined />}
              onClick={() =>
                navigate('/approval-system', { state: { request_code: requestInfo.request_code } })
              }
            >
              Lihat Status Approval
            </Button>,
            <Button key='dashboard' icon={<HomeOutlined />} onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>,
            <Button key='print' icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print
            </Button>,
          ]}
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title='Detail Request' style={{ marginBottom: 24 }}>
            <div className='request-details'>
              <div className='detail-row'>
                <span className='label'>Kode Request:</span>
                <span className='value'>
                  <strong>{requestInfo.request_code}</strong>
                </span>
              </div>
              <div className='detail-row'>
                <span className='label'>Tanggal Dibuat:</span>
                <span className='value'>{requestInfo.created_date}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Status:</span>
                <span className='value'>
                  <Tag color='orange' icon={<CheckSquareOutlined />}>
                    PENDING APPROVAL
                  </Tag>
                </span>
              </div>
              <div className='detail-row'>
                <span className='label'>Jenis Request:</span>
                <span className='value'>{requestInfo.request_type}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Nama Aset:</span>
                <span className='value'>{requestInfo.asset_name}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Departemen:</span>
                <span className='value'>
                  <Tag color='blue'>{requestInfo.department}</Tag>
                </span>
              </div>
              <div className='detail-row'>
                <span className='label'>Estimasi Biaya:</span>
                <span className='value'>
                  <strong>{requestInfo.estimated_cost}</strong>
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title='Alur Approval' style={{ marginBottom: 24 }}>
            <Timeline
              items={requestInfo.approvers.map((approver, index) => ({
                color: index === 0 ? 'blue' : 'gray',
                dot: index === 0 ? <SendOutlined /> : <UserOutlined />,
                children: (
                  <div>
                    <strong>Level {index + 1}:</strong> {approver}
                    {index === 0 && (
                      <Tag color='blue' style={{ marginLeft: 8 }}>
                        Waiting
                      </Tag>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Card title='Timeline Request'>
        <Timeline
          items={[
            {
              color: 'green',
              dot: <FileTextOutlined />,
              children: (
                <div>
                  <strong>Form Pengajuan Dibuat</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>{requestInfo.created_date}</div>
                  <p>Form pengajuan aset {requestInfo.asset_name} telah dibuat</p>
                </div>
              ),
            },
            {
              color: 'green',
              dot: <SendOutlined />,
              children: (
                <div>
                  <strong>Request Diajukan</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>{requestInfo.created_date}</div>
                  <p>Request {requestInfo.request_code} telah diajukan untuk approval</p>
                </div>
              ),
            },
            {
              color: 'blue',
              dot: <CheckCircleOutlined />,
              children: (
                <div>
                  <strong>Menunggu Approval</strong>
                  <p>Sedang menunggu approval dari {requestInfo.approvers[0]}</p>
                </div>
              ),
            },
            {
              color: 'gray',
              children: (
                <div>
                  <strong>Approval Lanjutan</strong>
                  <p>Menunggu approval dari level selanjutnya</p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
