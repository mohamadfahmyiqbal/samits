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

const WIB_OFFSET = 7;
const DAILY_START_HOUR = 8;
const DAILY_END_HOUR = 17;

const parseTime = (value) => {
  if (!value) return null;
  return dayjs.utc(value).utcOffset(WIB_OFFSET);
};

const parseDate = (value) => {
  if (!value) return null;
  return dayjs(value);
};

const disabledTimeRange = () => ({
  disabledHours: () => {
    const hours = [];
    for (let hour = 0; hour < 24; hour += 1) {
      if (
        hour < DAILY_START_HOUR ||
        hour > DAILY_END_HOUR
      ) {
        hours.push(hour);
      }
    }
    return hours;
  },
  disabledMinutes: () => [],
  disabledSeconds: () => [],
});

export default function ScheduleModal({
  mode = 'add',
  visible,
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
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] =
    useState([]);

  useEffect(() => {
    if (!visible) {
      setSelectedRowKeys([]);
      form.resetFields();
      return;
    }

    if (!initialValues) {
      form.resetFields();
      setSelectedRowKeys([]);
      return;
    }

    const scheduleDate =
      initialValues.scheduledDate ||
      initialValues.date ||
      initialValues.start_date;

    const scheduledEndDate =
      initialValues.scheduledEndDate ||
      initialValues.end_date ||
      scheduleDate;

    const startTime =
      initialValues.scheduledStartTime ||
      initialValues.start_time ||
      '09:00';

    const endTime =
      initialValues.scheduledEndTime ||
      initialValues.end_time ||
      '11:00';

    const assetHostnames =
      initialValues.assets
        ?.map(
          (asset) =>
            asset.hostname ||
            asset.assetTag
        )
        .filter(Boolean) || [];

    const mainTypeId =
      initialValues.asset_main_type_id ??
      initialValues.assetMainTypeId ??
      initialValues.assetTypeId;

    const categoryId =
      initialValues.category_id ??
      initialValues.categoryId ??
      initialValues.cat;

    const subCategoryId =
      initialValues.sub_category_id ??
      initialValues.subCategoryId ??
      initialValues.sub_cat;

    if (
      mainTypeId &&
      typeof onMainTypeChange ===
        'function'
    ) {
      onMainTypeChange(mainTypeId);
    }

    if (
      categoryId &&
      typeof onCategoryChange ===
        'function'
    ) {
      onCategoryChange(categoryId);
    }

    if (
      subCategoryId &&
      typeof onSubCategoryChange ===
        'function'
    ) {
      onSubCategoryChange(
        subCategoryId
      );
    }

    form.setFieldsValue({
      asset_main_type_id:
        initialValues.asset_main_type_id ??
        initialValues.assetMainTypeId,

      category_id:
        initialValues.category_id ??
        initialValues.categoryId,

      sub_category_id:
        initialValues.sub_category_id ??
        initialValues.subCategoryId,

      hostname:
        assetHostnames.length > 0
          ? assetHostnames
          : [
              initialValues.hostname ||
                initialValues.itItemId,
            ].filter(Boolean),

      start_date:
        parseDate(scheduleDate),

      end_date:
        parseDate(
          scheduledEndDate
        ),

      start_time:
        parseTime(startTime),

      end_time:
        parseTime(endTime),

      team:
        initialValues.team ||
        initialValues.pic,

      status:
        initialValues.status,

      priority:
        initialValues.priority,

      criticality:
        initialValues.criticality,

      estimated_duration:
        initialValues
          .estimatedDuration ??
        initialValues
          .estimated_duration,

      notes: initialValues.notes,

      selected_assets:
        initialValues.assets || [],
    });

    const assetKeys =
      initialValues.assets?.map(
        (asset) =>
          asset.itItemId ||
          asset.hostname ||
          asset.assetTag
      ) || [];

    if (assetKeys.length > 0) {
      setSelectedRowKeys(
        assetKeys.filter(Boolean)
      );
    } else if (
      initialValues.itItemId
    ) {
      setSelectedRowKeys([
        initialValues.itItemId,
      ]);
    } else if (
      initialValues.hostname
    ) {
      setSelectedRowKeys([
        initialValues.hostname,
      ]);
    }
  }, [
    visible,
    initialValues,
    form,
    onMainTypeChange,
    onCategoryChange,
    onSubCategoryChange,
  ]);

  const handleOk = async () => {
    const values =
      await form.validateFields();
    onSubmit(values);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Asset Tag',
        dataIndex: 'asset_tag',
        key: 'asset_tag',
        render: (text) => (
          <strong>
            {text || '-'}
          </strong>
        ),
      },
      {
        title: 'Hostname',
        dataIndex: 'hostname',
        key: 'hostname',
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
          <Tag
            color={
              status === 'active'
                ? 'green'
                : 'default'
            }
          >
            {status?.toUpperCase() ||
              'UNKNOWN'}
          </Tag>
        ),
      },
    ],
    []
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (
      selectedKeys,
      selectedRows
    ) => {
      setSelectedRowKeys(
        selectedKeys
      );

      form.setFieldsValue({
        hostname:
          selectedRows.map(
            (item) =>
              item.asset_tag ||
              item.hostname
          ),

        selected_assets:
          selectedRows.map(
            (item) => ({
              it_item_id:
                item.it_item_id,
              hostname:
                item.hostname,
              asset_tag:
                item.asset_tag,
            })
          ),
      });
    },
  };

  return (
    <Modal
      title={
        isEditMode
          ? 'Edit Jadwal Maintenance'
          : 'Tambah Jadwal Maintenance'
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      confirmLoading={confirmLoading}
      footer={[
        <Button
          key='cancel'
          onClick={onCancel}
        >
          Batal
        </Button>,
        <Button
          key='delete'
          danger
          onClick={onDelete}
          disabled={!isEditMode}
        >
          Hapus
        </Button>,
        <Button
          key='submit'
          type='primary'
          onClick={handleOk}
          loading={confirmLoading}
        >
          {isEditMode
            ? 'Simpan Perubahan'
            : 'Simpan Jadwal'}
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical'>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='start_date'
              label='Tanggal Mulai'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                style={{
                  width: '100%',
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='end_date'
              label='Tanggal Selesai'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                style={{
                  width: '100%',
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name='start_time'
              label='Waktu Mulai'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <TimePicker
                style={{
                  width: '100%',
                }}
                format='HH:mm'
                disabledTime={
                  disabledTimeRange
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='end_time'
              label='Waktu Selesai'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <TimePicker
                style={{
                  width: '100%',
                }}
                format='HH:mm'
                disabledTime={
                  disabledTimeRange
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>
          Pilih Asset
        </Divider>

        <Table
          rowKey={(record) =>
            record.it_item_id ||
            record.asset_tag ||
            record.hostname
          }
          rowSelection={rowSelection}
          columns={columns}
          dataSource={itItems}
          loading={itItemsLoading}
          pagination={{
            pageSize: 5,
          }}
          size='small'
        />
      </Form>
    </Modal>
  );
}