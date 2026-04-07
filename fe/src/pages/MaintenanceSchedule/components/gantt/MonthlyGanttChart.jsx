import React, { useMemo } from 'react';
import BookingBar from './BookingBar';

const WEEK_COLUMNS = [
  { key: 'w1', label: 'W1' },
  { key: 'w2', label: 'W2' },
  { key: 'w3', label: 'W3' },
  { key: 'w4', label: 'W4' },
];

const MonthlyGanttChart = ({ rowsForView = [], overlayBookings = [], onEdit }) => {
  const slotCount = WEEK_COLUMNS.length;
  const columnTemplate = `80px repeat(${slotCount}, minmax(100px, 1fr))`;
  const rowCount = rowsForView.length;
  const rowCountStyle = useMemo(
    () => ({
      '--gantt-row-count': rowCount,
    }),
    [rowCount],
  );

  if (!rowsForView.length) {
    return <div className="monthly-gantt-empty-slot">Belum ada jadwal bulanan.</div>;
  }

  return (
    <div className="monthly-gantt-chart">
      <div className="gantt__grid" style={{ '--gantt-column-template': columnTemplate }}>
        <div className="gantt__row gantt__row--months">
          <div className="gantt__row-first">
            <div className="date-display">
              <div className="fw-bold">TANGGAL</div>
              <div className="small">&nbsp;</div>
            </div>
          </div>

          {WEEK_COLUMNS.map((column) => (
            <div key={column.key} className="gantt__header-cell">
              {column.label}
            </div>
          ))}
        </div>
        <div className="gantt__row-body">
          <div className="gantt__row-wrapper" style={rowCountStyle}>
            {rowsForView.map((row) => {
              const bookingObj = row.bookingObj || { data: [], bookStatus: 'available' };
              const bookings = Array.isArray(bookingObj.data) ? bookingObj.data : [];
              const dayLabel = row.dayNumber || '--';
              const monthLabel = row.monthLabel || '';

              return (
                <div key={row.dateKey} className="gantt__row">
                  <div className="gantt__row-first">
                    <div className="date-display">
                      <div className="fw-bold">{dayLabel}</div>
                      <div className="small">{monthLabel}</div>
                    </div>
                  </div>

                  <div className="gantt__row--lines">
                    {WEEK_COLUMNS.map((column) => (
                      <span key={`line-${row.dateKey}-${column.key}`} />
                    ))}
                  </div>

                  {!bookings.length && (
                    <div
                      className="gantt__no-schedule"
                      style={{ gridColumn: `2 / span ${slotCount}` }}
                    >
                      Tidak ada jadwal untuk hari ini.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {overlayBookings.length > 0 && (
            <ul
              className="gantt__row-bars gantt__row-bars--overlay"
              style={rowCountStyle}
            >
              {overlayBookings.map((booking, index) => (
                <BookingBar
                  key={`${booking.id ?? ''}-${index}`}
                  data={booking}
                  onClick={() => onEdit?.(booking.originalData || booking)}
                  gridRowStart={booking.rowStart}
                  gridRowEnd={booking.rowEnd}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

MonthlyGanttChart.displayName = 'MonthlyGanttChart';
export default MonthlyGanttChart;
