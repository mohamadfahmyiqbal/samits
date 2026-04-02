import React, { memo, useMemo } from 'react';
import { FaUsers, FaIdCardAlt, FaBuilding, FaUserAlt } from 'react-icons/fa';
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
} from 'date-fns';
import './GanttChart.css';

const BookingBar = memo(({ data, onClick }) => {
 const startHour = typeof data.min === 'number' ? data.min : 1;
 const endHour = typeof data.max === 'number' ? data.max + 1 : startHour + 1;
 return (
  <li
   className={`booking-item-card ${data.bookStatus || 'available'}`}
   style={{
    gridColumn: `${startHour} / ${endHour}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
   }}
   onClick={() => onClick && onClick(data.originalData || data)}
  >
   <div className="booking-inner-content h-100 d-flex flex-column">
    <div className="booking-title text-truncate fw-bold mb-auto" style={{ fontSize: '11px' }}>
     {data.subject || 'No Subject'}
    </div>
    <div className="booking-details-grid mt-1">
     <div className="booking-meta text-truncate">
      <FaUserAlt size={9} className="me-1 opacity-75" />
      <span>{data.userName || data.team || 'Unknown PIC'}</span>
      <span className="mx-1 opacity-50">|</span>
      <span>{data.userDept || data.team || '-'}</span>
     </div>
     <div className="booking-meta text-truncate">
      <FaUsers size={10} className="me-1 opacity-75" />
      <span>{data.attendee || '0'} Attendees</span>
     </div>
     <div className="booking-meta text-truncate">
      <FaIdCardAlt size={10} className="me-1 opacity-75" />
      <span>{data.visitorName || 'No Visitor'}</span>
     </div>
     <div className="booking-meta text-truncate">
      <FaBuilding size={9} className="me-1 opacity-75" />
      <span>{data.location || data.subject}</span>
     </div>
    </div>
   </div>
  </li>
 );
});

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
 const normalizedStartMinute = Math.min(workdayEndMinutes - 10, Math.max(workdayStartMinutes, rawStartMinute));
 const normalizedEndMinute = Math.max(normalizedStartMinute + 10, Math.min(workdayEndMinutes, rawEndMinute));
 const startRow = Math.floor((normalizedStartMinute - workdayStartMinutes) / 10) + 1;
 const spanRows = Math.max(1, Math.ceil((normalizedEndMinute - normalizedStartMinute) / 10));
 const startColumn = startHour - 7 + 1;
 const endColumn = startColumn + duration;
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
  const dateKey =
   formatDateKey(item.date) ||
   formatDateKey(item.scheduledDate) ||
   formatDateKey(item.start_date) ||
   null;
  if (!dateKey) return;
  if (!grouped[dateKey]) {
   grouped[dateKey] = {
    bookStatus: item.status,
    data: [],
    key: dateKey,
   };
  }
  grouped[dateKey].data.push(createBookingSlot(item));
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
const slotCount = isDaily ? 1 : isWeekly ? timeSlots.length : Math.max(dateSlots.length, 1);
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
const headerColumns = isDaily
 ? [{ key: 'task', label: 'TUGAS' }]
 : isWeekly
  ? timeSlots
  : dateSlots.length
   ? dateSlots
   : lineSlots.map((slot) => ({ key: `slot-${slot}`, label: '-' }));

return (
 <div className="gantt-master-container">
  <div className="gantt-wrapper">
   <div className="gantt" style={{ '--slot-count': slotCount }}>
    <div className={`gantt__row gantt__row--months${isDaily ? ' gantt__row--daily-header' : ''}`}>
     <span className="gantt__cell">{isDaily ? 'JAM' : 'TANGGAL'}</span>
     {headerColumns.map((slot) => (
      <span key={slot.key} className="gantt__cell">
       {slot.label}
      </span>
     ))}
    </div>

    {isDaily ? (
     <div className="gantt__row gantt__row--daily">
      <div className="daily-hour-axis">
       {workingHours.map((hour, idx) => (
        <div
         key={`hour-${hour}`}
         className="daily-hour-label"
         style={{ gridRow: `${idx * 6 + 1} / span 6` }}
        >
         {`${String(hour).padStart(2, '0')}:00`}
        </div>
       ))}
      </div>
      <div className="daily-task-grid">
       {dailyEntry.data.length === 0 ? (
        <div className="daily-empty">Tidak ada jadwal pada jam ini</div>
       ) : (
        dailyEntry.data.map((task) => {
         const rowStart = task.startRow || 1;
         const spanHours = Math.max(1, task.spanRows || 1);
         return (
          <div
           key={`${task.id || task.subject}-${task.rangeLabel}`}
           className="daily-task-card daily-task-card--grid"
           style={{
            gridRow: `${rowStart} / span ${spanHours}`,
           }}
           onClick={() => onEdit && onEdit(task.originalData || task)}
          >
           <div className="daily-task-title">{task.subject || task.equipment}</div>
           <div className="daily-task-time">{task.rangeLabel}</div>
           <div className="daily-task-meta">
            <span>{task.team || task.userName || 'Unknown PIC'}</span>
            <span>{task.location || 'Lokasi belum tersedia'}</span>
           </div>
          </div>
         );
        })
       )}
      </div>
     </div>
    ) : rowsForView.length === 0 ? (
     <div className="p-5 text-center text-muted">Tidak ada jadwal tersedia.</div>
    ) : (
     rowsForView.map((row) => {
      const bookingObj = row.bookingObj;
      const dateKey = bookingObj.key || row.dateKey;
      const parsedDate = parseISO(dateKey);
      const dayNumber = format(parsedDate, 'dd');
      const monthLabel = format(parsedDate, 'MMM');
      const isLocked = ['expired', 'locked', 'cancelled'].includes(bookingObj.bookStatus);

      return (
       <div key={dateKey} className="gantt__row">
        <span className="gantt__cell">
         <div className="date-display">
          <div className="fw-bold">{dayNumber}</div>
          <div className="small text-muted">{monthLabel}</div>
         </div>
         <span className="text-muted mt-2 d-inline-block">
          {isLocked ? 'Locked' : 'Tersedia'}
         </span>
        </span>

        <div className="gantt__row--lines">
         <span></span>
         {lineSlots.map((slot) => (
          <span key={`line-${slot}`}></span>
         ))}
        </div>

        <ul className="gantt__row-bars">
         {bookingObj.data.map((data, i) => (
          <BookingBar
           key={data.id || `${dateKey}-${i}`}
           data={data}
           onClick={(item) => onEdit && onEdit(item)}
          />
         ))}
        </ul>
       </div>
      );
     })
    )}
   </div>
  </div>
 </div>
);
}
