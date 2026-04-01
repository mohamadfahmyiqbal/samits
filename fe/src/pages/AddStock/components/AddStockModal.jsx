import React from 'react';
import { Modal, Form, Row, Col, Input, Space, Button, InputNumber, Select } from 'antd';

const { Option } = Select;

const AddStockModal = ({ visible, loading, form, categories = [], onSubmit, onCancel }) => (
  <Modal title='Add Stock' open={visible} footer={null} width={720} onCancel={onCancel}>
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
            label='Part Code'
            rules={[{ required: true, message: 'Part code harus diisi' }]}
          >
            <Input placeholder='Contoh: CPU-001' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name='part_name'
            label='Part Name'
            rules={[{ required: true, message: 'Part name harus diisi' }]}
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
            label='Actual Stock'
            rules={[{ required: true, message: 'Actual stock harus diisi' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name='minimum_stock'
            label='Minimum Stock'
            rules={[{ required: true, message: 'Minimum stock harus diisi' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name='unit'
            label='Unit'
            rules={[{ required: true, message: 'Unit harus dipilih' }]}
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
              <Option value='low'>Low</Option>
              <Option value='critical'>Critical</Option>
              <Option value='overstock'>Overstock</Option>
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
              <Option value='monthly'>Monthly</Option>
              <Option value='yearly'>Yearly</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name='add_quantity'
            label='Quantity'
            rules={[
              { required: true, message: 'Masukkan quantity' },
              { type: 'number', min: 1, message: 'Quantity harus lebih dari 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='notes' label='Catatan (opsional)'>
            <Input.TextArea rows={3} placeholder='Catatan khusus untuk penambahan stok...' />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type='primary' htmlType='submit' loading={loading}>
            Simpan Stok
          </Button>
          <Button onClick={onCancel}>Batal</Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);

export default AddStockModal;
