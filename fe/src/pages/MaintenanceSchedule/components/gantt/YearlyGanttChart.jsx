import React, { useMemo } from 'react';
import { format, isValid, parseISO } from 'date-fns';

const STATUS_LABELS = {
  available: 'Tersedia',
  running: 'Berlangsung',
  completed: 'Selesai',
  locked: 'Terkunci',
  cancelled: 'Dibatalkan',
};

const STATUS_PRIORITY = ['locked', 'cancelled', 'running', 'completed', 'available'];

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

const pickPriorityStatus = (statuses) => {
  for (const status of STATUS_PRIORITY) {
    if (statuses.has(status)) {
      return status;
    }
  }
  return 'available';
};

const YearlyGanttChart = ({ rowsForView = [], onEdit }) => {
  const monthlySummaries = useMemo(() => {
    const buckets = {};

    rowsForView.forEach((row) => {
      const parsedDate = parseDateValue(row.dateKey);
      const bucketKey = parsedDate ? format(parsedDate, 'yyyy-MM') : row.dateKey;

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          label: parsedDate ? format(parsedDate, 'MMMM yyyy') : row.dateKey,
          bookings: [],
          statuses: new Set(),
        };
      }

      const bookingList = row.bookingObj?.data || [];
      buckets[bucketKey].bookings.push(...bookingList);
      if (row.bookingObj?.bookStatus) {
        buckets[bucketKey].statuses.add(row.bookingObj.bookStatus);
      }
    });

    return Object.entries(buckets)
      .map(([key, value]) => ({
        key,
        ...value,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [rowsForView]);

  if (!monthlySummaries.length) {
    return <div className="monthly-gantt-empty-slot">Tidak ada data tahunan.</div>;
  }

  return (
    <div className="monthly-gantt-list">
      {monthlySummaries.map((bucket) => {
        const status = pickPriorityStatus(bucket.statuses);
        const statusLabel = STATUS_LABELS[status] || STATUS_LABELS.available;
        const bookings = bucket.bookings || [];
        return (
          <article key={bucket.key} className="monthly-gantt-row">
            <div className="monthly-gantt-header">
              <div className="monthly-gantt-date">{bucket.label}</div>
              <div className="monthly-gantt-status">{statusLabel}</div>
            </div>
            <div className="monthly-gantt-bars">
              {bookings.length ? (
                bookings.slice(0, 3).map((booking, index) => (
                  <button
                    key={`${bucket.key}-${booking.id || index}`}
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
                <div className="monthly-gantt-empty-slot">Tidak ada agenda untuk bulan ini.</div>
              )}
              {bookings.length > 3 && (
                <div className="monthly-gantt-task-additional">
                  Menampilkan 3 dari {bookings.length} agenda untuk bulan ini.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

YearlyGanttChart.displayName = 'YearlyGanttChart';
export default YearlyGanttChart;
