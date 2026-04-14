// fe\src\pages\MaintenanceSchedule\components\GanttChart.jsx
import React, { useMemo } from 'react';
import {
 formatDateKey,
 parseDateKeyToDate,
 toDateObject,
 buildDateSlots,
 isDateInRange,
} from '../utils/ganttDate';
import {
 createBookingSlot,
 groupByDate,
 collectDateKeys,
 getScheduleDateRange,
} from '../utils/ganttBooking';
import { buildTimeSlots } from '../utils/ganttView';
import useMonthlyOverlay from '../hooks/gantt/useMonthlyOverlay';
import useYearlyOverlay from '../hooks/gantt/useYearlyOverlay';
import {
 format,
 startOfDay,
 startOfMonth,
 endOfMonth,
} from 'date-fns';
import DailyGanttChart from './gantt/DailyGanttChart';
import WeeklyGanttChart from './gantt/WeeklyGanttChart';
import MonthlyGanttChart from './gantt/MonthlyGanttChart';
import YearlyGanttChart from './gantt/YearlyGanttChart';
import { MONTH_COLUMNS } from './gantt/MONTHS';
import './GanttChart.css';

export default function GanttChart({ scheduleData = [], onEdit, viewType = 'yearly', dateRange = {} }) {
 const timeSlots = useMemo(buildTimeSlots, []);
 const groupedSchedule = useMemo(() => groupByDate(scheduleData), [scheduleData]);
 const scheduleEntries = Object.entries(groupedSchedule);
 const isDaily = viewType === 'daily';
 const isWeekly = viewType === 'weekly';
 const isMonthly = viewType === 'monthly';
 const isYearly = viewType === 'yearly';
 const dateSlots = useMemo(() => buildDateSlots(dateRange, viewType), [dateRange, viewType]);
 const scheduleDateRange = useMemo(() => getScheduleDateRange(scheduleData), [scheduleData]);

 const selectedDailyKey =
  formatDateKey(dateRange?.start) ||
  formatDateKey(new Date());

 const dailyEntry = groupedSchedule[selectedDailyKey] || {
  key: selectedDailyKey,
  data: [],
  bookStatus: 'planned',
 };

 const slotCount = isDaily ? 1 : isWeekly ? timeSlots.length : Math.max(dateSlots.length, 1);
 const dailyColumnTemplate = 'minmax(120px, 180px) 1fr';
 const lineSlots = Array.from({ length: slotCount }, (_, idx) => idx);

 const filteredEntries = useMemo(() => {
  if (isDaily) return [];

  return scheduleEntries.filter(([dateKey]) =>
   isDateInRange(dateKey, dateRange)
  );
 }, [isDaily, scheduleEntries, dateRange]);

 const monthlySlots = useMemo(() => {
  if (!isMonthly) return [];

  const anchor =
   scheduleDateRange.start ||
   toDateObject(dateRange.start) ||
   scheduleDateRange.end ||
   new Date();

  const range = {
   start: startOfMonth(anchor),
   end: endOfMonth(anchor),
  };

  return buildDateSlots(range, 'monthly');
 }, [
  isMonthly,
  scheduleDateRange.start,
  scheduleDateRange.end,
  dateRange.start,
 ]);

 const weeklyRange = useMemo(() => {
  if (!isWeekly) return null;

  const start = toDateObject(dateRange?.start);
  const end = toDateObject(dateRange?.end);

  if (!start || !end) return null;

  return { start, end };
 }, [isWeekly, dateRange?.start, dateRange?.end]);

 const weeklySlots = useMemo(() => {
  return isWeekly
   ? buildDateSlots(weeklyRange || dateRange, 'weekly')
   : [];
 }, [isWeekly, weeklyRange, dateRange]);

 const weeklyRowKeys = useMemo(() => {
  if (!isWeekly) return [];

  return weeklySlots
   .map((slot) => slot.key)
   .filter(Boolean);
 }, [isWeekly, weeklySlots]);

 const monthlyRowsForView = useMemo(() => {
  if (!isMonthly) return [];

  return monthlySlots.map((slot) => {
   const bookingObj = groupedSchedule[slot.key] || {
    data: [],
    bookStatus: 'available',
    key: slot.key,
   };

   return {
    dateKey: slot.key,
    bookingObj,
    dayNumber: slot.start ? format(slot.start, 'dd') : '--',
    monthLabel: slot.start ? format(slot.start, 'MMM') : '',
   };
  });
 }, [isMonthly, monthlySlots, groupedSchedule]);

 const rowsForView = useMemo(() => {
  if (isDaily) return [];

  if (isWeekly) {
   return weeklyRowKeys.map((dateKey) => {
    const slotEntry = weeklySlots.find(
     (slot) => slot.key === dateKey
    );

    const bookingObj = groupedSchedule[dateKey] || {
     data: [],
     bookStatus: 'available',
     key: dateKey,
    };

    return {
     dateKey,
     bookingObj,
     dayNumber: slotEntry?.start
      ? format(slotEntry.start, 'dd')
      : '--',
     monthLabel: slotEntry?.start
      ? format(slotEntry.start, 'MMM')
      : '',
    };
   });
  }

  return filteredEntries.map(([tanggal, bookingObj]) => ({
   dateKey: tanggal,
   bookingObj,
  }));
 }, [
  isDaily,
  isWeekly,
  weeklyRowKeys,
  weeklySlots,
  groupedSchedule,
  filteredEntries,
 ]);

 const weeklyRowIndexMap = useMemo(
  () =>
   rowsForView.reduce((acc, row, index) => {
    if (row?.dateKey) {
     acc[row.dateKey] = index + 1;
    }
    return acc;
   }, {}),
  [rowsForView],
 );
 const weeklyOverlayBookings = useMemo(() => {
  if (!isWeekly || !rowsForView.length) {
   return [];
  }
  return (scheduleData || [])
   .flatMap((item) => {
    const dateKeys = collectDateKeys(item);
    if (!dateKeys.length) return [];
    return dateKeys
     .map((dateKey) => {
      const rowStart = weeklyRowIndexMap[dateKey];
      if (!rowStart) return null;
      const bookingSlot = createBookingSlot({
       ...item,
       date: dateKey,
      });
      return {
       ...bookingSlot,
       rowStart,
       rowEnd: rowStart + 1,
      };
     })
     .filter(Boolean);
   })
   .filter(Boolean);
 }, [isWeekly, scheduleData, weeklyRowIndexMap, rowsForView]);
 const monthlyRowIndexMap = useMemo(
  () =>
   monthlyRowsForView.reduce((acc, row, index) => {
    const normalizedKey = formatDateKey(row.dateKey);

    if (normalizedKey) {
     acc[normalizedKey] = index + 1;
    }

    return acc;
   }, {}),
  [monthlyRowsForView],
 );
 const monthlyStartDate = monthlySlots[0]?.start
  ? startOfDay(monthlySlots[0].start)
  : null;

 const monthlyOverlayBookings =
  useMonthlyOverlay({
   isMonthly,
   monthlyRowsForView,
   monthlyStartDate,
   monthlyRowIndexMap,
   scheduleData,
  });

 // Yearly view data
 const yearlyRowsForView = useMemo(() => {
  if (!isYearly) return [];

  return Array.from({ length: 4 }, (_, i) => ({
   weekKey: `w${i + 1}`,
   weekLabel: `W${i + 1}`,
   bookingObj: {
    data: [],
    bookStatus: 'available',
   },
  }));
 }, [isYearly]);

 const yearlyLineSlots = useMemo(
  () =>
   isYearly
    ? Array.from(
     { length: MONTH_COLUMNS.length || 12 },
     (_, i) => i
    )
    : [],
  [isYearly]
 );


 const yearlyOverlayBookings =
  useYearlyOverlay({
   isYearly,
   scheduleData,
  });



 return (
  <div className="gantt-wrapper">
   {isDaily && (
    <div className="gantt-wrapper daily-gantt-wrapper">
     <div className="gantt daily-gantt" style={{ '--slot-count': slotCount }}>
      <DailyGanttChart
       dailyEntry={dailyEntry}
       columnTemplate={dailyColumnTemplate}
       selectedDate={selectedDailyKey}
       onEdit={onEdit}
      />
     </div>
    </div>
   )}
   {isWeekly && (
    <div className="gantt-wrapper weekly-gantt-wrapper">
     <div className="gantt weekly-gantt" style={{ '--slot-count': slotCount }}>
      <WeeklyGanttChart
       headerColumns={timeSlots}
       rowsForView={rowsForView}
       lineSlots={lineSlots}
       onEdit={onEdit}
       overlayBookings={weeklyOverlayBookings}
      />
     </div>
    </div>
   )}
   {isMonthly && (
    <div className="monthly-gantt-wrapper">
     <MonthlyGanttChart
      headerColumns={[
       { key: 'w1', label: 'W1' },
       { key: 'w2', label: 'W2' },
       { key: 'w3', label: 'W3' },
       { key: 'w4', label: 'W4' },
       { key: 'w5', label: 'W5' },
      ]}
      rowsForView={monthlyRowsForView}
      lineSlots={monthlyRowsForView}
      onEdit={onEdit}
      overlayBookings={monthlyOverlayBookings}
     />
    </div>
   )}
   {isYearly && (
    <div className="yearly-gantt-wrapper">
     <YearlyGanttChart
      headerColumns={MONTH_COLUMNS}
      rowsForView={yearlyRowsForView}
      lineSlots={yearlyLineSlots}
      onEdit={onEdit}
      overlayBookings={yearlyOverlayBookings}
     />
    </div>
   )}
  </div>
 );
}
