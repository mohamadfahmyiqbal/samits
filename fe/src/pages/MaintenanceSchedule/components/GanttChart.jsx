import React, { memo, useMemo } from 'react';
import {
 format,
 parseISO,
 startOfDay,
 endOfDay,
 startOfMonth,
 endOfMonth,
 eachDayOfInterval,
 eachMonthOfInterval,
 isWithinInterval,
 addDays,
} from 'date-fns';
import './GanttChart.css';
import DailyGanttChart from './gantt/DailyGanttChart';
import WeeklyGanttChart from './gantt/WeeklyGanttChart';
import MonthlyGanttChart from './gantt/MonthlyGanttChart';
import YearlyGanttChart from './gantt/YearlyGanttChart';

const buildTimeSlots = () =>
 Array.from({ length: 10 }, (_, idx) => {
  const hour = 8 + idx;
  const next = hour + 1;
  return {
   key: idx,
   label: `${String(hour).padStart(2, '0')}:00`,
   range: `${String(hour).padStart(2, '0')}:00 - ${String(next).padStart(2, '0')}:00`,
  };
 });

const workingHours = Array.from({ length: 10 }, (_, idx) => 8 + idx);

const parseHourFromValue = (value) => {
 if (typeof value === 'string') {
  const trimmed = value.trim();
  const isoCandidate = trimmed.includes('T') ? trimmed : `1970-01-01T${trimmed}`;
  const parsedIso = parseISO(isoCandidate);
  if (!Number.isNaN(parsedIso.getTime())) return parsedIso.getHours();
  const [hourString] = trimmed.split(':');
  const parsedHour = Number(hourString);
  if (!Number.isNaN(parsedHour)) return parsedHour;
 }
 if (value instanceof Date && !Number.isNaN(value.getTime())) {
  return value.getHours();
 }
 return null;
};

const workdayStartMinutes = 8 * 60;
const workdayEndMinutes = 17 * 60;
const minuteInterval = 10;
const intervalsPerHour = 60 / minuteInterval;
const weeklyIntervalCount = Math.max(1, Math.ceil((workdayEndMinutes - workdayStartMinutes) / minuteInterval));
const weeklyFirstIntervalColumn = 2;
const weeklyLastIntervalLine = weeklyFirstIntervalColumn + weeklyIntervalCount;

const parseTimeToDate = (value) => {
 if (!value) return null;
 const trimmed = value.trim();
 if (trimmed === '') return null;
 const hasTimezone = /[Zz]|([-+]\d{2}:?\d{2})/.test(trimmed);
 const input = trimmed.includes('T')
  ? trimmed
  : hasTimezone
   ? trimmed
   : `1970-01-01T${trimmed}${trimmed.endsWith('Z') ? '' : 'Z'}`;
 const parsed = parseISO(input);
 return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatLocalTimeLabel = (value) => {
 const parsed = parseTimeToDate(value);
 return parsed ? format(parsed, 'HH:mm') : value || '--';
};

const normalizeTimeSlot = (timeString) => {
 if (!timeString) return 8;
 const parsed = parseTimeToDate(timeString);
 const hour = parsed ? parsed.getHours() : 8;
 return Math.min(17, Math.max(8, hour));
};

const clampMinute = (minute) => Math.max(workdayStartMinutes, Math.min(workdayEndMinutes, minute));

const formatDateKey = (value) => {
 if (!value) return null;
 if (value instanceof Date && !Number.isNaN(value.getTime())) {
  return format(value, 'yyyy-MM-dd');
 }
 if (typeof value === 'string') {
  const cleaned = value.replace(/Z$/, '').split('T')[0];
  return cleaned.slice(0, 10);
 }
 return null;
};

 const getDateKeysForItem = (item) => {
  const startKey =
   formatDateKey(item.start_date) ||
   formatDateKey(item.scheduledDate) ||
   formatDateKey(item.scheduled_date) ||
   formatDateKey(item.date) ||
   null;
  if (!startKey) return [];
  const endKey =
   formatDateKey(item.end_date) ||
   formatDateKey(item.scheduledEndDate) ||
   formatDateKey(item.scheduled_end_date) ||
   startKey;
  const startDate = parseISO(startKey);
  const endDate = parseISO(endKey);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
   return [startKey];
  }
  const keys = [];
  let cursor = startDate;
  while (cursor <= endDate) {
   keys.push(format(cursor, 'yyyy-MM-dd'));
   cursor = addDays(cursor, 1);
  }
  return keys;
 };

