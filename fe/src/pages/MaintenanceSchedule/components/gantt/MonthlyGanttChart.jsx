import React from 'react';
import { format, isValid, parseISO } from 'date-fns';

const STATUS_LABELS = {
  available: 'Tersedia',
  running: 'Berlangsung',
  completed: 'Selesai',
  locked: 'Terkunci',
  cancelled: 'Dibatalkan',
};

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

const MonthlyGanttChart = ({ rowsForView = [], onEdit }) => {
  if (!rowsForView.length) {
    return <div className="monthly-gantt-empty-slot">Belum ada jadwal bulanan.</div>;
  }

  return (
    <div className="monthly-gantt-list">
      {rowsForView.map((row) => {
        const parsedDate = parseDateValue(row.dateKey);
        const label = parsedDate ? format(parsedDate, 'dd MMM yyyy') : row.dateKey;
        const bookingObj = row.bookingObj || {};
        const bookings = bookingObj.data || [];
        const statusLabel = STATUS_LABELS[bookingObj.bookStatus] || STATUS_LABELS.available;

        return (
          <article key={row.dateKey} className="monthly-gantt-row">
            <div className="monthly-gantt-header">
              <div className="monthly-gantt-date">{label}</div>
              <div className="monthly-gantt-status">{statusLabel}</div>
            </div>
            <div className="monthly-gantt-bars">
              {bookings.length ? (
                bookings.map((booking, index) => (
                  <button
                    key={`${row.dateKey}-${booking.id || index}`}
                    type="button"
                    className="monthly-gantt-task"
                    onClick={() => onEdit && onEdit(booking.originalData || booking)}
                  >
                    <span className="monthly-gantt-task-title">
                      {booking.subject || booking.equipment || 'Jadwal maintenance'}
                    </span>
                    <span className="monthly-gantt-task-info">
                      {booking.rangeLabel || booking.date || 'Waktu belum tersedia'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="monthly-gantt-empty-slot">Belum ada agenda untuk tanggal ini.</div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

MonthlyGanttChart.displayName = 'MonthlyGanttChart';
export default MonthlyGanttChart;
