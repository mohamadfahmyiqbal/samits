import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  DatePicker,
  TimePicker,
  Select,
  Input,
  Table,
  Tag,
  Divider,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const { Option } = Select;

dayjs.extend(utc);

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CRITICALITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Tidak Ada' },
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' },
];

const WIB_OFFSET = 7;
const DAILY_START_HOUR = 8;
const DAILY_END_HOUR = 17;

const parseTime = (value) => {
  if (!value) return null;
  return dayjs.utc(value).utcOffset(WIB_OFFSET);
};

const disabledTimeRange = () => ({
  disabledHours: () => {
    const hours = [];
    for (let hour = 0; hour < 24; hour += 1) {
      if (hour < DAILY_START_HOUR || hour > DAILY_END_HOUR) {
        hours.push(hour);
      }
    }
    return hours;
  },
  disabledMinutes: () => [],
  disabledSeconds: () => [],
});

const parseDate = (value) => {
  if (!value) return null;
  return dayjs(value);
};

export default function ScheduleModal({
  mode = 'add',
  visible,
  form,
  maintenanceTeam = [],
  teamLoading = false,
  mainTypes = [],
  categories = [],
  subCategories = [],
  itItems = [],
  itItemsLoading = false,
  selectedMainType,
  selectedCategory,
  selectedSubCategory,
  categoriesLoading = false,
  onMainTypeChange,
  onCategoryChange,
  onSubCategoryChange,
  onCancel,
  onSubmit,
  onDelete,
  confirmLoading = false,
  initialValues = null,
}) {
  const isEditMode = mode === 'edit';
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    if (!visible) {
      setSelectedRowKeys([]);
      form.resetFields();
      return;
    }

    if (initialValues) {
      const scheduleDate =
        initialValues.scheduledDate || initialValues.date || initialValues.start_date;
      const scheduledEndDate =
        initialValues.scheduledEndDate || initialValues.end_date || scheduleDate;
      const startTime =
        initialValues.scheduledStartTime || initialValues.start_time || '09:00';
      const endTime = initialValues.scheduledEndTime || initialValues.end_time || '11:00';

      const assetHostnames =
        initialValues.assets
          ?.map((asset) => asset.hostname || asset.assetTag)
          .filter(Boolean) || [];
      const mainTypeId =
        initialValues.asset_main_type_id ?? initialValues.assetMainTypeId ?? initialValues.assetTypeId;
      const categoryId =
        initialValues.category_id ?? initialValues.categoryId ?? initialValues.cat;
      const subCategoryId =
        initialValues.sub_category_id ?? initialValues.subCategoryId ?? initialValues.sub_cat;

      if (mainTypeId && typeof onMainTypeChange === 'function') {
        onMainTypeChange(mainTypeId);
      }

      if (categoryId && typeof onCategoryChange === 'function') {
        onCategoryChange(categoryId);
      }

      if (subCategoryId && typeof onSubCategoryChange === 'function') {
        onSubCategoryChange(subCategoryId);
      }

      if (
        initialValues?.asset_main_type_id ||
        initialValues?.category_id ||
        initialValues?.sub_category_id
      ) {
        fetchCategoriesByMainTypeLocal(mainTypeId);
        fetchSubCategoriesByCategoryLocal(categoryId);
        fetchITItems(categoryId, subCategoryId, mainTypeId);

        const fallbackItems = (initialValues.assets || []).map((asset) => ({
          it_item_id: asset.itItemId,
          hostname: asset.hostname,
          asset_tag: asset.assetTag,
          item_name: asset.hostname || asset.assetTag,
          status: 'active',
        }));
        if (fallbackItems.length > 0) {
          setItItems(fallbackItems);
        }
      }

      form.setFieldsValue({
        asset_main_type_id:
          initialValues.asset_main_type_id ?? initialValues.assetMainTypeId,
        category_id: initialValues.category_id ?? initialValues.categoryId,
        sub_category_id:
          initialValues.sub_category_id ?? initialValues.subCategoryId,
        hostname:
          assetHostnames.length > 0
            ? assetHostnames
            : [initialValues.hostname || initialValues.itItemId].filter(Boolean),
        start_date: parseDate(scheduleDate),
        end_date: parseDate(scheduledEndDate),
        start_time: parseTime(startTime),
        end_time: parseTime(endTime),
        team: initialValues.team || initialValues.pic || initialValues.notes?.team,
        status: initialValues.status,
        priority: initialValues.priority,
        criticality: initialValues.criticality,
        estimated_duration:
          initialValues.estimatedDuration ?? initialValues.estimated_duration,
        recurrence: initialValues.recurrence,
        recurrence_interval:
          initialValues.recurrence_interval ?? initialValues.recurrenceInterval,
        recurrence_end_date: parseDate(
          initialValues.recurrence_end_date ?? initialValues.recurrenceEndDate,
        ),
        recurrence_count:
          initialValues.recurrence_count ?? initialValues.recurrenceCount,
        notes: initialValues.notes,
        selected_assets: initialValues.assets || [],
      });
      const assetKeys =
        initialValues.assets?.map(
          (asset) => asset.itItemId || asset.hostname || asset.assetTag,
        ) || [];
      if (assetKeys.length > 0) {
        setSelectedRowKeys(assetKeys.filter(Boolean));
      } else if (initialValues.itItemId) {
        setSelectedRowKeys([initialValues.itItemId]);
      } else if (initialValues.hostname) {
        setSelectedRowKeys([initialValues.hostname]);
      }
    } else {
      form.resetFields();
      setSelectedRowKeys([]);
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      // validation handled by Ant Design
    }
  };

  const columns = useMemo(
    () => [
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
    ],
    [],
  );

  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      const hostnames = selectedRows
        .map((item) => item.asset_tag || item.hostname || item.item_name)
        .filter(Boolean);
      const normalizedAssets = selectedRows.map((item) => ({
        it_item_id: item.it_item_id,
        hostname: item.hostname || item.asset_tag,
        asset_tag: item.asset_tag,
      }));
      form.setFieldsValue({
        hostname: hostnames.length > 0 ? hostnames : undefined,
        selected_assets: normalizedAssets,
      });
    },
  };

  const renderAssetSelection = () => {

    return (
      <>
        <Divider titlePlacement='start'>Pilih Asset</Divider>
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
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name='hostname'
              label='Hostname/Asset Tag'
              rules={[{ required: true, message: 'Silakan pilih asset dari tabel!' }]}
            >
              <Input type='hidden' />
            </Form.Item>
            <Form.Item name='selected_assets' initialValue={[]} hidden>
              <Input type='hidden' />
            </Form.Item>
            <div style={{ marginTop: -20, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Pilih Asset dari Tabel:
              </label>
              <Table
                rowKey={(record) => record.it_item_id || record.asset_tag || record.hostname}
                rowSelection={rowSelection}
                columns={columns}
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
      </>
    );
  };

  const footerButtons = [
    <Button key='cancel' onClick={onCancel}>
      Batal
    </Button>,
    <Button key='delete' danger onClick={onDelete} disabled={!isEditMode || !onDelete}>
      Hapus Schedule
    </Button>,
    <Button key='submit' type='primary' onClick={handleOk} loading={confirmLoading}>
      {isEditMode ? 'Simpan Perubahan' : 'Simpan Jadwal'}
    </Button>,
  ];

  return (
    <Modal
      title={isEditMode ? 'Edit Jadwal Maintenance' : 'Tambah Jadwal Maintenance'}
      open={visible}
      onCancel={onCancel}
      footer={footerButtons}
      width={1000}
      destroyOnHidden
      forceRender
      styles={{
        body: {
          maxHeight: 'calc(70vh - 44px)',
          overflowY: 'auto',
          paddingRight: 8,
          paddingBottom: 90,
        },
      }}
      style={{ top: 80, zIndex: 2000 }}
      wrapClassName='maintenance-schedule-modal'
      getContainer={() => document.body}
    >
      <Form form={form} layout='vertical'>
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
                placeholder='Pilih jam'
                disabledTime={disabledTimeRange}
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
                placeholder='Pilih jam'
                disabledTime={disabledTimeRange}
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
                mode={isEditMode ? 'single' : 'multiple'}
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
              name='priority'
              label='Prioritas'
              rules={[{ required: true, message: 'Prioritas wajib diisi!' }]}
            >
              <Select placeholder='Pilih prioritas'>
                {PRIORITY_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name='status' label='Status'>
              <Select placeholder='Pilih status'>
                {STATUS_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='criticality' label='Criticality'>
              <Select placeholder='Pilih criticality'>
                {CRITICALITY_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name='notes'
              label='Catatan'
              rules={[{ required: false }]}
            >
              <Input.TextArea rows={3} placeholder='Masukkan catatan tambahan' />
            </Form.Item>
          </Col>
        </Row>

        {renderAssetSelection()}
      </Form>
    </Modal>
  );
}
