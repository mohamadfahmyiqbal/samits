import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
 Card,
 Row,
 Col,
 Button,
 Space,
 message,
 Select,
 Form,
 DatePicker,
} from 'antd';
import {
 fetchActiveLogs,
 createLog,
} from '../../services/MaintenanceService';
import useDateRange from './hooks/useDateRange';
import useCategoryData from './hooks/useCategoryData';
import useMaintenanceTeam from './hooks/useMaintenanceTeam';
import useScheduleActions from './hooks/useScheduleActions';
import { transformScheduleData } from './utils/transformScheduleData';
import DetailModal from './components/modals/DetailModal';
import ScheduleModal from './components/modals/ScheduleModal';
import GanttChart from './components/GanttChart';
import StatisticsCards from './components/StatisticsCards';
import { useLocation } from 'react-router-dom';

const { Option } = Select;

export default function MaintenanceSchedule() {
 const location = useLocation();
 const [scheduleData, setScheduleData] = useState([]);
 const [detailModalVisible, setDetailModalVisible] = useState(false);
 const [selectedSchedule, setSelectedSchedule] = useState(null);
 const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
 const [scheduleModalMode, setScheduleModalMode] = useState('add');
 const [modalInitialValues, setModalInitialValues] = useState(null);
 const [ganttViewType, setGanttViewType] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'yearly'
 const [selectedDateRange, setSelectedDateRange] = useState(null);
 const dateRange = useDateRange(
  ganttViewType,
  selectedDateRange
 );
 const {
  mainTypes,
  categories,
  subCategories,
  itItems,
  categoriesLoading,
  itItemsLoading,
  selectedMainType,
  selectedCategory,
  selectedSubCategory,
  fetchCategories,
  fetchCategoriesByMainTypeLocal,
  fetchSubCategoriesByCategoryLocal,
  fetchITItems,
  handleMainTypeChange,
  handleCategoryChange,
  handleSubCategoryChange,
  setSelectedMainType,
  setSelectedCategory,
  setItItems,
 } = useCategoryData();

 const {
  maintenanceTeam,
  teamLoading,
  fetchMaintenanceTeam,
 } = useMaintenanceTeam();

 const fetchSchedules = useCallback(async () => {
  try {
   const response = await fetchActiveLogs();
   if (response.success) {
    const transformedData = transformScheduleData(response.data);
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
 const [modalLoading, setModalLoading] = useState(false);

 const {
  handleEdit,
  handleDelete,
  handleModalSubmit,
  closeScheduleModal,
 } = useScheduleActions({
  fetchSchedules,
  createScheduleFromWizard,
  modalInitialValues,
  setModalInitialValues,
  setScheduleModalVisible,
  setScheduleModalMode,
  setModalLoading,
  setSelectedMainType,
  setSelectedCategory,
  setItItems,
  fetchCategoriesByMainTypeLocal,
  fetchSubCategoriesByCategoryLocal,
  fetchITItems,
 });

 const { category, subcategory, schedule, selectedDate, selectedTime } = location.state || {};

 const timelineItems = useMemo(() => {
  if (!selectedSchedule) return [];

  return [
   {
    label: 'Created',
    children: (
     <div>
      <p>
       <strong>Date:</strong>{' '}
       {selectedSchedule.created_date}
      </p>
      <p>
       <strong>By:</strong>{' '}
       {selectedSchedule.created_by}
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
       <strong>Date:</strong>{' '}
       {selectedSchedule.date}
      </p>
      <p>
       <strong>Time:</strong>{' '}
       {selectedSchedule.start_time} -{' '}
       {selectedSchedule.end_time}
      </p>
      <p>
       <strong>Team:</strong>{' '}
       {selectedSchedule.team}
      </p>
     </div>
    ),
    color: 'blue',
   },
   ...(selectedSchedule.status ===
    'completed'
    ? [
     {
      label: 'Completed',
      children: (
       <div>
        <p>
         Maintenance completed
         successfully
        </p>
       </div>
      ),
      color: 'green',
     },
    ]
    : []),
  ];
 }, [selectedSchedule]);





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

 const handleModalDelete = useCallback(() => {
  if (!modalInitialValues) return;
  handleDelete(modalInitialValues.id);
 }, [modalInitialValues, handleDelete]);


const handleAddSchedule = useCallback(() => {
  setScheduleModalMode('add');
  setModalInitialValues(null);
  setScheduleModalVisible(true);

}, []);

 // Helper function to get date range based on view type
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
       dateRange={dateRange}
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
