import React, { useMemo } from 'react';
import { FaBuilding, FaUserAlt } from 'react-icons/fa';

const WeeklyGanttChart = ({
  headerColumns = [],
  rowsForView = [],
  lineSlots = [],
  onEdit,
  overlayBookings = [],
}) => {
  const slotCount = Math.max(headerColumns.length, 1);
  const columnTemplate = `80px repeat(${slotCount}, minmax(100px, 1fr))`;

  const normalizedLineSlots =
    Array.isArray(lineSlots) && lineSlots.length
      ? lineSlots
      : [...Array(slotCount).keys()];

  const rowCount = rowsForView.length;
  const overlayStyle = useMemo(
    () => ({
      '--gantt-row-count': rowCount,
    }),
    [rowCount],
  );
  const wrapperStyle = useMemo(
    () => ({
      '--gantt-row-count': rowCount,
      '--gantt-slot-count': slotCount,
    }),
    [rowCount, slotCount],
  );

  if (!rowsForView.length) {
    return (
      <div className="p-5 text-center text-muted">
        Tidak ada jadwal tersedia.
      </div>
    );
  }

  return (
    <div className="weekly-gantt-container">
      <div className="gantt__grid" style={{ '--gantt-column-template': columnTemplate }}>
        <div className="gantt__row gantt__row--months">
          <div className="gantt__row-first">
            <div className="date-display">
              <div className="fw-bold">TANGGAL</div>
              <div className="small">&nbsp;</div>
            </div>
          </div>

          {headerColumns.map((slot, idx) => (
            <div key={`slot-${slot.key ?? idx}`} className="gantt__header-cell">
              {slot.label}
            </div>
          ))}
        </div>
        <div className="gantt__row-body">
          <div className="gantt__row-wrapper" style={wrapperStyle}>
            {rowsForView.map((row) => {
              const bookingObj = row.bookingObj || {
                data: [],
                bookStatus: 'available',
              };

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

                  <div className="gantt__row--lines" aria-hidden="true">
                    {normalizedLineSlots.map((slotIndex) => (
                      <span key={`slot-${row.dateKey}-${slotIndex}`} />
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

            {overlayBookings.length > 0 && (
              <ul className="gantt__row-bars gantt__row-bars--overlay" style={overlayStyle}>
                {overlayBookings.map((booking, index) => {
                  const columnStart = booking.min ?? 2;
                  const columnEnd =
                    booking.max ??
                    (columnStart +
                      Math.max(1, typeof booking.duration === 'number' ? booking.duration : 1));
                  const title =
                    booking.planName ||
                    booking.maintenanceType ||
                    booking.workOrderType ||
                    booking.subject ||
                    'Jadwal maintenance';
                  const technician =
                    booking.pic ||
                    booking.technician ||
                    booking.userName ||
                    booking.team ||
                    'PIC belum ditentukan';
                  const asset =
                    booking.hostname ||
                    booking.assetName ||
                    booking.equipment ||
                    booking.location ||
                    'Asset belum tersedia';
                  const schedule = booking.rangeLabel || booking.date || 'Waktu belum tersedia';

                  return (
                    <li
                      key={`${booking.id ?? ''}-${index}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${title} ${schedule}`}
                      className={`booking-item-card ${booking.bookStatus || 'available'}`}
                      style={{
                        gridRow: `${booking.rowStart} / ${booking.rowEnd}`,
                        gridColumn: `${columnStart} / ${columnEnd}`,
                      }}
                      onClick={() => onEdit?.(booking.originalData || booking)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onEdit?.(booking.originalData || booking);
                        }
                      }}
                    >
                      <div className="booking-inner-content h-100 d-flex flex-column">
                        <div className="booking-title text-truncate fw-bold mb-1" style={{ fontSize: '11px' }}>
                          {title}
                        </div>
                        <div className="booking-meta-line d-flex justify-content-between align-items-center">
                          <span className="fst-italic" style={{ fontSize: '10px' }}>
                            {schedule}
                          </span>
                          <span className="text-muted" style={{ fontSize: '9px' }}>
                            {booking.bookStatus || 'Tersedia'}
                          </span>
                        </div>
                        <div className="booking-details-grid mt-2">
                          <div className="booking-meta text-truncate">
                            <FaUserAlt size={9} className="me-1 opacity-75" />
                            <span>{technician}</span>
                          </div>
                          <div className="booking-meta text-truncate">
                            <FaBuilding size={9} className="me-1 opacity-75" />
                            <span>{asset}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGanttChart;
