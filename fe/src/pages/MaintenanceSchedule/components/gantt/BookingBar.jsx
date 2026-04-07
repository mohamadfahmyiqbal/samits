import React, { memo } from 'react';
import { FaBuilding, FaUserAlt } from 'react-icons/fa';

const BookingBar = memo(({ data, onClick, gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd }) => {
  const startHour = typeof data.min === 'number' ? data.min : 2;
  const endHour = typeof data.max === 'number' ? data.max : startHour + 1;
  const columnStart = gridColumnStart ?? startHour;
  const columnEnd = gridColumnEnd ?? endHour;

  const title =
    data.planName ||
    data.maintenanceType ||
    data.workOrderType ||
    'Jadwal maintenance';

  const technician =
    data.pic ||
    data.technician ||
    data.userName ||
    data.team ||
    'PIC belum ditentukan';

  const asset =
    data.hostname ||
    data.assetName ||
    data.equipment ||
    data.location ||
    'Asset belum tersedia';

  const schedule = data.rangeLabel || data.date || 'Waktu belum tersedia';

  return (
    <li
      role="button"
      tabIndex={0}
      aria-label={`${title} ${schedule}`}
      className={`booking-item-card ${data.bookStatus || 'available'}`}
      style={{
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
        gridColumn: `${columnStart} / ${columnEnd}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
      }}
      onClick={() => onClick?.(data.originalData || data)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(data.originalData || data);
        }
      }}
    >
      <div className="booking-inner-content h-100 d-flex flex-column">
        <div
          className="booking-title text-truncate fw-bold mb-1"
          style={{ fontSize: '11px' }}
        >
          {title}
        </div>

        <div className="booking-meta-line d-flex justify-content-between align-items-center">
          <span
            className="fst-italic"
            style={{ fontSize: '10px' }}
          >
            {schedule}
          </span>

          <span
            className="text-muted"
            style={{ fontSize: '9px' }}
          >
            {data.bookStatus || 'Tersedia'}
          </span>
        </div>

        <div className="booking-details-grid mt-2">
          <div className="booking-meta text-truncate">
            <FaUserAlt
              size={9}
              className="me-1 opacity-75"
            />
            <span>{technician}</span>
          </div>

          <div className="booking-meta text-truncate">
            <FaBuilding
              size={9}
              className="me-1 opacity-75"
            />
            <span>{asset}</span>
          </div>
        </div>
      </div>
    </li>
  );
});

BookingBar.displayName = 'BookingBar';

export default BookingBar;