const createBookingSlot = (item) => {
 const startTime = item.start_time || item.scheduledStartTime;
 const endTime = item.end_time || item.scheduledEndTime;
 const startHour = normalizeTimeSlot(startTime);
 const endHour = Math.max(startHour + 1, normalizeTimeSlot(endTime || startTime));
 const duration = Math.max(1, endHour - startHour);
 const startDate = parseTimeToDate(startTime);
 const endDate = parseTimeToDate(endTime);
 const rawStartMinute = startDate ? startDate.getHours() * 60 + startDate.getMinutes() : workdayStartMinutes;
 const rawEndMinute = endDate ? endDate.getHours() * 60 + endDate.getMinutes() : rawStartMinute + 60;
 const normalizedStartMinute = Math.min(workdayEndMinutes - minuteInterval, Math.max(workdayStartMinutes, rawStartMinute));
 const normalizedEndMinute = Math.max(normalizedStartMinute + minuteInterval, Math.min(workdayEndMinutes, rawEndMinute));
 const intervalIndex = Math.floor((normalizedStartMinute - workdayStartMinutes) / minuteInterval);
 const verticalSpanMinutes = normalizedEndMinute - normalizedStartMinute;
 const horizontalSpanIntervals = Math.max(1, Math.ceil(verticalSpanMinutes / minuteInterval));
 const startRow = Math.floor((normalizedStartMinute - workdayStartMinutes) / minuteInterval) + 1;
 const spanRows = Math.max(1, Math.ceil(verticalSpanMinutes / minuteInterval));
 const startColumn = weeklyFirstIntervalColumn + intervalIndex;
 const rawEndColumn = startColumn + horizontalSpanIntervals;
 const endColumn = Math.max(startColumn + 1, Math.min(weeklyLastIntervalLine, rawEndColumn));
 const dateKey =
  formatDateKey(item.date) ||
  formatDateKey(item.scheduledDate) ||
  formatDateKey(item.start_date) ||
  null;
 return {
  ...item,
  startHour,
  endHour,
  duration,
  rangeLabel: `${formatLocalTimeLabel(startTime)} - ${formatLocalTimeLabel(endTime)}`,
  min: startColumn,
  max: endColumn,
  startRow,
  spanRows,
  bookStatus:
   item.status === 'completed'
    ? 'completed'
    : item.status === 'cancelled'
     ? 'locked'
     : item.status === 'in_progress'
      ? 'running'
      : 'available',
  dateKey,
  originalData: item.originalData || item,
 };
};

const groupByDate = (scheduleData) => {
 const grouped = {};
 (scheduleData || []).forEach((item) => {
  const dateKeys = getDateKeysForItem(item);
  if (!dateKeys.length) return;
  dateKeys.forEach((dateKey) => {
   if (!grouped[dateKey]) {
    grouped[dateKey] = {
     bookStatus: item.status,
     data: [],
     key: dateKey,
    };
   }
   grouped[dateKey].data.push(
    createBookingSlot({
     ...item,
     date: dateKey,
     scheduledDate: dateKey,
     start_date: dateKey,
    }),
   );
  });
 });
 return grouped;
};

const buildDateSlots = (range = {}, viewType = 'weekly') => {
 const { start, end } = range;
 if (!start || !end) return [];

 if (viewType === 'yearly') {
  return eachMonthOfInterval({
   start: startOfMonth(start),
   end: endOfMonth(end),
  }).map((date) => ({
   key: format(date, 'yyyy-MM'),
   label: format(date, 'MMM yyyy'),
   start: date,
  }));
 }

 const startDay = startOfDay(start);
 const endDay = endOfDay(end);
 return eachDayOfInterval({ start: startDay, end: endDay }).map((date) => ({
  key: format(date, 'yyyy-MM-dd'),
  label: format(date, 'dd MMM'),
  start: date,
 }));
};

