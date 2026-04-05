import React, { memo } from 'react';
import { FaUsers, FaIdCardAlt, FaBuilding, FaUserAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const BookingBar = memo(({ data, onClick }) => {
  const startHour = typeof data.min === 'number' ? data.min : 1;
  const endHour = typeof data.max === 'number' ? data.max + 1 : startHour + 1;
  
  const handleClick = () => {
    onClick && onClick(data.originalData || data);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${data.subject || 'No Subject'}. PIC: ${data.userName || data.team || 'Unknown PIC'}. Location: ${data.location || data.subject}`}
      aria-describedby={`booking-details-${data.id || 'unknown'}`}
    >
      <div className='booking-inner-content h-100 d-flex flex-column' id={`booking-details-${data.id || 'unknown'}`}>
        <div className='booking-title text-truncate fw-bold mb-auto' style={{ fontSize: '11px' }}>
          {data.subject || 'No Subject'}
        </div>
        <div className='booking-details-grid mt-1'>
          <div className='booking-meta text-truncate'>
            <FaUserAlt size={9} className='me-1 opacity-75' />
            <span>{data.userName || data.team || 'Unknown PIC'}</span>
            <span className='mx-1 opacity-50'>|</span>
            <span>{data.userDept || data.team || '-'}</span>
          </div>
          <div className='booking-meta text-truncate'>
            <FaUsers size={10} className='me-1 opacity-75' />
            <span>{data.attendee || '0'} Attendees</span>
          </div>
          <div className='booking-meta text-truncate'>
            <FaIdCardAlt size={10} className='me-1 opacity-75' />
            <span>{data.visitorName || 'No Visitor'}</span>
          </div>
          <div className='booking-meta text-truncate'>
            <FaBuilding size={9} className='me-1 opacity-75' />
            <span>{data.location || data.subject}</span>
          </div>
        </div>
      </div>
    </li>
  );
});

const WeeklyRow = memo(({ row, lineSlots, onEdit }) => {
  const bookingObj = row.bookingObj;
  const dateKey = bookingObj.key || row.dateKey;
  const parsedDate = parseISO(dateKey);
  const dayNumber = format(parsedDate, 'dd');
  const monthLabel = format(parsedDate, 'MMM');
  const isLocked = ['expired', 'locked', 'cancelled'].includes(bookingObj.bookStatus);

  return (
    <div key={dateKey} className='gantt__row'>
      <span className='gantt__cell'>
        <div className='date-display'>
          <div className='fw-bold'>{dayNumber}</div>
          <div className='small text-muted'>{monthLabel}</div>
        </div>
        <span className='text-muted mt-2 d-inline-block'>
          {isLocked ? 'Locked' : 'Tersedia'}
        </span>
      </span>

      <div className='gantt__row--lines'>
        <span></span>
        {lineSlots.map((slot) => (
          <span key={`line-${slot}`}></span>
        ))}
      </div>

      <ul className='gantt__row-bars'>
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
});

const WeeklyView = memo(({ rowsForView, lineSlots, onEdit }) => {
  if (!rowsForView || rowsForView.length === 0) {
    return (
      <div className='p-5 text-center text-muted' role='status' aria-live='polite'>
        Tidak ada jadwal tersedia.
      </div>
    );
  }

  return (
    <>
      {rowsForView.map((row) => (
        <WeeklyRow 
          key={row.dateKey} 
          row={row} 
          lineSlots={lineSlots}
          onEdit={onEdit}
        />
      ))}
    </>
  );
});

WeeklyView.displayName = 'WeeklyView';

export default WeeklyView;
