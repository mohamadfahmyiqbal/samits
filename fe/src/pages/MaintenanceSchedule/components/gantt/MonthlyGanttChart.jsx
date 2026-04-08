import React, { useMemo } from 'react';
import { FaBuilding, FaUserAlt } from 'react-icons/fa';

const MonthlyGanttChart = ({
 headerColumns = [],
 rowsForView = [],
 lineSlots = [],
 overlayBookings = [],
 onEdit,
}) => {
 const slotCount = Math.max(headerColumns.length, 1);
 const columnTemplate = `80px repeat(${slotCount}, minmax(120px, 1fr))`;

 const normalizedLineSlots =
  Array.isArray(lineSlots) && lineSlots.length
   ? lineSlots
   : [...Array(slotCount).keys()];

 const rowCount = rowsForView.length;

 const wrapperStyle = useMemo(
  () => ({
   '--gantt-row-count': rowCount,
   '--gantt-slot-count': slotCount,
  }),
  [rowCount, slotCount],
 );

 const overlayStyle = useMemo(
  () => ({
   '--gantt-row-count': rowCount,
  }),
  [rowCount],
 );

 if (!rowsForView.length) {
  return (
   <div className="p-5 text-center text-muted">
    Belum ada jadwal bulanan.
   </div>
  );
 }

 return (
  <div className="monthly-gantt-chart">
   <div
    className="gantt__grid"
    style={{ '--gantt-column-template': columnTemplate }}
   >
    <div className="gantt__row gantt__row--months">
     <div className="gantt__row-first">
      <div className="date-display">
       <div className="fw-bold">TANGGAL</div>
      </div>
     </div>

     {headerColumns.map((week, idx) => (
      <div
       key={`week-${week.key ?? idx}`}
       className="gantt__header-cell"
      >
       {week.label}
      </div>
     ))}
    </div>

    <div className="gantt__row-body">
     <div className="gantt__row-wrapper" style={wrapperStyle}>
      {rowsForView.map((row) => {
       const bookings = Array.isArray(row.bookingObj?.data)
        ? row.bookingObj.data
        : [];

       return (
        <div key={row.dateKey} className="gantt__row">
         <div className="gantt__row-first">
          <div className="date-display">
           <div className="fw-bold">
            {row.dayNumber || '--'}
           </div>
           <div className="small">
            {row.monthLabel || ''}
           </div>
          </div>
         </div>

         <div className="gantt__row--lines">
          {normalizedLineSlots.map((slot, index) => {
           const slotKey =
            typeof slot === 'object'
             ? slot.key ?? index
             : slot;

           return (
            <span
             key={`slot-${row.dateKey}-${slotKey}`}
            />
           );
          })}
         </div>

         {!bookings.length && (
          <div
           className="gantt__no-schedule"
           style={{
            gridColumn: `2 / span ${slotCount}`,
           }}
          >
           Tidak ada jadwal
          </div>
         )}
        </div>
       );
      })}

      {overlayBookings.length > 0 && (
       <ul
        className="gantt__row-bars gantt__row-bars--overlay"
        style={overlayStyle}
       >
        {overlayBookings.map((booking, index) => {
         const columnStart = booking.min ?? 2;
         const columnEnd =
          booking.max ??
          columnStart + 1;

         return (
          <li
           key={`${booking.id ?? ''}-${index}`}
           className={`booking-item-card ${booking.bookStatus || 'available'
            }`}
           style={{
            gridRow: `${booking.rowStart} / ${booking.rowEnd}`,
            gridColumn: `${columnStart} / ${columnEnd}`,
           }}
           onClick={() =>
            onEdit?.(
             booking.originalData || booking
            )
           }
          >
           <div className="booking-inner-content h-100 d-flex flex-column">
            <div className="booking-title text-truncate fw-bold mb-1">
             {booking.planName ||
              booking.subject ||
              'Maintenance'}
            </div>

            <div className="booking-meta text-truncate">
             <FaUserAlt size={9} className="me-1" />
             {booking.pic || booking.team}
            </div>

            <div className="booking-meta text-truncate">
             <FaBuilding size={9} className="me-1" />
             {booking.hostname || booking.assetName}
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

export default MonthlyGanttChart;