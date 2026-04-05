import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, Row, Col, Button, Space, message, Select, Modal, Form, DatePicker } from 'antd';
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
import {
  FALLBACK_MAINTENANCE_TEAM,
  FALLBACK_MAIN_TYPES,
  FALLBACK_CATEGORIES,
  FALLBACK_SUBCATEGORIES,
  WEEK_STARTS_ON,
  DEFAULT_ESTIMATED_DURATION,
  DEBOUNCE_DELAY,
} from './constants';
import { useDebounce, useAsyncOperation, useApiErrorHandler } from './hooks';

const { Option } = Select;

export default function MaintenanceSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const transformBackendData = useCallback((backendData) => {
    return backendData.map((item) => ({
      id: item.id,
      schedule_code: `MS-${item.id}`,
      category: item.category || 'Preventive Maintenance',
      subcategory: item.type || 'General Check',
      equipment: item.assetName || item.hostname || 'Unknown Equipment',
      location: item.location || 'To be determined',
      team: item.pic || 'To be assigned',
      date: item.scheduledDate,
      start_time: item.scheduledStartTime || '09:00',
      end_time: item.scheduledEndTime || '11:00',
      status:
        item.status === 'done'
          ? 'completed'
          : item.status === 'abnormal'
            ? 'cancelled'
            : item.status,
      priority: item.priority || 'medium',
      criticality: item.criticality || 'medium',
      required_skills: item.requiredSkills || [],
      estimated_duration: item.estimatedDuration || DEFAULT_ESTIMATED_DURATION,
      created_by: item.createdBy,
      created_date: item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: item.description || item.notes || 'No notes',
      // Keep original data for API calls
      originalData: item,
    }));
  }, []);

  // Custom hooks
  const safeAsyncOperation = useAsyncOperation();
  const handleError = useApiErrorHandler();

  // Debounced values for API calls
  const debouncedMainType = useDebounce(selectedMainType, DEBOUNCE_DELAY);
  const debouncedCategory = useDebounce(selectedCategory, DEBOUNCE_DELAY);
  const debouncedSubCategory = useDebounce(selectedSubCategory, DEBOUNCE_DELAY);

  // Fetch maintenance team from API
  const fetchMaintenanceTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const result = await safeAsyncOperation(async () => {
        const response = await userService.fetchMaintenanceUsers();
        if (response.success) {
          return response.data || FALLBACK_MAINTENANCE_TEAM;
        }
        throw new Error(response.message || 'Failed to fetch maintenance team');
      });

      if (result) {
        setMaintenanceTeam(result);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Gagal mengambil data tim maintenance');
      message.error(errorMessage);
      setMaintenanceTeam(FALLBACK_MAINTENANCE_TEAM);
    } finally {
      setTeamLoading(false);
    }
  }, [safeAsyncOperation, handleError]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const result = await safeAsyncOperation(async () => {
        const response = await fetchMainTypes();
        if (response.data) {
          return response.data || FALLBACK_MAIN_TYPES;
        }
        throw new Error('Failed to fetch main types');
      });

      if (result) {
        setMainTypes(result);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Gagal mengambil data tipe utama');
      message.error(errorMessage);
      setMainTypes(FALLBACK_MAIN_TYPES);
    }
  }, [safeAsyncOperation, handleError]);

  // Fetch categories by main type (with debouncing)
  const fetchCategoriesByMainTypeLocal = useCallback(
    async (mainTypeId) => {
      if (!mainTypeId) {
        setCategories([]);
        return;
      }

      setCategoriesLoading(true);
      try {
        const result = await safeAsyncOperation(async () => {
          const response = await fetchCategoriesByMainType(mainTypeId);
          if (response.data) {
            return response.data || FALLBACK_CATEGORIES;
          }
          throw new Error('Failed to fetch categories');
        });

        if (result) {
          setCategories(result);
        }
      } catch (error) {
        const errorMessage = handleError(error, 'Gagal mengambil data kategori');
        message.error(errorMessage);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setCategoriesLoading(false);
      }
    },
    [safeAsyncOperation, handleError]
  );

  // Effect for debounced main type changes
  useEffect(() => {
    if (debouncedMainType && debouncedMainType !== selectedMainType) {
      fetchCategoriesByMainTypeLocal(debouncedMainType);
    }
  }, [debouncedMainType, selectedMainType, fetchCategoriesByMainTypeLocal]);

  // Fetch subcategories by category (with debouncing)
  const fetchSubCategoriesByCategoryLocal = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }

      try {
        const result = await safeAsyncOperation(async () => {
          const response = await fetchSubCategoriesByCategory(categoryId);
          if (response.data && response.data.length > 0) {
            const categoryData = response.data[0];
            return categoryData.sub_categories || FALLBACK_SUBCATEGORIES;
          }
          return FALLBACK_SUBCATEGORIES;
        });

        if (result) {
          setSubCategories(result);
        }
      } catch (error) {
        const errorMessage = handleError(error, 'Gagal mengambil data subkategori');
        message.error(errorMessage);
        setSubCategories(FALLBACK_SUBCATEGORIES);
      }
    },
    [safeAsyncOperation, handleError]
  );

  // Fetch IT items by category/subcategory (with debouncing)
  const fetchITItems = useCallback(
    async (categoryId, subCategoryId, mainTypeId = null, fallbackItems = []) => {
      if (!categoryId || !subCategoryId) {
        setItItems([]);
        return;
      }
      setItItemsLoading(true);
      try {
        const result = await safeAsyncOperation(async () => {
          const response = await fetchITItemsByCategory(categoryId, subCategoryId, mainTypeId);
          if (response.data) {
            if (response.data.length === 0 && fallbackItems.length > 0) {
              return fallbackItems;
            }
            return response.data || [];
          }
          return fallbackItems.length > 0 ? fallbackItems : [];
        });

        if (result) {
          setItItems(result);
        }
      } catch (error) {
        const errorMessage = handleError(error, 'Gagal mengambil data IT items');
        message.error(errorMessage);
        setItItems(fallbackItems.length > 0 ? fallbackItems : []);
      } finally {
        setItItemsLoading(false);
      }
    },
    [safeAsyncOperation, handleError]
  );

  // Effect for debounced subcategory changes
  useEffect(() => {
    if (debouncedSubCategory && debouncedSubCategory !== selectedSubCategory) {
      fetchITItems(selectedCategory, debouncedSubCategory, selectedMainType);
    }
  }, [debouncedSubCategory, selectedSubCategory, selectedCategory, selectedMainType, fetchITItems]);

  // Handle main type change
  const handleMainTypeChange = useCallback(
    (value) => {
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
    },
    [form]
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (value) => {
      setSelectedCategory(value);
      setSelectedSubCategory(null);
      setSubCategories([]);
      setItItems([]);
      form.setFieldsValue({ sub_category_id: undefined, hostname: undefined });
    },
    [form]
  );

  // Handle subcategory change
  const handleSubCategoryChange = useCallback(
    (value) => {
      setSelectedSubCategory(value);
      form.setFieldsValue({ hostname: undefined });
    },
    [form]
  );
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await safeAsyncOperation(async () => {
        const response = await fetchActiveLogs();
        if (response.success) {
          return transformBackendData(response.data);
        }
        throw new Error(response.message || 'Failed to fetch schedules');
      });

      if (result) {
        setScheduleData(result);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Gagal mengambil data jadwal');
      setError(errorMessage);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  }, [safeAsyncOperation, handleError, transformBackendData]);

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
    [fetchSchedules]
  );

  useEffect(() => {
    fetchSchedules();
    fetchCategories();
    fetchMaintenanceTeam();

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
        estimated_duration: DEFAULT_ESTIMATED_DURATION,
        created_by: 'Current User',
        created_date: new Date().toISOString().split('T')[0],
        notes: schedule.notes || 'New maintenance schedule',
      };

      // Create schedule via API
      createScheduleFromWizard(newSchedule);
    }

    // Cleanup function
    return () => {
      // Cancel any pending operations if needed
    };
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
        const mainTypeId = response.data.assetMainTypeId ?? response.data.asset_main_type_id;
        const categoryId = response.data.categoryId ?? response.data.category_id;
        const subCategoryId = response.data.subCategoryId ?? response.data.sub_category_id;

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

  // Helper function to get date range based on view type (memoized)
  const getDateRange = useMemo(() => {
    return () => {
      const now = new Date();

      if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
        return { start: selectedDateRange[0], end: selectedDateRange[1] };
      }

      switch (ganttViewType) {
        case 'daily':
          if (selectedDateRange && selectedDateRange[0]) {
            return { start: selectedDateRange[0], end: selectedDateRange[0] };
          }
          return { start: now, end: now }; // Today only
        case 'weekly':
          return {
            start: startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
            end: endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
          };
        case 'monthly':
          return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'yearly':
          return { start: startOfYear(now), end: endOfYear(now) };
        default:
          return { start: subDays(now, 7), end: addDays(now, 30) };
      }
    };
  }, [selectedDateRange, ganttViewType]);

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
              loading={loading}
              error={error}
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
