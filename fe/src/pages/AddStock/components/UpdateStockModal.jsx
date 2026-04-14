import React from 'react';
import { Modal, Form, Row, Col, Input, Space, Button, InputNumber, Select } from 'antd';

const { Option } = Select;

const UpdateStockModal = ({ visible, loading, form, record, onSubmit, onCancel }) => (
  <Modal
    title={record ? `Perbarui Stok · ${record.part_name}` : 'Perbarui Stok'}
    open={visible}
    footer={null}
    width={700}
    onCancel={onCancel}
  >
    <Form form={form} layout='vertical' onFinish={onSubmit}>
      <Form.Item name='stock_id' hidden>
        <Input />
      </Form.Item>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label='Kode Part'>
            <Input value={record?.part_code || ''} disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label='Nama Part'>
            <Input value={record?.part_name || ''} disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label='Stok Saat Ini'>
            <InputNumber value={record?.current_stock ?? 0} style={{ width: '100%' }} disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label='Satuan'>
            <Input value={record?.unit || '-'} disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name='transaction_type'
            label='Tipe Transaksi'
            rules={[{ required: true, message: 'Pilih tipe transaksi' }]}
          >
            <Select defaultValue='in'>
              <Option value='in'>Tambah Stok</Option>
              <Option value='out'>Kurangi Stok</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='quantity'
            label='Jumlah'
            rules={[
              { required: true, message: 'Masukkan jumlah' },
              { type: 'number', min: 1, message: 'Jumlah minimal 1' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='notes' label='Catatan (opsional)'>
        <Input.TextArea rows={3} placeholder='Catatan tambahan untuk perubahan stok...' />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type='primary' htmlType='submit' loading={loading}>
            Simpan Perubahan
          </Button>
          <Button onClick={onCancel}>Batal</Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);

export default UpdateStockModal;
