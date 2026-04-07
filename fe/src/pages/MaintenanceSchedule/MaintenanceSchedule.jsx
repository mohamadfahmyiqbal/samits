import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  message,
  Select,
  Modal,
  Form,
  DatePicker,
} from 'antd';
import DetailModal from './components/modals/DetailModal';
import ScheduleModal from './components/modals/ScheduleModal';
import GanttChart from './components/GanttChart';
import StatisticsCards from './components/StatisticsCards';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import {
  fetchActiveLogs,
  createLog,
  updateLog,
  deleteLog,
  fetchSchedule,
} from '../../services/MaintenanceService';
import {
  fetchMainTypes,
  fetchCategoriesByMainType,
  fetchSubCategoriesByCategory,
  fetchITItemsByCategory,
} from '../../services/CategoryService';
import userService from '../../services/UserService';

const { Option } = Select;

export default function MaintenanceSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scheduleData, setScheduleData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleModalMode, setScheduleModalMode] = useState('add');
  const [modalInitialValues, setModalInitialValues] = useState(null);
  const [ganttViewType, setGanttViewType] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  // Category states
  const [mainTypes, setMainTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [itItems, setItItems] = useState([]);
  const [selectedMainType, setSelectedMainType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [itItemsLoading, setItItemsLoading] = useState(false);

  // Maintenance team state
  const [maintenanceTeam, setMaintenanceTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const { category, subcategory, schedule, selectedDate, selectedTime } = location.state || {};

  const timelineItems = selectedSchedule
    ? [
        {
          label: 'Created',
          children: (
            <div>
              <p>
                <strong>Date:</strong> {selectedSchedule.created_date}
              </p>
              <p>
                <strong>By:</strong> {selectedSchedule.created_by}
              </p>
            </div>
          ),
          color: 'green',
        },
        {
          label: 'Scheduled',
          children: (
            <div>
              <p>
                <strong>Date:</strong> {selectedSchedule.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}
              </p>
              <p>
                <strong>Team:</strong> {selectedSchedule.team}
              </p>
            </div>
          ),
          color: 'blue',
        },
        ...(selectedSchedule.status === 'completed'
          ? [
              {
                label: 'Completed',
                children: (
                  <div>
                    <p>Maintenance completed successfully</p>
                  </div>
                ),
                color: 'green',
              },
            ]
          : []),
      ]
    : [];

  // Transform backend data to frontend format
  const transformBackendData = (backendData) => {
    return backendData.map((item) => {
      const scheduledDate = item.scheduledDate || item.date || item.start_date;
      const scheduledEndDate = item.scheduledEndDate || item.end_date || scheduledDate;
      const scheduledStartTime = item.scheduledStartTime || item.start_time || '09:00';
      const scheduledEndTime = item.scheduledEndTime || item.end_time || '11:00';
      return {
        id: item.id,
        schedule_code: `MS-${item.id}`,
        category: item.category || 'Preventive Maintenance',
        subcategory: item.type || 'General Check',
        equipment: item.assetName || item.hostname || 'Unknown Equipment',
        location: item.location || 'To be determined',
        team: item.pic || 'To be assigned',
        date: scheduledDate,
        start_time: scheduledStartTime,
        end_time: scheduledEndTime,
        scheduledDate,
        scheduledEndDate,
        scheduledStartTime,
        scheduledEndTime,
        start_date: item.start_date,
        end_date: item.end_date,
        status:
          item.status === 'done'
            ? 'completed'
            : item.status === 'abnormal'
              ? 'cancelled'
              : item.status,
        priority: item.priority || 'medium',
        criticality: item.criticality || 'medium',
        required_skills: item.requiredSkills || [],
        estimated_duration: item.estimatedDuration || 2,
        created_by: item.createdBy,
        created_date: item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: item.description || item.notes || 'No notes',
        // Keep original data for API calls
        originalData: item,
      };
    });
  };

  // Fetch maintenance team from API
  const fallbackMaintenanceTeam = [
    { nik: '12345', name: 'John Doe', display_name: 'John Doe (12345)' },
    { nik: '67890', name: 'Jane Smith', display_name: 'Jane Smith (67890)' },
    { nik: '11111', name: 'Mike Johnson', display_name: 'Mike Johnson (11111)' },
  ];

  const fetchMaintenanceTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const response = await userService.fetchMaintenanceUsers();
      if (response.success) {
        setMaintenanceTeam(response.data || fallbackMaintenanceTeam);
      } else {
        setMaintenanceTeam(fallbackMaintenanceTeam);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance team:', error);
      // Fallback to mock data if API fails
      setMaintenanceTeam(fallbackMaintenanceTeam);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetchMainTypes();
      if (response.data) {
        setMainTypes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch main types:', error);
      // Fallback to mock data if API fails
      setMainTypes([
        { asset_main_type_id: 1, main_type_name: 'IT Infrastructure' },
        { asset_main_type_id: 2, main_type_name: 'Network Equipment' },
        { asset_main_type_id: 3, main_type_name: 'Server' },
        { asset_main_type_id: 4, main_type_name: 'Storage' },
        { asset_main_type_id: 5, main_type_name: 'Security' },
        { asset_main_type_id: 6, main_type_name: 'Facility' },
      ]);
    }
  }, []);

  // Fetch categories by main type
  const fetchCategoriesByMainTypeLocal = async (mainTypeId) => {
    if (!mainTypeId) {
      setCategories([]);
      return;
    }

    setCategoriesLoading(true);
    try {
      const response = await fetchCategoriesByMainType(mainTypeId);
      if (response.data) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to mock data
      setCategories([
        { category: 'Preventive Maintenance', category_id: 1, sub_categories: [] },
        { category: 'Corrective Maintenance', category_id: 2, sub_categories: [] },
        { category: 'Predictive Maintenance', category_id: 3, sub_categories: [] },
        { category: 'Emergency Maintenance', category_id: 4, sub_categories: [] },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch subcategories by category
  const fetchSubCategoriesByCategoryLocal = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }

    try {
      const response = await fetchSubCategoriesByCategory(categoryId);
      if (response.data && response.data.length > 0) {
        // Backend returns categories with sub_categories array
        const categoryData = response.data[0];
        setSubCategories(categoryData.sub_categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      // Fallback to mock data
      setSubCategories([
        { sub_category_id: 1, sub_category_name: 'Equipment Inspection' },
        { sub_category_id: 2, sub_category_name: 'Lubrication' },
        { sub_category_id: 3, sub_category_name: 'Calibration' },
        { sub_category_id: 4, sub_category_name: 'Cleaning' },
        { sub_category_id: 5, sub_category_name: 'Hardware Repair' },
        { sub_category_id: 6, sub_category_name: 'Software Update' },
        { sub_category_id: 7, sub_category_name: 'Network Configuration' },
        { sub_category_id: 8, sub_category_name: 'Security Audit' },
      ]);
    }
  };

  // Fetch IT items by category/subcategory
  const fetchITItems = async (
    categoryId,
    subCategoryId,
    mainTypeId = null,
    fallbackItems = [],
  ) => {
    if (!categoryId || !subCategoryId) {
      setItItems([]);
      return;
    }
    setItItemsLoading(true);
    try {
      const response = await fetchITItemsByCategory(categoryId, subCategoryId, mainTypeId);
      if (response.data) {
        if (response.data.length === 0 && fallbackItems.length > 0) {
          setItItems(fallbackItems);
        } else {
          setItItems(response.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch IT items:', error);
      if (fallbackItems.length > 0) {
        setItItems(fallbackItems);
      } else {
        setItItems([]);
      }
    } finally {
      setItItemsLoading(false);
    }
  };

  // Handle main type change
  const handleMainTypeChange = (value) => {
    setSelectedMainType(value);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setCategories([]);
    setSubCategories([]);
    setItItems([]);
    form.setFieldsValue({
      category_id: undefined,
      sub_category_id: undefined,
      hostname: undefined,
    });
    fetchCategoriesByMainTypeLocal(value);
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubCategory(null);
    setSubCategories([]);
    setItItems([]);
    form.setFieldsValue({ sub_category_id: undefined, hostname: undefined });
    fetchSubCategoriesByCategoryLocal(value);
  };

  // Handle subcategory change
  const handleSubCategoryChange = (value) => {
    setSelectedSubCategory(value);
    form.setFieldsValue({ hostname: undefined });
    fetchITItems(selectedCategory, value, selectedMainType);
  };
  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetchActiveLogs();
      if (response.success) {
        const transformedData = transformBackendData(response.data);
        setScheduleData(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      message.error('Gagal mengambil data jadwal');
      // Fallback to mock data if API fails
      setScheduleData([]);
    }
  }, []);

  // Create schedule from wizard data
  const createScheduleFromWizard = useCallback(
    async (scheduleData) => {
      try {
        const payload = {
          hostname: Array.isArray(scheduleData.hostname)
            ? scheduleData.hostname[0]
            : scheduleData.hostname,
          asset_main_type_id: scheduleData.asset_main_type_id,
          category_id: scheduleData.category_id,
          sub_category_id: scheduleData.sub_category_id,
          start_date: scheduleData.start_date?.format
            ? scheduleData.start_date.format('YYYY-MM-DD')
            : scheduleData.start_date,
          end_date: scheduleData.end_date?.format
            ? scheduleData.end_date.format('YYYY-MM-DD')
            : scheduleData.end_date,
          start_time: scheduleData.start_time?.format
            ? scheduleData.start_time.format('HH:mm')
            : scheduleData.start_time,
          end_time: scheduleData.end_time?.format
            ? scheduleData.end_time.format('HH:mm')
            : scheduleData.end_time,
          team: scheduleData.team,
          description: scheduleData.notes,
          notes: scheduleData.notes,
          priority: scheduleData.priority || 'medium',
          estimated_duration: scheduleData.estimated_duration || 2.0,
          recurrence: scheduleData.recurrence,
          recurrence_interval: scheduleData.recurrence_interval,
          recurrence_end_date: scheduleData.recurrence_end_date?.format
            ? scheduleData.recurrence_end_date.format('YYYY-MM-DD')
            : scheduleData.recurrence_end_date,
          recurrence_count: scheduleData.recurrence_count,
          selected_assets: scheduleData.selected_assets,
        };

        const response = await createLog(payload);
        if (response.success) {
          message.success('Jadwal maintenance berhasil dibuat!');
          fetchSchedules(); // Refresh data
          return true; // Success - modal can close
        }

        message.error(response.message || 'Gagal membuat jadwal');
        return false;
      } catch (error) {
        console.error('Failed to create schedule:', error);
        message.error('Gagal membuat jadwal');
        return false;
      }
    },
    [fetchSchedules],
  );

  useEffect(() => {
    fetchSchedules();
    fetchCategories(); // Fetch categories on component mount
    fetchMaintenanceTeam(); // Fetch maintenance team on component mount

    // Add new schedule if coming from previous steps
    if (category && subcategory && schedule) {
      const newSchedule = {
        id: Date.now(),
        schedule_code: `MS-2024-${Date.now()}`,
        category: category.name,
        subcategory: subcategory.name,
        equipment: 'New Equipment',
        location: schedule.location || 'To be determined',
        team: schedule.team_name || 'To be assigned',
        date: selectedDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        start_time: schedule.start_time || '09:00',
        end_time: schedule.end_time || '11:00',
        status: 'scheduled',
        priority: schedule.priority || 'medium',
        criticality: 'medium',
        required_skills: [],
        estimated_duration: 2,
        created_by: 'Current User',
        created_date: new Date().toISOString().split('T')[0],
        notes: schedule.notes || 'New maintenance schedule',
      };

      // Create schedule via API
      createScheduleFromWizard(newSchedule);
    }
  }, [
    category,
    subcategory,
    schedule,
    selectedDate,
    fetchSchedules,
    fetchCategories,
    fetchMaintenanceTeam,
    createScheduleFromWizard,
  ]);

  const handleViewDetail = (schedule) => {
    navigate('/dashboard-maintenance', {
      state: {
        viewMode: 'detail',
        scheduleData: schedule,
      },
    });
  };

  const handleEdit = async (schedule) => {
    setScheduleModalMode('edit');
    setModalLoading(true);
    try {
      const response = await fetchSchedule(schedule.id);
      console.log('fetchSchedule response:', response);
      if (response.success && response.data) {
        setModalInitialValues(response.data);
        const mainTypeId =
          response.data.assetMainTypeId ?? response.data.asset_main_type_id;
        const categoryId =
          response.data.categoryId ?? response.data.category_id;
        const subCategoryId =
          response.data.subCategoryId ?? response.data.sub_category_id;

        if (mainTypeId) {
          setSelectedMainType(mainTypeId);
          fetchCategoriesByMainTypeLocal(mainTypeId);
        }

        if (categoryId) {
          setSelectedCategory(categoryId);
          fetchSubCategoriesByCategoryLocal(categoryId);
        }

        const fallbackItems = (response.data.assets || []).map((asset) => ({
          it_item_id: asset.itItemId,
          hostname: asset.hostname,
          asset_tag: asset.assetTag,
          item_name: asset.hostname || asset.assetTag,
          status: 'active',
        }));

        if (fallbackItems.length > 0) {
          setItItems(fallbackItems);
        }

        if (categoryId && subCategoryId) {
          fetchITItems(categoryId, subCategoryId, mainTypeId, fallbackItems);
        }
        setScheduleModalVisible(true);
      } else {
        message.error(response.message || 'Gagal memuat data jadwal');
      }
    } catch (error) {
      console.error('Failed to load schedule detail:', error);
      message.error('Gagal memuat data jadwal');
    } finally {
      setModalLoading(false);
    }
  };

  const closeScheduleModal = () => {
    setScheduleModalVisible(false);
    setModalInitialValues(null);
    form.resetFields();
    setModalLoading(false);
  };

  const handleUpdateSchedule = async (values) => {
    if (!modalInitialValues) return;
    setModalLoading(true);
    try {
      const scheduledDate =
        values.start_date?.format('YYYY-MM-DD') || modalInitialValues.scheduledDate;
      const scheduledEndDate =
        values.end_date?.format('YYYY-MM-DD') || modalInitialValues.scheduledEndDate;
      const payload = {
        scheduledDate,
        scheduledEndDate,
        scheduledTime: values.start_time?.format('HH:mm'),
        scheduledEndTime: values.end_time?.format('HH:mm'),
        status: values.status || modalInitialValues.status,
        priority: values.priority || modalInitialValues.priority,
        criticality: values.criticality || modalInitialValues.criticality,
        notes: values.notes ?? modalInitialValues.notes,
        description: values.notes ?? modalInitialValues.notes,
        pic: values.team?.trim() ? values.team : modalInitialValues.team,
        asset_main_type_id: values.asset_main_type_id,
        category_id: values.category_id,
        sub_category_id: values.sub_category_id,
        selected_assets: values.selected_assets,
      };

      const response = await updateLog(modalInitialValues.id, payload);
      if (response.success) {
        message.success('Jadwal berhasil diperbarui');
        fetchSchedules();
        closeScheduleModal();
      } else {
        message.error(response.message || 'Gagal memperbarui jadwal');
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
      message.error('Gagal memperbarui jadwal');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalSubmit = async (values) => {
    if (scheduleModalMode === 'add') {
      setModalLoading(true);
      try {
        const success = await createScheduleFromWizard(values);
        if (success) {
          closeScheduleModal();
        }
      } finally {
        setModalLoading(false);
      }
    } else {
      await handleUpdateSchedule(values);
    }
  };

  const handleModalDelete = () => {
    if (!modalInitialValues) return;
    handleDelete(modalInitialValues.id);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Hapus Jadwal Maintenance',
      content: 'Apakah Anda yakin ingin menghapus jadwal maintenance ini?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          const response = await deleteLog(id);
          if (response.success) {
            message.success('Jadwal berhasil dihapus');
            fetchSchedules(); // Refresh data
            closeScheduleModal();
          } else {
            message.error(response.message || 'Gagal menghapus jadwal');
          }
        } catch (error) {
          console.error('Failed to delete schedule:', error);
          message.error('Gagal menghapus jadwal');
        }
      },
    });
  };

  const handleAddSchedule = () => {
    setScheduleModalMode('add');
    setModalInitialValues(null);
    form.resetFields();
    setScheduleModalVisible(true);
  };

  // Helper function to get date range based on view type
  const getDateRange = () => {
    const now = new Date();

    if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
      return { start: selectedDateRange[0], end: selectedDateRange[1] };
    }

      switch (ganttViewType) {
        case 'daily':
          return { start: now, end: addDays(now, 0) }; // Today only
        case 'weekly':
          return {
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: endOfWeek(now, { weekStartsOn: 1 }),
          };
        case 'monthly':
          return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'yearly':
          return { start: startOfYear(now), end: endOfYear(now) };
        default:
          return { start: subDays(now, 7), end: addDays(now, 30) };
      }
    };

  return (
    <div className='maintenance-schedule'>
      <div className='page-header'>
        <h1>Maintenance Schedule</h1>
        <p>Kelola jadwal maintenance dan monitoring status</p>
      </div>

      <StatisticsCards scheduleData={scheduleData} />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title='Daftar Jadwal Maintenance'
            extra={
              <Space>
                <Select value={ganttViewType} onChange={setGanttViewType} style={{ width: 140 }}>
                  <Option value='daily'>Daily</Option>
                  <Option value='weekly'>Weekly</Option>
                  <Option value='monthly'>Monthly</Option>
                  <Option value='yearly'>Yearly</Option>
                </Select>
                <DatePicker.RangePicker
                  value={selectedDateRange}
                  onChange={setSelectedDateRange}
                  placeholder={['Start Date', 'End Date']}
                />
                <Button type='primary' onClick={handleAddSchedule}>
                  Tambah Jadwal
                </Button>
              </Space>
            }
          >
            <GanttChart
              scheduleData={scheduleData}
              dateRange={getDateRange()}
              viewType={ganttViewType}
              onEdit={handleEdit}
            />
          </Card>
        </Col>
      </Row>

      <DetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedSchedule(null);
        }}
        selectedSchedule={selectedSchedule}
        timelineItems={timelineItems}
      />

      <ScheduleModal
        mode={scheduleModalMode}
        visible={scheduleModalVisible}
        form={form}
        onCancel={closeScheduleModal}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
        confirmLoading={modalLoading}
        maintenanceTeam={maintenanceTeam}
        teamLoading={teamLoading}
        mainTypes={mainTypes}
        categories={categories}
        subCategories={subCategories}
        itItems={itItems}
        itItemsLoading={itItemsLoading}
        selectedMainType={selectedMainType}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        categoriesLoading={categoriesLoading}
        onMainTypeChange={handleMainTypeChange}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        initialValues={modalInitialValues}
      />
    </div>
  );
}
