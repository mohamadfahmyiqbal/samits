import React from 'react';
import { format, parseISO, isValid } from 'date-fns';

const STATUS_COLORS = {
 available: 'linear-gradient(90deg, #0178bc 0%, #00bdda 100%)',
 running: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
 completed: 'linear-gradient(90deg, #28a745 0%, #4cd964 100%)',
 locked: 'linear-gradient(90deg, #ed213a 0%, #93291e 100%)',
 cancelled: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
};

const WORKING_HOURS = Array.from({ length: 10 }, (_, idx) => `${String(8 + idx).padStart(2, '0')}:00`);

const parseDateValue = (value) => {
 if (value instanceof Date && !Number.isNaN(value.getTime())) {
  return value;
 }

 if (typeof value === 'string') {
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
 }

 return null;
};

const buildRangeLabel = (dateRange = {}, rows = []) => {
 const startFromRange = parseDateValue(dateRange.start);
 const endFromRange = parseDateValue(dateRange.end);
 const fallbackStart = rows[0] ? parseDateValue(rows[0].dateKey) : null;
 const fallbackEnd = rows[rows.length - 1] ? parseDateValue(rows[rows.length - 1].dateKey) : null;
 const start = startFromRange || fallbackStart;
 const end = endFromRange || fallbackEnd;

 if (start && end) {
  return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
 }

 if (start) {
  return format(start, 'dd MMM yyyy');
 }

 if (end) {
  return format(end, 'dd MMM yyyy');
 }

 return 'Rentang tidak tersedia';
};

const WeeklyGanttChart = ({
 rowsForView = [],
 dateSlots = [],
 dateRange = {},
 onEdit,
}) => {
 if (!rowsForView.length) {
  return <div className="p-5 text-center text-muted">Tidak ada jadwal tersedia.</div>;
 }

 const columns =
  dateSlots.length > 0
   ? dateSlots.map((slot) => ({
    ...slot,
    date: parseDateValue(slot.start),
   }))
   : rowsForView.map((row) => ({
    key: row.dateKey,
    label: row.dateKey,
    date: parseDateValue(row.dateKey),
   }));

 const rangeLabel = buildRangeLabel(dateRange, rowsForView);

 const renderBookingBlocks = (bookings = []) =>
  bookings.map((booking, idx) => {
   const key = booking.id || `${booking.date || 'row'}-${idx}`;
   const gradient = STATUS_COLORS[booking.bookStatus] || STATUS_COLORS.available;

   return (
    <span
     key={key}
     className="weekly-task-block"
     title={`${booking.subject || 'Jadwal maintenance'}${booking.rangeLabel ? ` • ${booking.rangeLabel}` : ''
      }`}
     style={{ background: gradient, cursor: onEdit ? 'pointer' : 'default' }}
     onClick={() => onEdit && onEdit(booking.originalData || booking)}
    />
   );
  });

 return (
  <div className="weekly-gantt-table">
   <div className="weekly-gantt-title">
    <div className="weekly-gantt-headline">Weekly Schedule</div>
    <div className="weekly-gantt-range">{rangeLabel}</div>
   </div>

   <div className="weekly-gantt-grid">
    <div className="weekly-grid-header">
          <span>TASK</span>
     {columns.map((slot) => {
      const date = slot.date && isValid(slot.date) ? slot.date : null;
      return (
       <span key={slot.key || slot.label}>
        <div className="weekly-grid-day">{date ? format(date, 'EEE') : slot.label}</div>
        <div className="weekly-grid-date">{date ? format(date, 'dd MMM') : slot.label}</div>
       </span>
      );
     })}
    </div>

        {rowsForView.map((row, rowIndex) => {
          const bookingObj = row.bookingObj || {};
          const dayBookings = bookingObj.data || [];
          const hasBookings = dayBookings.length > 0;

          return (
           <div key={row.dateKey} className="weekly-grid-row">
             <span className="weekly-task-name">
               <span className="weekly-task-hour-label">
                {WORKING_HOURS[rowIndex % WORKING_HOURS.length]}
               </span>
             </span>

       {columns.map((slot) => {
        const isCurrentSlot = slot.key === row.dateKey || slot.label === row.dateKey;
        const cellKey = `${row.dateKey}-${slot.key || slot.label}`;
        const cellClass = `weekly-grid-cell ${isCurrentSlot && hasBookings ? 'weekly-grid-cell--filled' : ''
         }`;

        return (
         <span key={cellKey} className={cellClass}>
          {isCurrentSlot ? (
           hasBookings ? (
            renderBookingBlocks(dayBookings)
           ) : (
            <span className="weekly-task-empty">Belum ada jadwal</span>
           )
          ) : (
           <span className="weekly-task-empty">&nbsp;</span>
          )}
         </span>
        );
       })}
      </div>
     );
    })}
   </div>

   <div className="weekly-gantt-legend">
    Jadwal ditampilkan sebagai blok warna; klik untuk membuka detail.
   </div>
  </div>
 );
};

WeeklyGanttChart.displayName = 'WeeklyGanttChart';
export default WeeklyGanttChart;
