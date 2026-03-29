// fe/src/pages/MaintenanceSchedule/components/modals/DetailModal.jsx
import React from 'react';
import { Modal, Button, Row, Col, Timeline } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import StatusTag from '../StatusTag';
import PriorityTag from '../PriorityTag';

export default function DetailModal({ visible, onClose, selectedSchedule, timelineItems }) {
  return (
    <Modal
      title='Detail Maintenance Schedule'
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='print' icon={<PrinterOutlined />}>
          Print
        </Button>,
        <Button key='close' onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {selectedSchedule && (
        <div className='schedule-detail'>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className='detail-section'>
                <h4>Informasi Schedule</h4>
                <p>
                  <strong>Kode:</strong> {selectedSchedule.schedule_code}
                </p>
                <p>
                  <strong>Kategori:</strong> {selectedSchedule.category}
                </p>
                <p>
                  <strong>Subkategori:</strong> {selectedSchedule.subcategory}
                </p>
                <p>
                  <strong>Status:</strong> <StatusTag status={selectedSchedule.status} />
                </p>
                <p>
                  <strong>Priority:</strong> <PriorityTag priority={selectedSchedule.priority} />
                </p>
              </div>
            </Col>
            <Col span={12}>
              <div className='detail-section'>
                <h4>Detail Waktu & Lokasi</h4>
                <p>
                  <strong>Tanggal:</strong> {selectedSchedule.date}
                </p>
                <p>
                  <strong>Waktu:</strong> {selectedSchedule.start_time} -{' '}
                  {selectedSchedule.end_time}
                </p>
                <p>
                  <strong>Lokasi:</strong> {selectedSchedule.location}
                </p>
                <p>
                  <strong>Equipment:</strong> {selectedSchedule.equipment}
                </p>
                <p>
                  <strong>Tim:</strong> {selectedSchedule.team}
                </p>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className='detail-section'>
                <h4>Catatan</h4>
                <p>{selectedSchedule.notes}</p>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className='detail-section'>
                <h4>Timeline</h4>
                <Timeline items={timelineItems} />
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
}
