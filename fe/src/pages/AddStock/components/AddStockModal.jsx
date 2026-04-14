import React from 'react';
import { Modal, Form, Row, Col, Input, Space, Button, InputNumber, Select } from 'antd';

const { Option } = Select;

const AddStockModal = ({ visible, loading, form, categories = [], onSubmit, onCancel }) => (
  <Modal title='Tambah Stok' open={visible} footer={null} width={720} onCancel={onCancel}>
    <Form form={form} layout='vertical' onFinish={onSubmit}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name='category'
            label='Kategori'
            rules={[{ required: true, message: 'Kategori harus dipilih' }]}
          >
            <Select placeholder='Pilih kategori' showSearch optionFilterProp='children'>
              {categories.map((category) => (
                <Option key={category.category_code} value={category.category_code}>
                  {category.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name='part_code'
            label='Kode Part'
            rules={[{ required: true, message: 'Kode part harus diisi' }]}
          >
            <Input placeholder='Contoh: CPU-001' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name='part_name'
            label='Nama Part'
            rules={[{ required: true, message: 'Nama part harus diisi' }]}
          >
            <Input placeholder='Masukkan nama part' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='stock_id' hidden>
        <Input />
      </Form.Item>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Form.Item
            name='current_stock'
            label='Stok Aktual'
            rules={[{ required: true, message: 'Stok aktual harus diisi' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name='minimum_stock'
            label='Stok Minimum'
            rules={[{ required: true, message: 'Stok minimum harus diisi' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name='unit'
            label='Satuan'
            rules={[{ required: true, message: 'Satuan harus dipilih' }]}
          >
            <Select>
              <Option value='pasang'>pasang</Option>
              <Option value='pcs'>pcs</Option>
              <Option value='roll'>roll</Option>
              <Option value='unit'>unit</Option>
              <Option value='set'>set</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name='status'
            label='Status'
            rules={[{ required: true, message: 'Status harus dipilih' }]}
          >
            <Select>
              <Option value='normal'>Normal</Option>
              <Option value='low'>Rendah</Option>
              <Option value='critical'>Kritis</Option>
              <Option value='overstock'>Terlalu Banyak</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='purchase_period'
            label='Periode Pembelian'
            rules={[{ required: true, message: 'Periode pembelian harus dipilih' }]}
          >
            <Select defaultValue='monthly'>
              <Option value='monthly'>Bulanan</Option>
              <Option value='yearly'>Tahunan</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name='add_quantity'
            label='Jumlah'
            rules={[
              { required: true, message: 'Masukkan jumlah' },
              { type: 'number', min: 1, message: 'Jumlah harus lebih dari 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='notes' label='Catatan (opsional)'>
            <Input.TextArea rows={3} placeholder='Catatan tambahan untuk stok baru...' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type='primary' htmlType='submit' loading={loading}>
            Simpan
          </Button>
          <Button onClick={onCancel}>Batal</Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);

export default AddStockModal;
