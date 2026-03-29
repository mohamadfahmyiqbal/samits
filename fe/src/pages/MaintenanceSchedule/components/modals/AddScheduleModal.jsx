// fe/src/pages/MaintenanceSchedule/components/modals/AddScheduleModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Table,
  Tag,
} from 'antd';

const { Option } = Select;

export default function AddScheduleModal({
  visible,
  onCancel,
  onSubmit,
  form,
  maintenanceTeam,
  teamLoading,
  mainTypes,
  categories,
  subCategories,
  itItems,
  itItemsLoading,
  selectedMainType,
  selectedCategory,
  selectedSubCategory,
  categoriesLoading,
  onMainTypeChange,
  onCategoryChange,
  onSubCategoryChange,
}) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Table columns for IT items
  const itItemColumns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      render: (text) => <strong>{text || '-'}</strong>,
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      render: (text) => text || '-',
    },
    {
      title: 'Item Name',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'default'}>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
    },
  ];

  // Row selection config
  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      const hostnames = selectedRows.map(
        (item) => item.asset_tag || item.hostname || item.item_name
      );
      form.setFieldsValue({
        hostname: hostnames.length > 0 ? hostnames : undefined,
      });
    },
  };
  return (
    <Modal
      title='Tambah Jadwal Maintenance'
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          Batal
        </Button>,
        <Button
          key='submit'
          type='primary'
          onClick={() => {
            const formValues = form.getFieldsValue();
            onSubmit(formValues);
          }}
        >
          Simpan Jadwal
        </Button>,
      ]}
      width={1000}
    >
      <Form form={form} layout='vertical'>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h4>Form Pembuatan Jadwal Maintenance</h4>
            <p>Silakan lengkapi data berikut untuk membuat jadwal maintenance baru:</p>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name='recurrence' label='Pengulangan' rules={[{ required: false }]}>
              <Select placeholder='Pilih pengulangan (opsional)' allowClear>
                <Option value='none'>Tidak Ada</Option>
                <Option value='daily'>Harian</Option>
                <Option value='weekly'>Mingguan</Option>
                <Option value='monthly'>Bulanan</Option>
                <Option value='yearly'>Tahunan</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='recurrence_interval'
              label='Interval Pengulangan'
              rules={[{ required: false }]}
            >
              <Input
                type='number'
                min={1}
                max={365}
                placeholder='Contoh: 2 (setiap 2 hari/minggu/bulan/tahun)'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='start_date'
              label='Tanggal Mulai'
              rules={[{ required: true, message: 'Tanggal mulai wajib diisi!' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal mulai' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='end_date'
              label='Tanggal Selesai'
              rules={[{ required: true, message: 'Tanggal selesai wajib diisi!' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal selesai' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='start_time'
              label='Waktu Mulai'
              rules={[{ required: true, message: 'Waktu mulai wajib diisi!' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format='HH:mm'
                placeholder='Pilih waktu mulai'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='end_time'
              label='Waktu Selesai'
              rules={[{ required: true, message: 'Waktu selesai wajib diisi!' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format='HH:mm'
                placeholder='Pilih waktu selesai'
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='team'
              label='Tim Assignment'
              rules={[{ required: true, message: 'Tim wajib diisi!' }]}
            >
              <Select
                mode='multiple'
                placeholder='Pilih tim maintenance'
                loading={teamLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {maintenanceTeam.map((member) => (
                  <Option key={member.nik} value={member.display_name}>
                    {member.display_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='estimated_duration'
              label='Estimasi Durasi (jam)'
              rules={[{ required: true, message: 'Durasi wajib diisi!' }]}
            >
              <Input
                type='number'
                min={0.5}
                max={168}
                step={0.5}
                placeholder='Masukkan estimasi durasi'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='recurrence_end_date'
              label='Tanggal Akhir Pengulangan'
              rules={[{ required: false }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal akhir (opsional)' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='recurrence_count'
              label='Jumlah Pengulangan'
              rules={[{ required: false }]}
            >
              <Input
                type='number'
                min={1}
                max={1000}
                placeholder='Contoh: 10 (ulangi 10 kali)'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='priority'
              label='Prioritas'
              rules={[{ required: true, message: 'Prioritas wajib diisi!' }]}
            >
              <Select placeholder='Pilih prioritas'>
                <Option value='low'>Low</Option>
                <Option value='medium'>Medium</Option>
                <Option value='high'>High</Option>
                <Option value='critical'>Critical</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name='notes' label='Catatan'>
              <Input.TextArea
                rows={3}
                placeholder='Masukkan catatan tambahan'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Main Type, Kategori, Subkategori, Hostname - dipindahkan ke paling akhir */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='asset_main_type_id'
              label='Main Type'
              rules={[{ required: true, message: 'Main Type wajib diisi!' }]}
            >
              <Select
                placeholder='Pilih Main Type'
                onChange={onMainTypeChange}
                loading={categoriesLoading}
              >
                {mainTypes.map((type) => (
                  <Option key={type.asset_main_type_id} value={type.asset_main_type_id}>
                    {type.main_type_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='category_id'
              label='Kategori Maintenance'
              rules={[{ required: true, message: 'Kategori wajib diisi!' }]}
            >
              <Select
                placeholder='Pilih kategori'
                onChange={onCategoryChange}
                disabled={!selectedMainType || categoriesLoading}
                loading={categoriesLoading}
              >
                {categories.map((category) => (
                  <Option key={category.category_id} value={category.category_id}>
                    {category.category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='sub_category_id'
              label='Subkategori'
              rules={[{ required: true, message: 'Subkategori wajib diisi!' }]}
            >
              <Select
                placeholder='Pilih subkategori'
                disabled={!selectedCategory}
                loading={categoriesLoading}
                onChange={onSubCategoryChange}
              >
                {subCategories.map((subcategory) => (
                  <Option key={subcategory.sub_category_id} value={subcategory.sub_category_id}>
                    {subcategory.sub_category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name='hostname'
              label='Hostname/Asset Tag'
              rules={[{ required: true, message: 'Silakan pilih asset dari tabel!' }]}
            >
              <Input type='hidden' />
            </Form.Item>
            <div style={{ marginTop: -20, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Pilih Asset dari Tabel:
              </label>
              <Table
                rowKey='it_item_id'
                rowSelection={rowSelection}
                columns={itItemColumns}
                dataSource={itItems}
                loading={itItemsLoading}
                pagination={{ pageSize: 5 }}
                size='small'
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: selectedSubCategory
                    ? 'Tidak ada asset untuk kategori ini'
                    : 'Silakan pilih Subkategori terlebih dahulu',
                }}
              />
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
