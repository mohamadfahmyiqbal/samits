import React from 'react';
import { Card, Button, Result, Timeline, Tag, Space } from 'antd';
import {
  CheckCircleOutlined,
  SmileOutlined,
  ToolOutlined,
  FileSearchOutlined,
  HomeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Finish() {
  const navigate = useNavigate();
  const location = useLocation();
  const { report_data, analysis_data } = location.state || {};

  const finishInfo = {
    resolution_date: new Date().toLocaleDateString('id-ID'),
    asset_name: report_data?.asset_name || 'Laptop Dell XPS 15',
    issue: report_data?.issue || 'Laptop tidak bisa booting',
    resolution: analysis_data?.resolution || 'solved',
    solution_steps: analysis_data?.analysis_steps || 'Restart dan update driver',
    resolved_by: 'Current User',
  };

  return (
    <div className='finish'>
      <div className='page-header'>
        <h1>Masalah Teratasi</h1>
        <p>Self analysis berhasil, masalah telah diselesaikan</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Result
          status='success'
          icon={<SmileOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
          title='Selamat! Masalah Berhasil Teratasi!'
          subTitle='Self analysis menunjukkan masalah telah berhasil diselesaikan tanpa perlu intervensi tim support'
          extra={[
            <Button
              type='primary'
              key='dashboard'
              icon={<HomeOutlined />}
              onClick={() => navigate('/dashboard-user')}
            >
              Kembali ke Dashboard
            </Button>,
          ]}
        />
      </Card>

      <Card title='Ringkasan Penyelesaian' style={{ marginBottom: 24 }}>
        <div className='finish-details'>
          <div className='detail-row'>
            <span className='label'>Status:</span>
            <span className='value'>
              <Tag color='green' icon={<CheckCircleOutlined />}>
                SOLVED
              </Tag>
            </span>
          </div>
          <div className='detail-row'>
            <span className='label'>Tanggal Penyelesaian:</span>
            <span className='value'>{finishInfo.resolution_date}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Aset:</span>
            <span className='value'>{finishInfo.asset_name}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Issue:</span>
            <span className='value'>{finishInfo.issue}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Solusi:</span>
            <span className='value'>{finishInfo.solution_steps}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Diselesaikan Oleh:</span>
            <span className='value'>
              <StarOutlined /> {finishInfo.resolved_by}
            </span>
          </div>
        </div>
      </Card>

      <Card title='Timeline Resolusi'>
        <Timeline
          items={[
            {
              color: 'green',
              dot: <FileSearchOutlined />,
              children: (
                <div>
                  <strong>Abnormal Report Dibuat</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {finishInfo.resolution_date}
                  </div>
                  <p>Laporan ketidaknormalan dibuat untuk {finishInfo.asset_name}</p>
                </div>
              ),
            },
            {
              color: 'green',
              dot: <ToolOutlined />,
              children: (
                <div>
                  <strong>Self Analysis & Troubleshooting</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {finishInfo.resolution_date}
                  </div>
                  <p>Analisis mandiri dan troubleshooting dilakukan</p>
                </div>
              ),
            },
            {
              color: 'green',
              dot: <CheckCircleOutlined />,
              children: (
                <div>
                  <strong>Masalah Teratasi!</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {finishInfo.resolution_date}
                  </div>
                  <p>Masalah berhasil diselesaikan: {finishInfo.solution_steps}</p>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Card style={{ marginTop: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <h4 style={{ color: '#52c41a' }}>
          <StarOutlined /> Apresiasi!
        </h4>
        <p>
          Terima kasih telah melakukan self analysis dengan baik. Masalah berhasil diselesaikan
          tanpa perlu mengganggu tim support, sehingga mereka dapat fokus pada isu yang lebih
          kompleks.
        </p>
      </Card>
    </div>
  );
}
