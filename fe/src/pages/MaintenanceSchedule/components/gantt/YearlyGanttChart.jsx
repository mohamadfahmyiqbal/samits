import React, { useMemo } from 'react';
import { FaBuilding, FaUserAlt } from 'react-icons/fa';
import { MONTH_COLUMNS } from './MONTHS';

const YearlyGanttChart = ({
 headerColumns = MONTH_COLUMNS,
 rowsForView = [],
 lineSlots = [],
 onEdit,
 overlayBookings = [],
}) => {
 const slotCount = Math.max(headerColumns.length, 1);
 const columnTemplate = `120px repeat(${slotCount}, minmax(90px, 1fr))`;
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
    Tidak ada jadwal tahunan tersedia.
   </div>
  );
 }

 return (
  <div className="yearly-gantt-container">
   <div
    className="gantt__grid"
    style={{ '--gantt-column-template': columnTemplate }}
   >
    <div className="gantt__row gantt__row--months">
     <div className="gantt__row-first">
      <div className="date-display">
       <div className="fw-bold">WEEK</div>
      </div>
     </div>

     {headerColumns.map((month, idx) => (
      <div
       key={`month-${month.key ?? idx}`}
       className="gantt__header-cell"
      >
       {month.label}
      </div>
     ))}
    </div>

    <div className="gantt__row-body">
     <div className="gantt__row-wrapper" style={wrapperStyle}>
      {rowsForView.map((row) => {
       return (
        <div
         key={row.weekKey || row.dateKey}
         className="gantt__row"
        >
         <div className="gantt__row-first">
          <div className="date-display">
           <div className="fw-bold">
            {row.weekLabel || '--'}
           </div>
          </div>
         </div>

         <div
          className="gantt__row--lines"
          aria-hidden="true"
         >
          {normalizedLineSlots.map((slotIndex) => (
           <span
            key={`slot-${row.weekKey}-${slotIndex}`}
           />
          ))}
         </div>
        </div>
       );
      })}

      {overlayBookings.length > 0 && (
       <ul
        className="gantt__row-bars gantt__row-bars--overlay"
        style={overlayStyle}
       >
        {overlayBookings.map((booking, index) => {
         const rowStart = booking.rowStart ?? 1;
         const rowEnd = booking.rowEnd ?? rowStart + 1;

         const columnStart = Math.max(
          2,
          Math.min(slotCount + 1, booking.min ?? 2)
         );

         const columnEnd = Math.max(
          columnStart + 1,
          Math.min(
           slotCount + 2,
           booking.max ?? columnStart + 1
          )
         );

         return (
          <li
           key={`${booking.id ?? ''}-${index}`}
           className={`booking-item-card ${booking.bookStatus || 'available'
            }`}
           style={{
            gridRow: `${rowStart} / ${rowEnd}`,
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

export default YearlyGanttChart;