import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, Row, Col, Button, Space, message, Select, DatePicker } from 'antd';
import { useLocation } from 'react-router-dom';
import { fetchActiveLogs, createLog } from '../../services/MaintenanceService';
import useDateRange from './hooks/gantt/useDateRange';
import useCategoryData from './hooks/data/useCategoryData';
import useMaintenanceTeam from './hooks/data/useMaintenanceTeam';
import useScheduleActions from './hooks/actions/useScheduleActions';
import { transformScheduleData } from './utils/transformScheduleData';
import DetailModal from './components/modals/DetailModal';
import ScheduleModal from './components/modals/ScheduleModal';
import GanttChart from './components/GanttChart';
import StatisticsCards from './components/cards/StatisticsCards';

const { Option } = Select;

const buildTimelineItems = (schedule) => {
 if (!schedule) return [];

 const items = [
  {
   label: 'Created',
   children: (
    <div>
     <p><strong>Date:</strong> {schedule.created_date}</p>
     <p><strong>By:</strong> {schedule.created_by}</p>
    </div>
   ),
   color: 'green',
  },
  {
   label: 'Scheduled',
   children: (
    <div>
     <p><strong>Date:</strong> {schedule.date}</p>
     <p><strong>Time:</strong> {schedule.start_time} - {schedule.end_time}</p>
     <p><strong>Team:</strong> {schedule.team}</p>
    </div>
   ),
   color: 'blue',
  },
 ];

 if (schedule.status === 'completed') {
  items.push({
   label: 'Completed',
   children: <div><p>Maintenance completed successfully</p></div>,
   color: 'green',
  });
 }

 return items;
};

export default function MaintenanceSchedule() {
 const location = useLocation();
 const hasCreatedFromWizard = useRef(false);

 const [scheduleData, setScheduleData] = useState([]);
 const [detailModalVisible, setDetailModalVisible] = useState(false);
 const [selectedSchedule, setSelectedSchedule] = useState(null);
 const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
 const [scheduleModalMode, setScheduleModalMode] = useState('add');
 const [modalInitialValues, setModalInitialValues] = useState(null);
 const [ganttViewType, setGanttViewType] = useState('weekly');
 const [selectedDateRange, setSelectedDateRange] = useState(null);
 const [modalLoading, setModalLoading] = useState(false);

 const dateRange = useDateRange(ganttViewType, selectedDateRange);

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
   if (response?.success) {
    setScheduleData(transformScheduleData(response.data));
   } else {
    setScheduleData([]);
   }
  } catch (error) {
   if (process.env.NODE_ENV === 'development') {
    console.error(error);
   }
   message.error('Gagal mengambil data jadwal');
   setScheduleData([]);
  }
 }, []);

 const createScheduleFromWizard = useCallback(async (wizardData) => {
  try {
   const payload = {
    hostname: Array.isArray(wizardData.hostname)
     ? wizardData.hostname[0]
     : wizardData.hostname,
    asset_main_type_id: wizardData.asset_main_type_id,
    category_id: wizardData.category_id,
    sub_category_id: wizardData.sub_category_id,
    start_date: wizardData.start_date?.format
     ? wizardData.start_date.format('YYYY-MM-DD')
     : wizardData.start_date,
    end_date: wizardData.end_date?.format
     ? wizardData.end_date.format('YYYY-MM-DD')
     : wizardData.end_date,
    start_time: wizardData.start_time?.format
     ? wizardData.start_time.format('HH:mm')
     : wizardData.start_time,
    end_time: wizardData.end_time?.format
     ? wizardData.end_time.format('HH:mm')
     : wizardData.end_time,
    team: wizardData.team,
    notes: wizardData.notes,
    priority: wizardData.priority || 'medium',
    estimated_duration: wizardData.estimated_duration || 2.0,
    recurrence: wizardData.recurrence,
    recurrence_interval: wizardData.recurrence_interval,
    recurrence_end_date: wizardData.recurrence_end_date?.format
     ? wizardData.recurrence_end_date.format('YYYY-MM-DD')
     : wizardData.recurrence_end_date,
    recurrence_count: wizardData.recurrence_count,
    selected_assets: wizardData.selected_assets,
   };

   const response = await createLog(payload);

   if (!response?.success) {
    message.error(response?.message || 'Gagal membuat jadwal');
    return false;
   }

   message.success('Jadwal maintenance berhasil dibuat!');
   await fetchSchedules();
   return true;
  } catch (error) {
   if (process.env.NODE_ENV === 'development') {
    console.error(error);
   }
   message.error('Gagal membuat jadwal');
   return false;
  }
 }, [fetchSchedules]);

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

 const {
  category,
  subcategory,
  schedule,
  selectedDate,
 } = location.state || {};

 useEffect(() => {
  Promise.all([
   fetchSchedules(),
   fetchCategories(),
   fetchMaintenanceTeam(),
  ]);
 }, [fetchSchedules, fetchCategories, fetchMaintenanceTeam]);

 useEffect(() => {
  if (
   hasCreatedFromWizard.current ||
   !category ||
   !subcategory ||
   !schedule
  ) {
   return;
  }

  hasCreatedFromWizard.current = true;

  const resolvedDate =
   typeof selectedDate?.format === 'function'
    ? selectedDate.format('YYYY-MM-DD')
    : selectedDate || new Date().toISOString().split('T')[0];

  const newSchedule = {
   hostname: schedule.hostname,
   asset_main_type_id: category.main_type_id,
   category_id: category.id,
   sub_category_id: subcategory.id,
   start_date: resolvedDate,
   end_date: resolvedDate,
   start_time: schedule.start_time || '09:00',
   end_time: schedule.end_time || '11:00',
   team: schedule.team_name || '',
   notes: schedule.notes || '',
   priority: schedule.priority || 'medium',
  };

  createScheduleFromWizard(newSchedule);
 }, [category, subcategory, schedule, selectedDate, createScheduleFromWizard]);

 const timelineItems = useMemo(
  () => buildTimelineItems(selectedSchedule),
  [selectedSchedule]
 );

 const handleModalDelete = useCallback(() => {
  if (modalInitialValues?.id) {
   handleDelete(modalInitialValues.id);
  }
 }, [modalInitialValues, handleDelete]);

 const handleAddSchedule = () => {
  setScheduleModalMode('add');
  setModalInitialValues(null);
  setScheduleModalVisible(true);
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
        <Select
         value={ganttViewType}
         onChange={setGanttViewType}
         style={{ width: 140 }}
        >
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
