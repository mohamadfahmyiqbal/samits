import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Divider, Button, Space } from 'antd';
import { ClockCircleOutlined, UserOutlined, BarcodeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const TransactionModal = ({ visible, transaction, onClose }) => {
  if (!transaction) return null;

  const getTypeTag = (type) => {
    const config = {
      in: { color: 'green', label: 'Stock In' },
      out: { color: 'red', label: 'Stock Out' },
      adjustment: { color: 'orange', label: 'Adjustment' },
    };
    const info = config[type] || { color: 'default', label: type };
    return <Tag color={info.color}>{info.label}</Tag>;
  };

  const getStatusTag = (status) => {
    const config = {
      completed: { color: 'green', label: 'Selesai' },
      pending: { color: 'blue', label: 'Pending' },
      cancelled: { color: 'red', label: 'Dibatalkan' },
    };
    const info = config[status] || { color: 'default', label: status };
    return <Tag color={info.color}>{info.label}</Tag>;
  };

  return (
    <Modal
      title={
        <Space>
          <BarcodeOutlined />
          <span>Detail Transaksi #{transaction.id}</span>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Part Code">
          <strong>{transaction.part_code}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Part Name">
          {transaction.part_name}
        </Descriptions.Item>
        <Descriptions.Item label="Kategori">
          <Tag color="blue">{transaction.category}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tipe">
          {getTypeTag(transaction.type)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {getStatusTag(transaction.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Quantity">
          <strong style={{ color: transaction.type === 'out' ? '#ff4d4f' : '#52c41a' }}>
            {transaction.quantity} {transaction.unit}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Stock Sebelum">
          {transaction.stock_before} {transaction.unit}
        </Descriptions.Item>
        <Descriptions.Item label="Stock Sesudah">
          {transaction.stock_after} {transaction.unit}
        </Descriptions.Item>
        <Descriptions.Item label="Nilai Transaksi">
          Rp {Number(transaction.value || 0).toLocaleString('id-ID')}
        </Descriptions.Item>
        <Descriptions.Item label="Lokasi">
          Gudang {transaction.warehouse_id || 'Utama'}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Timeline</Divider>
      <Timeline>
        <Timeline.Item color="green" dot={<ClockCircleOutlined />}>
          <p>
            <strong>{format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}</strong>
          </p>
          <p>Transaksi dibuat oleh <Tag icon={<UserOutlined />}>{transaction.created_by_name}</Tag></p>
        </Timeline.Item>
        {transaction.approved_at && (
          <Timeline.Item color="blue">
            <p>
              <strong>{format(new Date(transaction.approved_at), 'dd MMM yyyy, HH:mm', { locale: id })}</strong>
            </p>
            <p>Diapprove oleh {transaction.approved_by_name}</p>
          </Timeline.Item>
        )}
        {transaction.executed_at && (
          <Timeline.Item color="green">
            <p>
              <strong>{format(new Date(transaction.executed_at), 'dd MMM yyyy, HH:mm', { locale: id })}</strong>
            </p>
            <p>Dieksekusi - Stok sudah berubah</p>
          </Timeline.Item>
        )}
      </Timeline>

      {transaction.notes && (
        <>
          <Divider orientation="left">Catatan</Divider>
          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
            <strong>{transaction.notes}</strong>
          </div>
        </>
      )}

      <Divider />
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>Tutup</Button>
        </Space>
      </div>
    </Modal>
  );
};

export default TransactionModal;