const isDateInRange = (dateKey, range = {}) => {
 if (!dateKey) return false;
 if (!range.start && !range.end) return true;
 try {
  const parsed = parseISO(dateKey);
  const start = range.start ? startOfDay(range.start) : parsed;
  const end = range.end ? endOfDay(range.end) : parsed;
  return isWithinInterval(parsed, { start, end });
 } catch {
  return true;
 }
};

export default function GanttChart({ scheduleData = [], onEdit, viewType = 'weekly', dateRange = {} }) {
 const timeSlots = useMemo(buildTimeSlots, []);
 const groupedSchedule = useMemo(() => groupByDate(scheduleData), [scheduleData]);
 const scheduleEntries = Object.entries(groupedSchedule);
 const isDaily = viewType === 'daily';
 const isWeekly = viewType === 'weekly';
 const dailyDateKey =
  formatDateKey(dateRange.start) ||
  scheduleEntries[0]?.[0] ||
  format(new Date(), 'yyyy-MM-dd');
 const dailyEntry = groupedSchedule[dailyDateKey] || {
  data: [],
  bookStatus: 'available',
  key: dailyDateKey,
 };
 const dateSlots = useMemo(() => buildDateSlots(dateRange, viewType), [dateRange, viewType]);
 const slotCount = isDaily ? 1 : isWeekly ? timeSlots.length - 1: Math.max(dateSlots.length, 1);
 const nonDailyColumnTemplate = `8% 10% repeat(${slotCount}, 1fr)`;
 const columnTemplate = isDaily
  ? '8% repeat(1, minmax(0, 1fr))'
  : nonDailyColumnTemplate;
 const rowColumnTemplate = columnTemplate;
 const lineSlots = Array.from({ length: slotCount }, (_, idx) => idx);
 const filteredEntries = isDaily
  ? []
  : scheduleEntries.filter(([dateKey]) => isDateInRange(dateKey, dateRange));
 const weeklySlots = isWeekly ? buildDateSlots(dateRange, 'weekly') : [];
 const rowsForView = isDaily
  ? []
  : isWeekly
   ? weeklySlots.map((slot) => ({
    dateKey: slot.key,
    bookingObj: groupedSchedule[slot.key] || {
     data: [],
     bookStatus: 'available',
     key: slot.key,
    },
   }))
   : filteredEntries.map(([tanggal, bookingObj]) => ({
    dateKey: tanggal,
    bookingObj,
   }));
 const renderBody = () => {
  if (isDaily) {
   return (
    <DailyGanttChart
     dailyEntry={dailyEntry}
     workingHours={workingHours}
     columnTemplate={columnTemplate}
     onEdit={onEdit}
    />
   );
  }

  if (viewType === 'weekly') {
   return (
    <WeeklyGanttChart
     rowsForView={rowsForView}
     lineSlots={lineSlots}
     rowColumnTemplate={rowColumnTemplate}
     onEdit={onEdit}
    />
   );
  }

  if (viewType === 'monthly') {
   return (
    <MonthlyGanttChart
     rowsForView={rowsForView}
     lineSlots={lineSlots}
     rowColumnTemplate={rowColumnTemplate}
     onEdit={onEdit}
    />
   );
  }

  return (
   <YearlyGanttChart
    rowsForView={rowsForView}
    lineSlots={lineSlots}
    rowColumnTemplate={rowColumnTemplate}
    onEdit={onEdit}
   />
  );
 };

 return (
  <div className="gantt-master-container">
   <div className="gantt-wrapper">
    <div className="gantt" style={{ '--slot-count': slotCount }}>
     {renderBody()}
    </div>
   </div>
  </div>
 );
}
