import React from 'react';
import { Card, Button, Result, Timeline, Tag, Space } from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ToolOutlined,
  ArrowRightOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TicketCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { report_data, analysis_data } = location.state || {};

  const ticketInfo = {
    ticket_code: 'TICK-' + Date.now().toString().slice(-6),
    created_date: new Date().toLocaleDateString('id-ID'),
    status: 'open',
    priority: report_data?.severity || 'medium',
    asset_name: report_data?.asset_name || 'Laptop Dell XPS 15',
    issue: report_data?.issue || 'Laptop tidak bisa booting',
    reported_by: 'Current User',
    assigned_team: 'IT Support Team',
    estimated_resolution: '2-3 hari kerja',
  };

  return (
    <div className='ticket-created'>
      <div className='page-header'>
        <h1>Ticket Berhasil Dibuat</h1>
        <p>Self analysis menunjukkan masalah belum teratasi, ticket support telah dibuat</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Result
          status='success'
          icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
          title='Ticket Support Telah Dibuat!'
          subTitle={`Kode Ticket: ${ticketInfo.ticket_code}`}
          extra={[
            <Button
              type='primary'
              key='jobrequest'
              icon={<ArrowRightOutlined />}
              onClick={() =>
                navigate('/jobrequest2', { state: { ticket_code: ticketInfo.ticket_code } })
              }
            >
              Lanjut ke Job Request
            </Button>,
            <Button
              key='dashboard'
              icon={<HomeOutlined />}
              onClick={() => navigate('/dashboard-user')}
            >
              Kembali ke Dashboard
            </Button>,
          ]}
        />
      </Card>

      <Card title='Detail Ticket' style={{ marginBottom: 24 }}>
        <div className='ticket-details'>
          <div className='detail-row'>
            <span className='label'>Kode Ticket:</span>
            <span className='value'>
              <strong>{ticketInfo.ticket_code}</strong>
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Tanggal Dibuat:</span>
            <span className='value'>{ticketInfo.created_date}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Status:</span>
            <span className='value'>
              <Tag color='blue'>{ticketInfo.status.toUpperCase()}</Tag>
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Prioritas:</span>
            <span className='value'>
              <Tag
                color={
                  ticketInfo.priority === 'high'
                    ? 'red'
                    : ticketInfo.priority === 'medium'
                      ? 'orange'
                      : 'green'
                }
              >
                {ticketInfo.priority.toUpperCase()}
              </Tag>
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Aset:</span>
            <span className='value'>{ticketInfo.asset_name}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Issue:</span>
            <span className='value'>{ticketInfo.issue}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Dilaporkan Oleh:</span>
            <span className='value'>
              <UserOutlined /> {ticketInfo.reported_by}
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Ditugaskan ke:</span>
            <span className='value'>
              <ToolOutlined /> {ticketInfo.assigned_team}
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Estimasi Penyelesaian:</span>
            <span className='value'>{ticketInfo.estimated_resolution}</span>
          </div>
        </div>
      </Card>

      <Card title='Timeline Ticket'>
        <Timeline
          items={[
            {
              color: 'green',
              dot: <CheckCircleOutlined />,
              children: (
                <div>
                  <strong>Abnormal Report Dibuat</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>{ticketInfo.created_date}</div>
                  <p>Laporan ketidaknormalan dibuat untuk {ticketInfo.asset_name}</p>
                </div>
              ),
            },
            {
              color: 'green',
              dot: <CheckCircleOutlined />,
              children: (
                <div>
                  <strong>Self Analysis Dilakukan</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>{ticketInfo.created_date}</div>
                  <p>Analisis mandiri menunjukkan masalah belum teratasi</p>
                </div>
              ),
            },
            {
              color: 'blue',
              dot: <FileTextOutlined />,
              children: (
                <div>
                  <strong>Ticket Dibuat</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>{ticketInfo.created_date}</div>
                  <p>
                    Ticket support {ticketInfo.ticket_code} telah dibuat dan ditugaskan ke{' '}
                    {ticketInfo.assigned_team}
                  </p>
                </div>
              ),
            },
            {
              color: 'gray',
              children: (
                <div>
                  <strong>Menunggu Penanganan</strong>
                  <p>
                    Tim support akan menangani ticket ini dalam waktu{' '}
                    {ticketInfo.estimated_resolution}
                  </p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
